import { Client } from '@replit/object-storage';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

// Initialize the object storage client with bucket configuration
let storage: Client;

async function initializeStorage() {
  if (!storage) {
    storage = new Client({ bucketId: 'project-images' });
  }
  return storage;
}

export interface UploadResult {
  url: string;
  filename: string;
}

// Upload a file to object storage
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
    
    // Upload to object storage using uploadFromBytes
    const { ok, error } = await client.uploadFromBytes(filename, fileBuffer);
    
    if (!ok) {
      throw new Error(`Upload failed: ${error}`);
    }
    
    // For Replit object storage, the URL points to our API endpoint
    const url = `/api/files/${filename}`;
    
    return { url, filename };
  } catch (error) {
    console.error('Error uploading to object storage:', error);
    throw new Error('Failed to upload file to object storage');
  }
}

// Delete a file from object storage
export async function deleteFromObjectStorage(filename: string): Promise<void> {
  try {
    const client = await initializeStorage();
    const { ok, error } = await client.delete(filename);
    if (!ok) {
      console.error('Delete failed:', error);
    }
  } catch (error) {
    console.error('Error deleting from object storage:', error);
    // Don't throw here to avoid breaking the main operation
  }
}

// Get a file from object storage
export async function getFileFromObjectStorage(filename: string): Promise<Buffer | null> {
  try {
    const client = await initializeStorage();
    const { ok, value, error } = await client.downloadAsBytes(filename);
    if (!ok) {
      console.error('Download failed:', error);
      return null;
    }
    return value[0];
  } catch (error) {
    console.error('Error downloading from object storage:', error);
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