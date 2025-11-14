# File Upload System Documentation

Complete guide to file upload, storage, and management system.

## Overview

The file upload system supports:
- **Project Icons** - Logo/icon for projects
- **Hero Images** - Banner images for project cards
- **Screenshots** - Multiple project screenshots

**Storage Options:**
1. **Replit Object Storage** (Primary)
2. **Local Filesystem** (Fallback)

**Upload Library:** Multer (memory storage)
**Supported Formats:** Images only (JPEG, PNG, GIF, WebP)
**File Size Limit:** 10MB per file

---

## Architecture

```
┌──────────────────┐
│  Client Upload   │
│  (multipart/form)│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Multer Handler  │ ← Memory storage
│  (validation)    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Object Storage  │ ← Replit Object Storage
│  or Local FS     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  URL Generation  │ ← /api/files/:filename
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Database Update │ ← Store URL in projects table
└──────────────────┘
```

---

## Multer Configuration

### File: `server/routes.ts`

```typescript
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});
```

**Features:**
- Memory storage (no disk writes before processing)
- 10MB file size limit
- Image-only filter (MIME type validation)
- File buffer available in `req.file.buffer`

---

## Object Storage

### File: `server/objectStorage.ts`

### Initialization

```typescript
let storage: Client | null = null;
let isObjectStorageAvailable = false;

async function initializeStorage() {
  if (!storage && !isObjectStorageAvailable) {
    try {
      storage = new Client();
      const testResult = await storage.list();
      if (testResult.ok) {
        isObjectStorageAvailable = true;
        console.log('Object storage initialized successfully');
      } else {
        storage = null;
        isObjectStorageAvailable = false;
      }
    } catch (error) {
      console.log('Object storage not available, falling back to local storage');
      storage = null;
      isObjectStorageAvailable = false;
    }
  }
  return storage;
}
```

**Graceful Degradation:**
- Tests object storage availability on startup
- Falls back to local filesystem if unavailable
- No errors thrown to client
- Transparent to application

---

### Upload Function

```typescript
export async function uploadToObjectStorage(
  fileBuffer: Buffer,
  originalName: string,
  fileType: 'icon' | 'hero' | 'screenshot'
): Promise<UploadResult>
```

**Parameters:**
- `fileBuffer` - File contents as Buffer
- `originalName` - Original filename (for extension)
- `fileType` - Type of upload (affects filename prefix)

**Returns:**
```typescript
{
  url: string,      // URL to access the file
  filename: string  // Generated filename
}
```

**Filename Generation:**
```typescript
const extension = extname(originalName);
const filename = `${fileType}-${Date.now()}-${Math.floor(Math.random() * 1000000000)}${extension}`;
```

**Example filenames:**
- `icon-1699564800000-123456789.png`
- `hero-1699564800000-987654321.jpg`
- `screenshot-1699564800000-456789123.webp`

---

### Storage Flow

```typescript
if (client && isObjectStorageAvailable) {
  // Upload to object storage
  const { ok, error } = await client.uploadFromBytes(filename, fileBuffer);

  if (!ok) {
    // Fall back to local storage
    return await uploadToLocalStorage(fileBuffer, filename);
  }

  const url = `/api/files/${filename}`;
  return { url, filename };
} else {
  // Use local storage
  return await uploadToLocalStorage(fileBuffer, filename);
}
```

---

### Local Storage Fallback

```typescript
async function uploadToLocalStorage(fileBuffer: Buffer, filename: string): Promise<UploadResult> {
  const uploadsDir = path.join(process.cwd(), 'uploads');

  // Create uploads directory if it doesn't exist
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filePath = path.join(uploadsDir, filename);
  fs.writeFileSync(filePath, fileBuffer);

  const url = `/uploads/${filename}`;
  return { url, filename };
}
```

**Features:**
- Auto-creates `uploads/` directory
- Writes buffer directly to disk
- Returns local URL path

---

## Upload Endpoints

### Upload Project Icon

**Endpoint:** `POST /api/projects/:id/upload-icon`

**Authentication:** Admin required

**Form Data:**
```
icon: File (image)
```

**Process:**
1. Validate admin authentication
2. Check file exists in request
3. Upload to storage
4. Update project record with iconUrl
5. Return updated project

**Example Request:**
```bash
curl -X POST http://localhost:5000/api/projects/123/upload-icon \
  -H "Cookie: connect.sid=..." \
  -F "icon=@/path/to/icon.png"
```

**Response:**
```json
{
  "iconUrl": "/api/files/icon-1699564800000-123456789.png",
  "project": { ... }
}
```

---

### Upload Hero Image

