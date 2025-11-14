# Phase 1: Code Preparation

## Goal
Modify the codebase to remove Replit-specific dependencies and implement AWS S3 for file storage, making it ready for containerization and AWS deployment.

---

## Todo List

### 1. Remove Replit Dependencies
- [ ] Remove Replit-specific Vite plugins
- [ ] Remove Replit Auth dependencies
- [ ] Update vite.config.ts
- [ ] Remove unused packages from package.json

### 2. Implement AWS S3 Storage
- [ ] Install AWS SDK for S3
- [ ] Create new S3 service module
- [ ] Replace Replit Object Storage with S3
- [ ] Update file upload routes
- [ ] Test S3 integration locally (LocalStack or AWS)

### 3. Environment Configuration
- [ ] Create .env.example file
- [ ] Document all environment variables
- [ ] Add environment validation
- [ ] Update configuration files

### 4. Production Optimizations
- [ ] Add health check endpoint
- [ ] Implement graceful shutdown
- [ ] Add request logging
- [ ] Optimize build configuration
- [ ] Add compression middleware

### 5. Security Enhancements
- [ ] Add helmet.js for security headers
- [ ] Implement rate limiting
- [ ] Add CORS configuration
- [ ] Secure session configuration
- [ ] Add input validation

### 6. Testing
- [ ] Test build process locally
- [ ] Verify all routes work
- [ ] Test file uploads
- [ ] Check database connections
- [ ] Validate environment variables

---

## Detailed Steps

### Step 1: Remove Replit Dependencies

#### 1.1 Update package.json

Remove Replit-specific packages:

```bash
npm uninstall @replit/vite-plugin-cartographer \
             @replit/vite-plugin-runtime-error-modal \
             @replit/object-storage
```

#### 1.2 Update vite.config.ts

Replace the current configuration:

**File:** `vite.config.ts`

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'wouter'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
```

#### 1.3 Remove Replit Auth

**File:** `server/auth.ts`

Remove or comment out Replit-specific auth imports:

```typescript
// Remove this line if it exists:
// import { replitAuth } from "./replitAuth";
```

### Step 2: Implement AWS S3 Storage

#### 2.1 Install AWS SDK

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
npm install --save-dev @types/node
```

#### 2.2 Create S3 Service Module

**File:** `server/s3Service.ts` (new file)

```typescript
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import path from "path";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  // Credentials are automatically loaded from:
  // 1. Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
  // 2. IAM role (when running on ECS)
  // 3. AWS credentials file
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET;

if (!BUCKET_NAME) {
  console.warn("AWS_S3_BUCKET environment variable not set");
}

interface UploadResult {
  url: string;
  key: string;
}

/**
 * Upload a file to S3
 * @param buffer File buffer
 * @param originalFilename Original filename
 * @param folder Folder prefix (e.g., 'icon', 'hero', 'screenshot')
 * @returns Upload result with URL and key
 */
export async function uploadToS3(
  buffer: Buffer,
  originalFilename: string,
  folder: string = "uploads"
): Promise<UploadResult> {
  if (!BUCKET_NAME) {
    throw new Error("S3 bucket not configured");
  }

  // Generate unique filename
  const ext = path.extname(originalFilename);
  const filename = `${folder}/${uuidv4()}${ext}`;

  // Determine content type
  const contentType = getContentType(ext);

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: filename,
    Body: buffer,
    ContentType: contentType,
    // Make objects publicly readable (optional - can use signed URLs instead)
    // ACL: 'public-read',
  });

  await s3Client.send(command);

  // Generate public URL
  const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${filename}`;

  return { url, key: filename };
}

/**
 * Get a file from S3
 * @param key S3 object key
 * @returns File buffer or null if not found
 */
export async function getFileFromS3(key: string): Promise<Buffer | null> {
  if (!BUCKET_NAME) {
    throw new Error("S3 bucket not configured");
  }

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);

    if (!response.Body) {
      return null;
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as any) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  } catch (error: any) {
    if (error.name === "NoSuchKey") {
      return null;
    }
    throw error;
  }
}

/**
 * Delete a file from S3
 * @param key S3 object key
 */
export async function deleteFromS3(key: string): Promise<void> {
  if (!BUCKET_NAME) {
    throw new Error("S3 bucket not configured");
  }

  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Check if a file exists in S3
 * @param key S3 object key
 * @returns true if file exists
 */
export async function fileExistsInS3(key: string): Promise<boolean> {
  if (!BUCKET_NAME) {
    throw new Error("S3 bucket not configured");
  }

  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error: any) {
    if (error.name === "NotFound") {
      return false;
    }
    throw error;
  }
}

/**
 * Generate a presigned URL for temporary access
 * @param key S3 object key
 * @param expiresIn Expiration time in seconds (default: 1 hour)
 * @returns Presigned URL
 */
