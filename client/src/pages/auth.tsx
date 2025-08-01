import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Lock, User, Mail, Shield } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import type { LoginData, RegisterData } from '@shared/schema';

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
      setLocation('/admin');
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

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      const res = await apiRequest('POST', '/api/register', credentials);
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(['/api/user'], user);
      toast({
        title: 'Account created!',
        description: `Welcome ${user.username}`,
      });
      setLocation('/admin');
    },
    onError: (error: any) => {
      const message = error.message || 'Registration failed';
      setFormErrors(message);
      toast({
        title: 'Registration failed',
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

  const handleRegister = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormErrors('');
    
    const formData = new FormData(event.currentTarget);
    const credentials: RegisterData = {
      username: formData.get('username') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      firstName: formData.get('firstName') as string || undefined,
      lastName: formData.get('lastName') as string || undefined,
    };

    registerMutation.mutate(credentials);
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
              <CardTitle className="text-2xl text-center text-white">Authentication</CardTitle>
              <CardDescription className="text-center text-gray-400">
                Access your portfolio admin panel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 bg-gray-700">
                  <TabsTrigger value="login" className="text-gray-300 data-[state=active]:text-white">
                    Login
                  </TabsTrigger>
                  <TabsTrigger value="register" className="text-gray-300 data-[state=active]:text-white">
                    Register
                  </TabsTrigger>
                </TabsList>

                {formErrors && (
                  <Alert variant="destructive">
                    <AlertDescription>{formErrors}</AlertDescription>
                  </Alert>
                )}

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-username" className="text-white">Username</Label>
                      <Input
                        id="login-username"
                        name="username"
                        type="text"
                        required
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Enter your username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-white">Password</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
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
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-firstName" className="text-white">First Name</Label>
                        <Input
                          id="register-firstName"
                          name="firstName"
                          type="text"
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="First name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-lastName" className="text-white">Last Name</Label>
                        <Input
                          id="register-lastName"
                          name="lastName"
                          type="text"
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="Last name"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-username" className="text-white">Username</Label>
                      <Input
                        id="register-username"
                        name="username"
                        type="text"
                        required
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Choose a username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-white">Email</Label>
                      <Input
                        id="register-email"
                        name="email"
                        type="email"
                        required
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-white">Password</Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          required
                          minLength={6}
                          className="bg-gray-700 border-gray-600 text-white pr-10"
                          placeholder="Create a password"
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
                      <p className="text-xs text-gray-400">
                        Password must be at least 6 characters long
                      </p>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}