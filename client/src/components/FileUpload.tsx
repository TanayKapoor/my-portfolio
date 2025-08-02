import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Image, FileImage, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Project } from '@shared/schema';

interface FileUploadProps {
  project: Project;
  type: 'icon' | 'screenshots';
  onUploadComplete?: () => void;
}

export default function FileUpload({ project, type, onUploadComplete }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dragOverItem, setDragOverItem] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData();
      
      if (type === 'icon') {
        formData.append('icon', files[0]);
        const response = await fetch(`/api/projects/${project.id}/upload-icon`, {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) throw new Error('Failed to upload icon');
        return response.json();
      } else {
        Array.from(files).forEach(file => {
          formData.append('screenshots', file);
        });
        const response = await fetch(`/api/projects/${project.id}/upload-screenshots`, {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) throw new Error('Failed to upload screenshots');
        return response.json();
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', project.id] });
      toast({ 
        title: `${type === 'icon' ? 'Icon' : 'Screenshots'} uploaded successfully!`,
        description: type === 'icon' ? 'Project icon updated' : `${data.screenshotUrls?.length || 0} screenshots added`
      });
      onUploadComplete?.();
    },
    onError: (error) => {
      toast({ 
        title: `Failed to upload ${type}`, 
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive' 
      });
    },
  });

  const deleteScreenshotMutation = useMutation({
    mutationFn: async (screenshotIndex: number) => {
      const response = await fetch(`/api/projects/${project.id}/screenshots/${screenshotIndex}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete screenshot');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', project.id] });
      toast({ title: 'Screenshot deleted successfully!' });
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to delete screenshot', 
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive' 
      });
    },
  });

  const reorderScreenshotsMutation = useMutation({
    mutationFn: async (newOrder: string[]) => {
      const response = await fetch(`/api/projects/${project.id}/reorder-screenshots`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ screenshotUrls: newOrder }),
      });
      if (!response.ok) throw new Error('Failed to reorder screenshots');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', project.id] });
      toast({ title: 'Screenshots reordered successfully!' });
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to reorder screenshots', 
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive' 
      });
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    if (type === 'icon' && files.length > 1) {
      toast({ 
        title: 'Multiple files selected', 
        description: 'Please select only one icon file',
        variant: 'destructive' 
      });
      return;
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
    const invalidFiles = Array.from(files).filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      toast({ 
        title: 'Invalid file type', 
        description: 'Please select only image files (jpg, png, gif, svg, webp)',
        variant: 'destructive' 
      });
      return;
    }

    // Validate file sizes (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    const oversizedFiles = Array.from(files).filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      toast({ 
        title: 'File too large', 
        description: 'Please select files smaller than 10MB',
        variant: 'destructive' 
      });
      return;
    }

    setUploading(true);
    uploadMutation.mutate(files, {
      onSettled: () => setUploading(false)
    });
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteScreenshot = (index: number) => {
    deleteScreenshotMutation.mutate(index);
  };

  // Drag and drop handlers for reordering screenshots
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverItem(index);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleScreenshotDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedItem === null || !project.screenshotUrls) return;
    
    if (draggedItem === dropIndex) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    const newOrder = [...project.screenshotUrls];
    const draggedUrl = newOrder[draggedItem];
    
    // Remove the dragged item
    newOrder.splice(draggedItem, 1);
    
    // Insert at new position
    const adjustedDropIndex = draggedItem < dropIndex ? dropIndex - 1 : dropIndex;
    newOrder.splice(adjustedDropIndex, 0, draggedUrl);
    
    reorderScreenshotsMutation.mutate(newOrder);
    setDraggedItem(null);
    setDragOverItem(null);
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium text-gray-300">
        {type === 'icon' ? 'Project Icon' : 'Project Screenshots'}
      </Label>
      
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive 
            ? 'border-blue-400 bg-blue-400/10' 
            : 'border-gray-600 hover:border-gray-500'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={type === 'screenshots'}
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
        
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="text-gray-300 mb-2">
            {type === 'icon' ? 'Upload project icon' : 'Upload project screenshots'}
          </div>
          <div className="text-sm text-gray-500 mb-4">
            Drag and drop or{' '}
            <button
              type="button"
              onClick={onButtonClick}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              browse files
            </button>
          </div>
          <div className="text-xs text-gray-600">
            Supports: JPG, PNG, GIF, SVG, WebP (max 10MB)
            {type === 'screenshots' && ' • Multiple files allowed'}
          </div>
        </div>
      </div>

      {uploading && (
        <div className="text-center text-blue-400">
          Uploading {type}...
        </div>
      )}

      {/* Current Files Display */}
      {type === 'icon' && project.iconUrl && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <img
                src={project.iconUrl}
                alt="Project icon"
                className="w-12 h-12 rounded-lg object-cover border border-gray-600"
              />
              <div className="flex-1">
                <div className="text-sm text-gray-300">Current Icon</div>
                <div className="text-xs text-gray-500">{project.iconUrl}</div>
              </div>
              <FileImage className="h-4 w-4 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      )}

      {type === 'screenshots' && project.screenshotUrls && project.screenshotUrls.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-300">
            Current Screenshots ({project.screenshotUrls.length})
            <span className="text-xs text-gray-500 ml-2">Drag to reorder</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {project.screenshotUrls.map((url, index) => (
              <Card 
                key={`${url}-${index}`} 
                className={`bg-gray-800/50 border-gray-700 relative group cursor-move transition-all duration-200 ${
                  draggedItem === index ? 'opacity-50 scale-95' : ''
                } ${
                  dragOverItem === index ? 'border-blue-400 bg-blue-400/10' : ''
                }`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onDrop={(e) => handleScreenshotDrop(e, index)}
              >
                <CardContent className="p-2">
                  <div className="relative">
                    <img
                      src={url}
                      alt={`Screenshot ${index + 1}`}
                      className="w-full h-24 rounded object-cover"
                    />
                    <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="h-4 w-4 text-white bg-black/50 rounded p-0.5" />
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteScreenshot(index)}
                      disabled={deleteScreenshotMutation.isPending}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 truncate">
                    Screenshot {index + 1}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}