export async function getPresignedUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  if (!BUCKET_NAME) {
    throw new Error("S3 bucket not configured");
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Extract S3 key from URL
 * @param url Full S3 URL
 * @returns S3 key or null
 */
export function extractS3KeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    // Handle both path-style and virtual-hosted-style URLs
    const pathname = urlObj.pathname;
    return pathname.startsWith('/') ? pathname.slice(1) : pathname;
  } catch {
    return null;
  }
}

/**
 * Get content type from file extension
 */
function getContentType(ext: string): string {
  const contentTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
  };

  return contentTypes[ext.toLowerCase()] || 'application/octet-stream';
}
```

#### 2.3 Replace Object Storage in routes.ts

Update `server/routes.ts` to use S3 instead of Replit Object Storage:

**Find and replace:**

```typescript
// OLD:
import { uploadToObjectStorage, deleteFromObjectStorage, getFileFromObjectStorage, extractFilenameFromUrl } from "./objectStorage";

// NEW:
import { uploadToS3, deleteFromS3, getFileFromS3, extractS3KeyFromUrl } from "./s3Service";
```

**Update upload endpoints:**

```typescript
// Example: Update icon upload (around line 186-211)
app.post("/api/projects/:id/upload-icon", requireAdmin, upload.single('icon'), async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: "No icon file provided" });
    }

    // Upload to S3 (changed from uploadToObjectStorage)
    const { url: iconUrl } = await uploadToS3(
      req.file.buffer,
      req.file.originalname,
      'icon'
    );

    const project = await storage.updateProject(id, { iconUrl });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({ iconUrl, project });
  } catch (error) {
    console.error("Error uploading project icon:", error);
    res.status(500).json({ error: "Failed to upload project icon" });
  }
});
```

**Update all file upload endpoints similarly:**
- `/api/projects/:id/upload-hero` (line ~214)
- `/api/projects/:id/upload-screenshots` (line ~242)

**Update delete endpoints:**

```typescript
// Update screenshot deletion (around line 276-306)
app.delete("/api/projects/:id/screenshots/:screenshotIndex", requireAdmin, async (req, res) => {
  try {
    const { id, screenshotIndex } = req.params;
    const index = parseInt(screenshotIndex);

    const project = await storage.getProject(id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const screenshots = project.screenshotUrls || [];
    if (index < 0 || index >= screenshots.length) {
      return res.status(400).json({ error: "Invalid screenshot index" });
    }

    // Delete file from S3
    const screenshotUrl = screenshots[index];
    const key = extractS3KeyFromUrl(screenshotUrl);
    if (key) {
      await deleteFromS3(key);
    }

    // Remove from array
    const updatedScreenshots = screenshots.filter((_, i) => i !== index);
    const updatedProject = await storage.updateProject(id, { screenshotUrls: updatedScreenshots });

    res.json({ project: updatedProject });
  } catch (error) {
    console.error("Error deleting project screenshot:", error);
    res.status(500).json({ error: "Failed to delete project screenshot" });
  }
});
```

**Update file serving endpoint:**

```typescript
// Update file serving (around line 461-497)
app.get('/api/files/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const fileBuffer = await getFileFromS3(filename);

    if (!fileBuffer) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Set appropriate content type based on file extension
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
    res.set('Cache-Control', 'public, max-age=31536000');
    res.send(fileBuffer);
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ error: 'Failed to serve file' });
  }
});
```

#### 2.4 Remove/Archive old objectStorage.ts

```bash
# Move to archive instead of deleting (for reference)
mkdir -p server/archive
mv server/objectStorage.ts server/archive/objectStorage.ts.old
```

### Step 3: Environment Configuration

#### 3.1 Create .env.example

**File:** `.env.example`

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/portfolio

# Server Configuration
PORT=5000
NODE_ENV=development

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# AWS Configuration
AWS_REGION=us-east-1
AWS_S3_BUCKET=my-portfolio-uploads

# AWS Credentials (only needed for local development)
# In production, use IAM roles instead
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Optional: Enable debug logging
DEBUG=false
```

#### 3.2 Update .gitignore

Ensure sensitive files are not committed:

```bash
# Add to .gitignore if not already present
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore
echo "*.log" >> .gitignore
```

#### 3.3 Add Environment Validation

**File:** `server/config.ts` (new file)

```typescript
import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // Server
  PORT: z.string().default("5000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Session
  SESSION_SECRET: z.string().min(32, "Session secret must be at least 32 characters"),

  // AWS
  AWS_REGION: z.string().default("us-east-1"),
  AWS_S3_BUCKET: z.string().min(1, "S3 bucket name is required"),

  // Optional AWS credentials (not needed when using IAM roles)
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),

  // CORS
  CORS_ORIGIN: z.string().default("*"),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Environment validation failed:");
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

export const config = validateEnv();
```

#### 3.4 Update server/index.ts

Add environment validation at the top:

```typescript
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { config } from "./config"; // Add this import

// Validate environment on startup
console.log("🔍 Validating environment variables...");
console.log(`✅ Environment validated. Running in ${config.NODE_ENV} mode`);

const app = express();
// ... rest of the file
```

