import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit2, Trash2, Save, X, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import FileUpload from '@/components/FileUpload';
import type { Project, InsertProject } from '@shared/schema';

const colorThemes = [
  'blue', 'green', 'purple', 'orange', 'red', 'yellow', 'pink', 'indigo', 'cyan', 'emerald'
] as const;

const statusOptions = ['planning', 'in-progress', 'completed', 'on-hold'] as const;

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check - in production, this should be server-side
    if (password === 'admin123') {
      setIsAuthenticated(true);
      setPassword('');
      toast({ title: 'Access granted' });
    } else {
      toast({ title: 'Access denied', description: 'Invalid password', variant: 'destructive' });
    }
  };

  // Fetch all projects
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (data: InsertProject) => {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create project');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setIsCreating(false);
      toast({ title: 'Project created successfully!' });
    },
    onError: () => {
      toast({ title: 'Failed to create project', variant: 'destructive' });
    },
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertProject> }) => {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update project');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setEditingProject(null);
      toast({ title: 'Project updated successfully!' });
    },
    onError: () => {
      toast({ title: 'Failed to update project', variant: 'destructive' });
    },
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete project');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({ title: 'Project deleted successfully!' });
    },
    onError: () => {
      toast({ title: 'Failed to delete project', variant: 'destructive' });
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const data: InsertProject = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      technologies: (formData.get('technologies') as string).split(',').map(t => t.trim()),
      features: (formData.get('features') as string).split('\n').filter(f => f.trim()),
      challenges: (formData.get('challenges') as string).split('\n').filter(c => c.trim()),
      results: (formData.get('results') as string || '').split('\n').filter(r => r.trim()),
      duration: formData.get('duration') as string || null,
      role: formData.get('role') as string || null,
      status: formData.get('status') as string || null,
      demoUrl: formData.get('demoUrl') as string || null,
      githubUrl: formData.get('githubUrl') as string || null,
      colorTheme: formData.get('colorTheme') as string,
      order: parseInt(formData.get('order') as string) || 0,
    };

    if (editingProject) {
      updateProjectMutation.mutate({ id: editingProject.id, data });
    } else {
      createProjectMutation.mutate(data);
    }
  };

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-gray-800/50 border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-white flex items-center justify-center gap-2">
              <Lock className="w-5 h-5" />
              Admin Access
            </CardTitle>
            <CardDescription className="text-gray-400">
              Enter password to access admin panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="password" className="text-white">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Enter admin password"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Access Admin Panel
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
            <p className="text-gray-400">Manage your portfolio projects</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setIsAuthenticated(false)}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Logout
          </Button>
        </div>

        <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">All Projects</h2>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Project
              </Button>
            </div>

            <div className="grid gap-4">
              {projects.map((project) => (
                <Card key={project.id} className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white">{project.title}</CardTitle>
                        <CardDescription className="text-gray-400">
                          {project.description}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingProject(project)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteProjectMutation.mutate(project.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.map((tech) => (
                        <Badge key={tech} variant="secondary">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-4 text-sm text-gray-400">
                      <span>Status: {project.status}</span>
                      <span>Duration: {project.duration}</span>
                      <span>Role: {project.role}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
        </div>

        {/* Edit Modal */}
        {editingProject && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold text-white mb-4">Edit Project</h2>
              <ProjectForm
                project={editingProject}
                onSubmit={handleSubmit}
                onCancel={() => setEditingProject(null)}
                isSubmitting={updateProjectMutation.isPending}
              />
            </div>
          </div>
        )}

        {/* Create Modal */}
        {isCreating && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold text-white mb-4">Create New Project</h2>
              <ProjectForm
                project={null}
                onSubmit={handleSubmit}
                onCancel={() => setIsCreating(false)}
                isSubmitting={createProjectMutation.isPending}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectForm({
  project,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  project: Project | null;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">
          {project ? 'Edit Project' : 'Create New Project'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title" className="text-white">Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={project?.title}
                required
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="order" className="text-white">Order</Label>
              <Input
                id="order"
                name="order"
                type="number"
                defaultValue={project?.order}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-white">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={project?.description}
              required
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div>
            <Label htmlFor="technologies" className="text-white">Technologies (comma-separated)</Label>
            <Input
              id="technologies"
              name="technologies"
              defaultValue={project?.technologies.join(', ')}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div>
            <Label htmlFor="features" className="text-white">Features (one per line)</Label>
            <Textarea
              id="features"
              name="features"
              defaultValue={project?.features.join('\n')}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div>
            <Label htmlFor="challenges" className="text-white">Challenges (one per line)</Label>
            <Textarea
              id="challenges"
              name="challenges"
              defaultValue={project?.challenges.join('\n')}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div>
            <Label htmlFor="results" className="text-white">Results (one per line)</Label>
            <Textarea
              id="results"
              name="results"
              defaultValue={project?.results.join('\n')}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration" className="text-white">Duration</Label>
              <Input
                id="duration"
                name="duration"
                defaultValue={project?.duration || ""}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="role" className="text-white">Role</Label>
              <Input
                id="role"
                name="role"
                defaultValue={project?.role || ""}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status" className="text-white">Status</Label>
              <Select name="status" defaultValue={project?.status || undefined}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="colorTheme" className="text-white">Color Theme</Label>
              <Select name="colorTheme" defaultValue={project?.colorTheme}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorThemes.map((theme) => (
                    <SelectItem key={theme} value={theme}>
                      {theme}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="demoUrl" className="text-white">Demo URL (optional)</Label>
              <Input
                id="demoUrl"
                name="demoUrl"
                type="url"
                defaultValue={project?.demoUrl || ''}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="githubUrl" className="text-white">GitHub URL (optional)</Label>
              <Input
                id="githubUrl"
                name="githubUrl"
                type="url"
                defaultValue={project?.githubUrl || ''}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          {/* File Upload Sections - Show for existing projects or provide info for new ones */}
          {project ? (
            <div className="space-y-6 pt-6 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-white">Project Media</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <FileUpload 
                  project={project} 
                  type="icon"
                />
                <FileUpload 
                  project={project} 
                  type="screenshots"
                />
              </div>
            </div>
          ) : (
            <div className="pt-6 border-t border-gray-700">
              <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-300 mb-2">Project Media</h3>
                <p className="text-blue-200 text-sm">
                  After creating this project, you'll be able to upload a project icon and screenshots in the edit form.
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}