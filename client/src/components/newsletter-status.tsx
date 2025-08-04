import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  Mail, 
  Settings, 
  Clock, 
  CheckCircle, 
  XCircle,
  Unplug
} from 'lucide-react';

const topics = [
  "Web Development",
  "React & Frontend",
  "Backend & APIs",
  "Database Design",
  "DevOps & Deployment",
  "UI/UX Design",
  "Project Showcases",
  "Career Tips"
];

export default function NewsletterStatus() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [preferences, setPreferences] = useState({
    frequency: 'monthly',
    topics: [] as string[]
  });

  const { data: subscriptionData, isLoading } = useQuery({
    queryKey: ['/api/newsletter/subscription'],
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: typeof preferences) => {
      const res = await apiRequest('POST', '/api/newsletter/subscribe', {
        preferences: newPreferences
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/newsletter/subscription'] });
      toast({
        title: 'Preferences updated',
        description: 'Your newsletter preferences have been saved.',
      });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update preferences',
        variant: 'destructive',
      });
    }
  });

  const unsubscribeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('DELETE', '/api/newsletter/unsubscribe');
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/newsletter/subscription'] });
      toast({
        title: 'Unsubscribed',
        description: 'You have been unsubscribed from the newsletter.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Unsubscribe failed',
        description: error.message || 'Failed to unsubscribe',
        variant: 'destructive',
      });
    }
  });

  const handleTopicChange = (topic: string, checked: boolean) => {
    if (checked) {
      setPreferences(prev => ({
        ...prev,
        topics: [...prev.topics, topic]
      }));
    } else {
      setPreferences(prev => ({
        ...prev,
        topics: prev.topics.filter(t => t !== topic)
      }));
    }
  };

  const handleSavePreferences = () => {
    updatePreferencesMutation.mutate(preferences);
  };

  const subscription = (subscriptionData as any)?.subscription;
  
  // Update preferences when subscription data changes
  if (subscription?.preferences && !isEditing) {
    if (JSON.stringify(preferences) !== JSON.stringify(subscription.preferences)) {
      setPreferences(subscription.preferences);
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Mail className="w-5 h-5 animate-spin" />
            <span>Loading newsletter status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription || !subscription.isActive) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <XCircle className="w-5 h-5 text-gray-400" />
            <span>Newsletter Status</span>
          </CardTitle>
          <CardDescription>
            You are not subscribed to the newsletter.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <a href="/newsletter">
              <Mail className="w-4 h-4 mr-2" />
              Subscribe to Newsletter
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>Newsletter Subscription</span>
          </div>
          <Badge variant="outline" className="text-green-600 border-green-600">
            Active
          </Badge>
        </CardTitle>
        <CardDescription>
          Subscribed since {new Date(subscription.subscribedAt).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isEditing ? (
          <>
            {/* Current preferences display */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Frequency:</span>
                <Badge variant="secondary">
                  {subscription.preferences?.frequency || 'monthly'}
                </Badge>
              </div>

              {subscription.preferences?.topics?.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Settings className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Topics of Interest:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {subscription.preferences.topics.map((topic: string) => (
                      <Badge key={topic} variant="outline">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                disabled={updatePreferencesMutation.isPending}
              >
                <Settings className="w-4 h-4 mr-2" />
                Edit Preferences
              </Button>
              <Button
                variant="destructive"
                onClick={() => unsubscribeMutation.mutate()}
                disabled={unsubscribeMutation.isPending}
              >
                <Unplug className="w-4 h-4 mr-2" />
                Unsubscribe
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Preference editing form */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  <Clock className="w-4 h-4 mr-2 inline" />
                  Frequency
                </Label>
                <RadioGroup
                  value={preferences.frequency}
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, frequency: value }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="weekly" id="weekly-edit" />
                    <Label htmlFor="weekly-edit">Weekly updates</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="monthly" id="monthly-edit" />
                    <Label htmlFor="monthly-edit">Monthly updates</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Topics of Interest
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {topics.map((topic) => (
                    <div key={topic} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-${topic}`}
                        checked={preferences.topics.includes(topic)}
                        onCheckedChange={(checked) => handleTopicChange(topic, checked as boolean)}
                      />
                      <Label
                        htmlFor={`edit-${topic}`}
                        className="text-sm cursor-pointer"
                      >
                        {topic}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleSavePreferences}
                disabled={updatePreferencesMutation.isPending}
              >
                {updatePreferencesMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  // Reset preferences to current subscription
                  if (subscription.preferences) {
                    setPreferences(subscription.preferences);
                  }
                }}
              >
                Cancel
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}