### Step 4: Production Optimizations

#### 4.1 Add Health Check Endpoint

**File:** `server/routes.ts`

Add before the return statement (around line 650):

```typescript
// Health check endpoint for load balancer
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Detailed health check (optional)
app.get("/health/detailed", async (req, res) => {
  const checks = {
    database: false,
    storage: false,
  };

  // Check database connection
  try {
    await storage.getAllProjects(); // Simple query
    checks.database = true;
  } catch (error) {
    console.error("Database health check failed:", error);
  }

  // Check S3 access
  try {
    // You can add a specific S3 check here if needed
    checks.storage = true;
  } catch (error) {
    console.error("Storage health check failed:", error);
  }

  const isHealthy = checks.database && checks.storage;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "healthy" : "unhealthy",
    checks,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
```

#### 4.2 Implement Graceful Shutdown

**File:** `server/index.ts`

Update the server startup section:

```typescript
(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || '5000', 10);
  const httpServer = server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    log(`${signal} received, starting graceful shutdown...`);

    httpServer.close(() => {
      log("HTTP server closed");
    });

    // Give active connections 10 seconds to finish
    setTimeout(() => {
      log("Forcing shutdown");
      process.exit(0);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
})();
```

#### 4.3 Add Compression Middleware

```bash
npm install compression
npm install --save-dev @types/compression
```

**File:** `server/index.ts`

```typescript
import compression from "compression";

const app = express();
app.use(compression()); // Add after creating app
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
```

#### 4.4 Add Security Middleware

```bash
npm install helmet
npm install express-rate-limit
```

**File:** `server/index.ts`

```typescript
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable if using inline scripts
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", limiter);

// Stricter rate limit for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts, please try again later.",
});

// Apply to auth routes in routes.ts
```

### Step 5: Update Build Scripts

#### 5.1 Optimize package.json scripts

**File:** `package.json`

```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "check": "tsc --noEmit",
    "db:push": "drizzle-kit push",
    "db:migrate": "drizzle-kit migrate",
    "test": "echo \"No tests yet\" && exit 0"
  }
}
```

### Step 6: Testing

#### 6.1 Local Build Test

```bash
# Clean previous builds
rm -rf dist

# Run build
npm run build

# Check output
ls -la dist/
ls -la dist/public/

# Should see:
# dist/
#   index.js (server bundle)
#   public/ (client assets)
```

#### 6.2 Test with Local Environment

Create `.env.local`:

```bash
cp .env.example .env.local
# Edit .env.local with your local values
```

Start the application:

```bash
# Development mode
npm run dev

# Production mode (after build)
npm start
```

Test endpoints:

```bash
# Health check
curl http://localhost:5000/health

# API endpoints
curl http://localhost:5000/api/projects
```

---

## Outcome

After completing this phase, you should have:

### ✅ Completed Deliverables

1. **Code Changes**
   - ✅ Replit dependencies removed
   - ✅ AWS S3 integration implemented
   - ✅ Environment validation added
   - ✅ Health check endpoints created
   - ✅ Graceful shutdown implemented
   - ✅ Security middleware added

2. **Configuration Files**
   - ✅ `.env.example` created
   - ✅ `server/config.ts` created
   - ✅ `server/s3Service.ts` created
   - ✅ Updated `vite.config.ts`
   - ✅ Updated `package.json`

3. **Testing Results**
   - ✅ Local build successful
   - ✅ Application starts without errors
   - ✅ Health check endpoint responds
   - ✅ Environment validation works

### ✅ Validation Checklist

```bash
# 1. Build succeeds
npm run build
# Should complete without errors

# 2. TypeScript check passes
npm run check
# Should show no errors

# 3. Application starts
npm start
# Should show: "serving on port 5000"

# 4. Health check works
curl http://localhost:5000/health
# Should return: {"status":"healthy",...}

# 5. API works
curl http://localhost:5000/api/projects
# Should return projects array
```

### 📊 Files Modified/Created

**Modified:**
- `server/index.ts`
- `server/routes.ts`
- `vite.config.ts`
- `package.json`

**Created:**
- `server/config.ts`
- `server/s3Service.ts`
- `.env.example`
- `docs/` (this documentation)

**Removed:**
- `@replit/*` packages
- `server/objectStorage.ts` (archived)

---

## Next Steps

Once all validations pass, proceed to:
**[Phase 2: Docker Setup →](./03-docker-setup.md)**

---

## Troubleshooting

### Build Errors

**Problem**: TypeScript errors after removing Replit packages
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### S3 Connection Issues

**Problem**: Cannot connect to S3 locally
```bash
# Use LocalStack for local S3 testing
docker run -d -p 4566:4566 localstack/localstack

# Update .env.local
AWS_ENDPOINT=http://localhost:4566
```

### Environment Validation Fails

**Problem**: Missing required environment variables
```bash
# Check which variables are missing
node -e "require('./dist/config.js')"

# Copy from example and fill in
cp .env.example .env.local
```
