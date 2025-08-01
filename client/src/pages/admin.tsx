import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit2, Trash2, Save, X, Lock, LogOut, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { isUnauthorizedError } from '@/lib/authUtils';
import { useLocation } from 'wouter';
import FileUpload from '@/components/FileUpload';
import type { Project, InsertProject, WorkExperience, InsertWorkExperience } from '@shared/schema';

const colorThemes = [
  'blue', 'green', 'purple', 'orange', 'red', 'yellow', 'pink', 'indigo', 'cyan', 'emerald'
] as const;

const statusOptions = ['planning', 'in-progress', 'completed', 'on-hold'] as const;
const workExperienceTypes = ['current', 'past'] as const;

export default function AdminPanel() {
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingWorkExperience, setEditingWorkExperience] = useState<WorkExperience | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingWorkExperience, setIsCreatingWorkExperience] = useState(false);
  const [activeTab, setActiveTab] = useState<'projects' | 'work-experience'>('projects');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, isAdmin, isLoading } = useAdminAuth();
  const [, setLocation] = useLocation();

  // Fetch all projects and work experiences - must be declared before any conditional returns
  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  const { data: workExperiences = [], isLoading: workExperiencesLoading } = useQuery<WorkExperience[]>({
    queryKey: ['/api/work-experiences'],
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (data: InsertProject) => {
      const response = await apiRequest('POST', '/api/projects', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setIsCreating(false);
      toast({ title: 'Project created successfully!' });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Please log in again to continue",
          variant: "destructive",
        });
        setTimeout(() => {
          setLocation("/auth");
        }, 1000);
        return;
      }
      toast({ title: 'Failed to create project', variant: 'destructive' });
    },
  });

  // Create work experience mutation
  const createWorkExperienceMutation = useMutation({
    mutationFn: async (data: InsertWorkExperience) => {
      const response = await apiRequest('POST', '/api/work-experiences', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/work-experiences'] });
      setIsCreatingWorkExperience(false);
      toast({ title: 'Work experience created successfully!' });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Please log in again to continue",
          variant: "destructive",
        });
        setTimeout(() => {
          setLocation("/auth");
        }, 1000);
        return;
      }
      toast({ title: 'Failed to create work experience', variant: 'destructive' });
    },
  });

  // Update work experience mutation
  const updateWorkExperienceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertWorkExperience> }) => {
      const response = await apiRequest('PUT', `/api/work-experiences/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/work-experiences'] });
      setEditingWorkExperience(null);
      toast({ title: 'Work experience updated successfully!' });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Please log in again to continue",
          variant: "destructive",
        });
        setTimeout(() => {
          setLocation("/auth");
        }, 1000);
        return;
      }
      toast({ title: 'Failed to update work experience', variant: 'destructive' });
    },
  });

  // Delete work experience mutation
  const deleteWorkExperienceMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/work-experiences/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/work-experiences'] });
      toast({ title: 'Work experience deleted successfully!' });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Please log in again to continue",
          variant: "destructive",
        });
        setTimeout(() => {
          setLocation("/auth");
        }, 1000);
        return;
      }
      toast({ title: 'Failed to delete work experience', variant: 'destructive' });
    },
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertProject> }) => {
      const response = await apiRequest('PUT', `/api/projects/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setEditingProject(null);
      toast({ title: 'Project updated successfully!' });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Please log in again to continue",
          variant: "destructive",
        });
        setTimeout(() => {
          setLocation("/auth");
        }, 1000);
        return;
      }
      toast({ title: 'Failed to update project', variant: 'destructive' });
    },
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({ title: 'Project deleted successfully!' });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Please log in again to continue",
          variant: "destructive",
        });
        setTimeout(() => {
          setLocation("/auth");
        }, 1000);
        return;
      }
      toast({ title: 'Failed to delete project', variant: 'destructive' });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/logout');
    },
    onSuccess: () => {
      queryClient.clear();
      toast({ title: 'Logged out successfully' });
      setLocation('/auth');
    },
    onError: (error: Error) => {
      toast({ title: 'Logout failed', variant: 'destructive' });
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

  const handleWorkExperienceSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const data: InsertWorkExperience = {
      position: formData.get('position') as string,
      company: formData.get('company') as string,
      location: formData.get('location') as string,
      duration: formData.get('duration') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      description: (formData.get('description') as string).split('\n').filter(d => d.trim()),
      technologies: (formData.get('technologies') as string).split(',').map(t => t.trim()),
      type: formData.get('type') as string,
      order: parseInt(formData.get('order') as string) || 0,
    };

    if (editingWorkExperience) {
      updateWorkExperienceMutation.mutate({ id: editingWorkExperience.id, data });
    } else {
      createWorkExperienceMutation.mutate(data);
    }
  };

  // Authentication effects - redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access the admin panel",
        variant: "destructive",
      });
      setTimeout(() => {
        setLocation("/auth");
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Early return for loading state - prevents flash of content
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Early return for authentication redirect - prevents flash of content
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Redirecting to login...</div>
      </div>
    );
  }

  // Show access denied if authenticated but not admin
  if (!isLoading && isAuthenticated && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-gray-800/50 border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-white flex items-center justify-center gap-2">
              <Shield className="w-5 h-5 text-red-400" />
              Access Denied
            </CardTitle>
            <CardDescription className="text-gray-400">
              You don't have admin privileges to access this panel
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={() => logoutMutation.mutate()} 
              variant="outline" 
              className="w-full"
              disabled={logoutMutation.isPending}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {logoutMutation.isPending ? 'Logging out...' : 'Log Out'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="text-gray-400 hover:text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
              </Button>
            </div>
            <p className="text-gray-400">Manage your portfolio projects and work experience</p>
          </div>

        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'projects'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              Projects
            </button>
            <button
              onClick={() => setActiveTab('work-experience')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'work-experience'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              Work Experience
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {activeTab === 'projects' && (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">All Projects</h2>
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Project
                </Button>
              </div>
            </>
          )}

          {activeTab === 'work-experience' && (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Work Experience</h2>
                <Button onClick={() => setIsCreatingWorkExperience(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Work Experience
                </Button>
              </div>
            </>
          )}

          {activeTab === 'projects' && (
            <div className="grid gap-4">
              {projectsLoading ? (
                <div className="text-white text-center py-8">Loading projects...</div>
              ) : (
                projects.map((project) => (
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
                ))
              )}
            </div>
          )}

          {activeTab === 'work-experience' && (
            <div className="grid gap-4">
              {workExperiencesLoading ? (
                <div className="text-white text-center py-8">Loading work experiences...</div>
              ) : (
                workExperiences.map((workExp) => (
                  <Card key={workExp.id} className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-white">{workExp.position}</CardTitle>
                          <CardDescription className="text-gray-400">
                            {workExp.company} • {workExp.location}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingWorkExperience(workExp)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteWorkExperienceMutation.mutate(workExp.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <div className="text-gray-300 text-sm mb-2">
                          {workExp.duration} ({workExp.startDate} - {workExp.endDate})
                        </div>
                        <div className="space-y-2">
                          {workExp.description.map((desc, index) => (
                            <div key={index} className="text-gray-300 text-sm">• {desc}</div>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {workExp.technologies.map((tech) => (
                          <Badge key={tech} variant="secondary">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-4 text-sm text-gray-400">
                        <span>Type: {workExp.type}</span>
                        <span>Order: {workExp.order}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
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

        {/* Edit Work Experience Modal */}
        {editingWorkExperience && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold text-white mb-4">Edit Work Experience</h2>
              <WorkExperienceForm
                workExperience={editingWorkExperience}
                onSubmit={handleWorkExperienceSubmit}
                onCancel={() => setEditingWorkExperience(null)}
                isSubmitting={updateWorkExperienceMutation.isPending}
              />
            </div>
          </div>
        )}

        {/* Create Work Experience Modal */}
        {isCreatingWorkExperience && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold text-white mb-4">Create New Work Experience</h2>
              <WorkExperienceForm
                workExperience={null}
                onSubmit={handleWorkExperienceSubmit}
                onCancel={() => setIsCreatingWorkExperience(false)}
                isSubmitting={createWorkExperienceMutation.isPending}
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

function WorkExperienceForm({
  workExperience,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  workExperience: WorkExperience | null;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">
          {workExperience ? 'Edit Work Experience' : 'Create New Work Experience'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="position" className="text-white">Position</Label>
              <Input
                id="position"
                name="position"
                defaultValue={workExperience?.position}
                required
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="company" className="text-white">Company</Label>
              <Input
                id="company"
                name="company"
                defaultValue={workExperience?.company}
                required
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location" className="text-white">Location</Label>
              <Input
                id="location"
                name="location"
                defaultValue={workExperience?.location}
                required
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="duration" className="text-white">Duration</Label>
              <Input
                id="duration"
                name="duration"
                defaultValue={workExperience?.duration}
                required
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate" className="text-white">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                defaultValue={workExperience?.startDate}
                required
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="text-white">End Date</Label>
              <Input
                id="endDate"
                name="endDate"
                defaultValue={workExperience?.endDate}
                required
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-white">Description (one bullet point per line)</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={workExperience?.description.join('\n')}
              required
              className="bg-gray-700 border-gray-600 text-white"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="technologies" className="text-white">Technologies (comma-separated)</Label>
            <Input
              id="technologies"
              name="technologies"
              defaultValue={workExperience?.technologies.join(', ')}
              required
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type" className="text-white">Type</Label>
              <Select name="type" defaultValue={workExperience?.type || 'past'}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {workExperienceTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="order" className="text-white">Order</Label>
              <Input
                id="order"
                name="order"
                type="number"
                defaultValue={workExperience?.order}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

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