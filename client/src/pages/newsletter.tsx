import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { 
  Mail, 
  User, 
  Lock, 
  CheckCircle, 
  ArrowLeft, 
  Newspaper, 
  Clock, 
  Settings,
  Eye,
  EyeOff 
} from 'lucide-react';

// Form schema that matches the backend newsletterSignupSchema
const newsletterSignupSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  frequency: z.enum(["weekly", "monthly"]).default("monthly"),
  topics: z.array(z.string()).default([]),
});

type NewsletterSignupData = z.infer<typeof newsletterSignupSchema>;

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

export default function NewsletterPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  if (user) {
    setLocation('/');
    return null;
  }

  const form = useForm<NewsletterSignupData>({
    resolver: zodResolver(newsletterSignupSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      username: '',
      password: '',
      frequency: 'monthly',
      topics: [],
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: NewsletterSignupData) => {
      const res = await apiRequest('POST', '/api/newsletter/signup', {
        ...data,
        preferences: {
          frequency: data.frequency,
          topics: data.topics,
        },
      });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/user'], data.user);
      toast({
        title: 'Welcome!',
        description: data.message || 'Successfully signed up for newsletter!',
      });
      setLocation('/');
    },
    onError: (error: any) => {
      const message = error.message || 'Signup failed';
      toast({
        title: 'Signup failed',
        description: message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (data: NewsletterSignupData) => {
    signupMutation.mutate(data);
  };

  const handleTopicChange = (topic: string, checked: boolean) => {
    const currentTopics = form.getValues('topics');
    if (checked) {
      form.setValue('topics', [...currentTopics, topic]);
    } else {
      form.setValue('topics', currentTopics.filter(t => t !== topic));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Hero Section */}
        <div className="hidden lg:flex flex-col justify-center space-y-6 text-white p-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Newspaper className="w-10 h-10 text-blue-400" />
              <h1 className="text-4xl font-bold">Stay Updated</h1>
            </div>
            <p className="text-xl text-gray-300">
              Join our newsletter and get exclusive insights into web development, project showcases, and industry tips.
            </p>
            
            <div className="space-y-4 mt-8">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <span className="text-gray-300">Weekly or monthly updates based on your preference</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <span className="text-gray-300">Curated content on topics you care about</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <span className="text-gray-300">Behind-the-scenes project insights</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <span className="text-gray-300">Early access to new projects and tutorials</span>
              </div>
            </div>
          </div>
        </div>

        {/* Signup Form */}
        <div className="flex flex-col justify-center">
          <Card className="w-full bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-white">Join Newsletter</CardTitle>
                  <CardDescription className="text-gray-300">
                    Create your account and subscribe to receive updates
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation('/')}
                  className="text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Personal Information
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                      <Input
                        id="firstName"
                        {...form.register('firstName')}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        placeholder="John"
                      />
                      {form.formState.errors.firstName && (
                        <p className="text-red-400 text-sm mt-1">
                          {form.formState.errors.firstName.message}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                      <Input
                        id="lastName"
                        {...form.register('lastName')}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        placeholder="Doe"
                      />
                      {form.formState.errors.lastName && (
                        <p className="text-red-400 text-sm mt-1">
                          {form.formState.errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-gray-300">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register('email')}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      placeholder="john@example.com"
                    />
                    {form.formState.errors.email && (
                      <p className="text-red-400 text-sm mt-1">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Account Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <Lock className="w-5 h-5 mr-2" />
                    Account Information
                  </h3>
                  
                  <div>
                    <Label htmlFor="username" className="text-gray-300">Username</Label>
                    <Input
                      id="username"
                      {...form.register('username')}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      placeholder="johndoe"
                    />
                    {form.formState.errors.username && (
                      <p className="text-red-400 text-sm mt-1">
                        {form.formState.errors.username.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-gray-300">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        {...form.register('password')}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10"
                        placeholder="••••••••"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    {form.formState.errors.password && (
                      <p className="text-red-400 text-sm mt-1">
                        {form.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Newsletter Preferences */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Newsletter Preferences
                  </h3>
                  
                  <div>
                    <Label className="text-gray-300 flex items-center mb-3">
                      <Clock className="w-4 h-4 mr-2" />
                      Frequency
                    </Label>
                    <RadioGroup
                      defaultValue="monthly"
                      onValueChange={(value) => form.setValue('frequency', value as 'weekly' | 'monthly')}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="weekly" id="weekly" />
                        <Label htmlFor="weekly" className="text-gray-300">Weekly updates</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="monthly" id="monthly" />
                        <Label htmlFor="monthly" className="text-gray-300">Monthly updates</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-gray-300 mb-3 block">
                      Topics of Interest (optional)
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {topics.map((topic) => (
                        <div key={topic} className="flex items-center space-x-2">
                          <Checkbox
                            id={topic}
                            onCheckedChange={(checked) => handleTopicChange(topic, checked as boolean)}
                          />
                          <Label
                            htmlFor={topic}
                            className="text-sm text-gray-300 cursor-pointer"
                          >
                            {topic}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
                  disabled={signupMutation.isPending}
                >
                  {signupMutation.isPending ? (
                    "Creating Account..."
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Join Newsletter
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-gray-400 text-sm">
                    Already have an account?{' '}
                    <Button
                      variant="link"
                      className="text-blue-400 hover:text-blue-300 p-0 h-auto font-normal"
                      onClick={() => setLocation('/auth')}
                    >
                      Sign in here
                    </Button>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}