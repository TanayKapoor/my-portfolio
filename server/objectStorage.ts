import { Client } from '@replit/object-storage';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import path from 'path';
import fs from 'fs';

// Initialize the object storage client with bucket configuration
let storage: Client | null = null;
let isObjectStorageAvailable = false;

async function initializeStorage() {
  if (!storage && !isObjectStorageAvailable) {
    try {
      storage = new Client();
      // Test if object storage is working by trying to list
      const testResult = await storage.list();
      if (testResult.ok) {
        isObjectStorageAvailable = true;
        console.log('Object storage initialized successfully');
      } else {
        console.log('Object storage not available, falling back to local storage');
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

export interface UploadResult {
  url: string;
  filename: string;
}

// Upload a file to storage (object storage or local fallback)
export async function uploadToObjectStorage(
  fileBuffer: Buffer,
  originalName: string,
  fileType: 'icon' | 'hero' | 'screenshot'
): Promise<UploadResult> {
  try {
    const client = await initializeStorage();
    
    // Generate a unique filename
    const extension = extname(originalName);
    const filename = `${fileType}-${Date.now()}-${Math.floor(Math.random() * 1000000000)}${extension}`;
    
    if (client && isObjectStorageAvailable) {
      // Use object storage
      const { ok, error } = await client.uploadFromBytes(filename, fileBuffer);
      
      if (!ok) {
        console.error('Upload failed with error:', error);
        // Fall back to local storage
        return await uploadToLocalStorage(fileBuffer, filename);
      }
      
      const url = `/api/files/${filename}`;
      return { url, filename };
    } else {
      // Fall back to local storage
      return await uploadToLocalStorage(fileBuffer, filename);
    }
  } catch (error) {
    console.error('Error uploading to object storage, falling back to local:', error);
    // Fall back to local storage
    const extension = extname(originalName);
    const filename = `${fileType}-${Date.now()}-${Math.floor(Math.random() * 1000000000)}${extension}`;
    return await uploadToLocalStorage(fileBuffer, filename);
  }
}

// Local storage fallback
async function uploadToLocalStorage(fileBuffer: Buffer, filename: string): Promise<UploadResult> {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  const filePath = path.join(uploadsDir, filename);
  fs.writeFileSync(filePath, fileBuffer);
  
  const url = `/uploads/${filename}`;
  return { url, filename };
}

// Delete a file from storage
export async function deleteFromObjectStorage(filename: string): Promise<void> {
  try {
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
  } catch (error) {
    console.error('Error deleting from storage:', error);
    // Don't throw here to avoid breaking the main operation
  }
}

// Get a file from storage
export async function getFileFromObjectStorage(filename: string): Promise<Buffer | null> {
  try {
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
  } catch (error) {
    console.error('Error downloading from storage:', error);
    return null;
  }
}

// Get content type based on file extension
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

// Extract filename from URL for deletion
export function extractFilenameFromUrl(url: string): string | null {
  try {
    // For object storage URLs, the filename is typically the last part
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 1];
  } catch {
    return null;
  }
}