**Endpoint:** `POST /api/projects/:id/upload-hero`

**Authentication:** Admin required

**Form Data:**
```
hero: File (image)
```

**Process:**
Same as icon upload, but updates `heroImageUrl` field.

---

### Upload Screenshots

**Endpoint:** `POST /api/projects/:id/upload-screenshots`

**Authentication:** Admin required

**Form Data:**
```
screenshots: File[] (max 10 images)
```

**Process:**
1. Validate admin authentication
2. Check files exist (1-10 files)
3. Get current project
4. Upload all files to storage (parallel)
5. Append new URLs to existing screenshots
6. Update project record

**Code:**
```typescript
const uploadPromises = req.files.map(file =>
  uploadToObjectStorage(file.buffer, file.originalname, 'screenshot')
);

const uploadResults = await Promise.all(uploadPromises);
const screenshotUrls = uploadResults.map(result => result.url);

const existingScreenshots = currentProject.screenshotUrls || [];
const updatedScreenshots = [...existingScreenshots, ...screenshotUrls];

const project = await storage.updateProject(id, {
  screenshotUrls: updatedScreenshots
});
```

---

### Delete Screenshot

**Endpoint:** `DELETE /api/projects/:id/screenshots/:screenshotIndex`

**Authentication:** Admin required

**URL Parameters:**
- `id` - Project UUID
- `screenshotIndex` - Index of screenshot (0-based)

**Process:**
1. Get project
2. Validate index
3. Extract filename from URL
4. Delete from storage
5. Remove from array
6. Update project

---

### Delete All Screenshots

**Endpoint:** `DELETE /api/projects/:id/screenshots`

**Authentication:** Admin required

**Process:**
1. Get project
2. Delete all files from storage
3. Clear screenshots array
4. Update project

**Note:** Deletion is fire-and-forget to avoid breaking main operation.

---

### Reorder Screenshots

**Endpoint:** `PUT /api/projects/:id/reorder-screenshots`

**Authentication:** Admin required

**Request Body:**
```json
{
  "screenshotUrls": ["url1", "url2", "url3"]
}
```

**Validation:**
- Array length must match current screenshots
- All URLs must exist in current screenshots
- Order can be changed

---

## File Serving

### Endpoint: `GET /api/files/:filename`

**Authentication:** None (public)

**Process:**
1. Extract filename from URL
2. Fetch from object storage or local filesystem
3. Detect content type from extension
4. Set cache headers (1 year)
5. Return file buffer

**Code:**
```typescript
app.get('/api/files/:filename', async (req, res) => {
  const { filename } = req.params;
  const fileBuffer = await getFileFromObjectStorage(filename);

  if (!fileBuffer) {
    return res.status(404).json({ error: 'File not found' });
  }

  const ext = path.extname(filename).toLowerCase();
  let contentType = 'application/octet-stream';

  switch (ext) {
    case '.jpg':
    case '.jpeg':
      contentType = 'image/jpeg';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.gif':
      contentType = 'image/gif';
      break;
    case '.webp':
      contentType = 'image/webp';
      break;
  }

  res.set('Content-Type', contentType);
  res.set('Cache-Control', 'public, max-age=31536000'); // 1 year
  res.send(fileBuffer);
});
```

**Cache Strategy:**
- Files are immutable (unique filenames)
- Cache for 1 year
- Public caching allowed

---

## File Retrieval

### From Object Storage

```typescript
export async function getFileFromObjectStorage(filename: string): Promise<Buffer | null> {
  const client = await initializeStorage();

  if (client && isObjectStorageAvailable) {
    const { ok, value, error } = await client.downloadAsBytes(filename);
    if (!ok) {
      console.error('Download failed:', error);
      return null;
    }
    return value[0];
  } else {
    // Get from local storage
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const filePath = path.join(uploadsDir, filename);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath);
    }
    return null;
  }
}
```

---

## File Deletion

### From Object Storage

```typescript
export async function deleteFromObjectStorage(filename: string): Promise<void> {
  const client = await initializeStorage();

  if (client && isObjectStorageAvailable) {
    const { ok, error } = await client.delete(filename);
    if (!ok) {
      console.error('Delete failed:', error);
    }
  } else {
    // Delete from local storage
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const filePath = path.join(uploadsDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
```

**Error Handling:**
- Errors are logged but not thrown
- Prevents breaking main operations
- Fire-and-forget approach

---

## Utility Functions

### Extract Filename from URL

```typescript
export function extractFilenameFromUrl(url: string): string | null {
  try {
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 1];
  } catch {
    return null;
  }
}
```

