import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Lock, User, Shield } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import type { LoginData } from '@shared/schema';

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<string>('');

  // Redirect if already logged in
  if (user) {
    setLocation('/');
    return null;
  }

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest('POST', '/api/login', credentials);
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(['/api/user'], user);
      toast({
        title: 'Welcome back!',
        description: `Logged in as ${user.username}`,
      });
      // Redirect based on user role
      setLocation(user.isAdmin ? '/admin' : '/dashboard');
    },
    onError: (error: any) => {
      const message = error.message || 'Login failed';
      setFormErrors(message);
      toast({
        title: 'Login failed',
        description: message,
        variant: 'destructive',
      });
    },
  });


  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormErrors('');
    
    const formData = new FormData(event.currentTarget);
    const credentials: LoginData = {
      username: formData.get('username') as string,
      password: formData.get('password') as string,
    };

    loginMutation.mutate(credentials);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Hero Section */}
        <div className="hidden lg:flex flex-col justify-center space-y-6 text-white">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-blue-400" />
              <h1 className="text-3xl font-bold">Portfolio Admin</h1>
            </div>
            <p className="text-xl text-gray-300">
              Secure access to your portfolio management system
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Lock className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">End-to-end encrypted authentication</span>
              </div>
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-blue-400" />
                <span className="text-gray-300">Role-based access control</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-purple-400" />
                <span className="text-gray-300">Secure session management</span>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Forms */}
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md bg-gray-800/50 border-gray-700">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center text-white">Admin Login</CardTitle>
              <CardDescription className="text-center text-gray-400">
                Access your portfolio admin panel
              </CardDescription>
            </CardHeader>
            <CardContent>
              {formErrors && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{formErrors}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-white">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter your username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      className="bg-gray-700 border-gray-600 text-white pr-10"
                      placeholder="Enter your password"
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
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
              
              <div className="text-center">
                <p className="text-gray-400 text-sm">
                  Don't have an account?{' '}
                  <Button
                    variant="link"
                    className="text-blue-400 hover:text-blue-300 p-0 h-auto font-normal"
                    onClick={() => setLocation('/newsletter')}
                  >
                    Sign up for newsletter
                  </Button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}