import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { isUnauthorizedError } from '@/lib/authUtils';
import type { Command, InsertCommand } from '@shared/schema';

const commandCategories = ['Setup', 'Development', 'Testing', 'Deployment', 'Maintenance', 'General'] as const;

export function ProjectCommandsSection({ projectId }: { projectId: string }) {
  const [editingCommand, setEditingCommand] = useState<Command | null>(null);
  const [isCreatingCommand, setIsCreatingCommand] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch commands for this project
  const { data: commands = [], isLoading: commandsLoading } = useQuery<Command[]>({
    queryKey: [`/api/projects/${projectId}/commands`],
  });

  // Create command mutation
  const createCommandMutation = useMutation({
    mutationFn: async (data: InsertCommand) => {
      const response = await apiRequest('POST', `/api/projects/${projectId}/commands`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/commands`] });
      setIsCreatingCommand(false);
      toast({ title: 'Command created successfully!' });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Please log in again to continue",
          variant: "destructive",
        });
        return;
      }
      toast({ title: 'Failed to create command', variant: 'destructive' });
    },
  });

  // Update command mutation
  const updateCommandMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertCommand> }) => {
      const response = await apiRequest('PUT', `/api/commands/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/commands`] });
      setEditingCommand(null);
      toast({ title: 'Command updated successfully!' });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Please log in again to continue",
          variant: "destructive",
        });
        return;
      }
      toast({ title: 'Failed to update command', variant: 'destructive' });
    },
  });

  // Delete command mutation
  const deleteCommandMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/commands/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/commands`] });
      toast({ title: 'Command deleted successfully!' });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Please log in again to continue",
          variant: "destructive",
        });
        return;
      }
      toast({ title: 'Failed to delete command', variant: 'destructive' });
    },
  });

  const handleCommandSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const tags = (formData.get('tags') as string || '').split(',').map(t => t.trim()).filter(t => t);
    
    const data: InsertCommand = {
      projectId,
      command: formData.get('command') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      example: formData.get('example') as string || undefined,
      tags: tags.length > 0 ? tags : undefined,
      order: parseInt(formData.get('order') as string) || 0,
    };

    if (editingCommand) {
      updateCommandMutation.mutate({ id: editingCommand.id, data });
    } else {
      createCommandMutation.mutate(data);
    }
  };

  return (
    <>
      <div className="space-y-4 pt-6 border-t border-gray-700">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">Commands Guide</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsCreatingCommand(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Command
          </Button>
        </div>
        
        {commandsLoading ? (
          <div className="text-gray-400 text-center py-4">Loading commands...</div>
        ) : commands.length === 0 ? (
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm text-center">
              No commands added yet. Add project-specific commands that help with setup, development, or deployment.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {commands.map((command) => (
              <Card key={command.id} className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <code className="text-green-400 font-mono text-sm bg-gray-800 px-2 py-1 rounded">
                          {command.command}
                        </code>
                        <Badge variant="outline" className="text-blue-400 border-blue-400 text-xs">
                          {command.category}
                        </Badge>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{command.description}</p>
                      {command.example && (
                        <div className="bg-gray-800 rounded p-2 mb-2">
                          <div className="text-gray-400 text-xs mb-1">Example:</div>
                          <code className="text-green-300 text-xs font-mono">{command.example}</code>
                        </div>
                      )}
                      {command.tags && command.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {command.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 ml-4">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingCommand(command)}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCommandMutation.mutate(command.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Command Modal */}
      {isCreatingCommand && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-white mb-4">Create New Command</h2>
            <CommandForm
              command={null}
              onSubmit={handleCommandSubmit}
              onCancel={() => setIsCreatingCommand(false)}
              isSubmitting={createCommandMutation.isPending}
            />
          </div>
        </div>
      )}

      {/* Edit Command Modal */}
      {editingCommand && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-white mb-4">Edit Command</h2>
            <CommandForm
              command={editingCommand}
              onSubmit={handleCommandSubmit}
              onCancel={() => setEditingCommand(null)}
              isSubmitting={updateCommandMutation.isPending}
            />
          </div>
        </div>
      )}
    </>
  );
}

function CommandForm({
  command,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  command: Command | null;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">
          {command ? 'Edit Command' : 'Create New Command'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="command" className="text-white">Command</Label>
              <Input
                id="command"
                name="command"
                defaultValue={command?.command}
                required
                className="bg-gray-700 border-gray-600 text-white font-mono"
                placeholder="npm install"
              />
            </div>
            <div>
              <Label htmlFor="order" className="text-white">Order</Label>
              <Input
                id="order"
                name="order"
                type="number"
                defaultValue={command?.order}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-white">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={command?.description}
              required
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Install project dependencies"
            />
          </div>

          <div>
            <Label htmlFor="category" className="text-white">Category</Label>
            <Select name="category" defaultValue={command?.category || 'General'}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {commandCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="example" className="text-white">Example (optional)</Label>
            <Textarea
              id="example"
              name="example"
              defaultValue={command?.example || ''}
              className="bg-gray-700 border-gray-600 text-white font-mono"
              placeholder="npm install --legacy-peer-deps"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="tags" className="text-white">Tags (optional, comma-separated)</Label>
            <Input
              id="tags"
              name="tags"
              defaultValue={command?.tags?.join(', ') || ''}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="npm, install, dependencies"
            />
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