**Usage:**
```typescript
const url = "/api/files/icon-1699564800000-123456789.png";
const filename = extractFilenameFromUrl(url);
// Returns: "icon-1699564800000-123456789.png"
```

---

## Content Type Detection

```typescript
function getContentType(extension: string): string {
  const ext = extension.toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    case '.webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
}
```

---

## Security Considerations

### Implemented

✅ **File type validation** (images only)
✅ **File size limits** (10MB)
✅ **Admin-only uploads**
✅ **Unique filenames** (prevents overwrites)
✅ **MIME type checking**
✅ **Safe filename generation** (no user input in filenames)

### Recommended for Production

⚠️ **Image validation** - Verify actual image content (not just MIME)
⚠️ **Virus scanning** - Scan uploaded files
⚠️ **Rate limiting** - Prevent upload abuse
⚠️ **Storage quotas** - Limit total storage per user/project
⚠️ **CDN integration** - Use CDN for file serving
⚠️ **Image optimization** - Compress/resize on upload
⚠️ **Backup strategy** - Regular backups of object storage

---

## Error Handling

### Upload Errors

```typescript
try {
  const { url: iconUrl } = await uploadToObjectStorage(
    req.file.buffer,
    req.file.originalname,
    'icon'
  );
  // Success
} catch (error) {
  console.error("Error uploading project icon:", error);
  res.status(500).json({ error: "Failed to upload project icon" });
}
```

### Common Errors

**400 Bad Request:**
- No file provided
- Invalid file type
- File too large

**404 Not Found:**
- Project not found
- File not found

**500 Internal Server Error:**
- Storage system failure
- Database update failure

---

## Storage Comparison

### Object Storage (Replit)

**Pros:**
- Serverless (no disk management)
- Scales automatically
- Persistent across deployments
- Built-in redundancy

**Cons:**
- Requires Replit environment
- External dependency

### Local Filesystem

**Pros:**
- Simple implementation
- No external dependencies
- Works anywhere

**Cons:**
- Lost on redeployment
- Doesn't scale horizontally
- Manual backup needed
- Disk space limits

---

## Testing

### Upload Icon

```bash
# Create test image
echo "fake image content" > test-icon.png

# Upload
curl -X POST http://localhost:5000/api/projects/PROJECT_ID/upload-icon \
  -H "Cookie: connect.sid=SESSION_COOKIE" \
  -F "icon=@test-icon.png"
```

### Upload Multiple Screenshots

```bash
curl -X POST http://localhost:5000/api/projects/PROJECT_ID/upload-screenshots \
  -H "Cookie: connect.sid=SESSION_COOKIE" \
  -F "screenshots=@screenshot1.png" \
  -F "screenshots=@screenshot2.png" \
  -F "screenshots=@screenshot3.png"
```

### Retrieve File

```bash
curl http://localhost:5000/api/files/icon-1699564800000-123456789.png \
  --output downloaded-icon.png
```

---

## Frontend Integration

### Upload with FormData

```typescript
const formData = new FormData();
formData.append('icon', file);

const response = await fetch(`/api/projects/${projectId}/upload-icon`, {
  method: 'POST',
  credentials: 'include',
  body: formData,
});

const { iconUrl, project } = await response.json();
```

### Multiple File Upload

```typescript
const formData = new FormData();
files.forEach(file => {
  formData.append('screenshots', file);
});

const response = await fetch(`/api/projects/${projectId}/upload-screenshots`, {
  method: 'POST',
  credentials: 'include',
  body: formData,
});
```

---

## Database Schema Impact

### Projects Table Fields

```typescript
iconUrl: text("icon_url")              // Single icon URL
heroImageUrl: text("hero_image_url")   // Single hero image URL
screenshotUrls: text("screenshot_urls").array()  // Array of screenshot URLs
```

**URL Format:**
- Object Storage: `/api/files/filename.ext`
- Local Storage: `/uploads/filename.ext`

---

## Monitoring & Logging

### Upload Events

```typescript
console.log(`Uploaded ${fileType} for project ${projectId}: ${filename}`);
```

### Storage Initialization

```typescript
console.log('Object storage initialized successfully');
console.log('Object storage not available, falling back to local storage');
```

### Errors

```typescript
console.error('Upload failed with error:', error);
console.error('Delete failed:', error);
console.error('Download failed:', error);
```

---

## Future Enhancements

- Image compression/optimization on upload
- Thumbnail generation
- Support for video files
- Drag-and-drop reordering
- Bulk upload improvements
- Progress tracking for large uploads
- Image cropping/editing
- CDN integration
- Storage analytics
- Automatic cleanup of orphaned files
