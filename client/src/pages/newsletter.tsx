import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { X, Mail } from 'lucide-react';

export default function NewsletterPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSignUp, setIsSignUp] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    phone: ''
  });

  // Redirect if already logged in
  if (user) {
    setLocation('/dashboard');
    return null;
  }

  const signupMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/newsletter/signup', {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        password: data.password,
        frequency: 'monthly',
        topics: []
      });
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(['/api/user'], user);
      toast({
        title: 'Account created successfully!',
        description: `Welcome ${user.username}! You're now subscribed to our newsletter.`,
      });
      setLocation('/dashboard');
    },
    onError: (error: any) => {
      toast({
        title: 'Signup failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const res = await apiRequest('POST', '/api/login', credentials);
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(['/api/user'], user);
      toast({
        title: 'Welcome back!',
        description: `Logged in as ${user.username}`,
      });
      setLocation(user.isAdmin ? '/admin' : '/dashboard');
    },
    onError: (error: any) => {
      toast({
        title: 'Login failed',
        description: error.message || 'Invalid credentials',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp) {
      signupMutation.mutate(formData);
    } else {
      loginMutation.mutate({
        username: formData.username,
        password: formData.password
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Particle Animation Background */}
      <div className="absolute inset-0 bg-blue-900 overflow-hidden">
        <div className="particle-wrapper">
          {Array.from({ length: 62 }, (_, i) => (
            <i key={i} className={`particle particle-${i + 1}`}></i>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="bg-gray-800/40 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md shadow-2xl border border-gray-600/30">
          {/* Close Button */}
          <button 
            onClick={() => setLocation('/')}
            className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Tab Buttons */}
          <div className="flex mb-8 bg-gray-700/50 rounded-2xl p-1">
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                isSignUp 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Sign up
            </button>
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                !isSignUp 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Sign in
            </button>
          </div>

          {/* Form Title */}
          <h2 className="text-2xl font-bold text-white mb-8">
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </h2>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 rounded-xl h-12"
                />
                <Input
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 rounded-xl h-12"
                />
              </div>
            )}

            {isSignUp && (
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 rounded-xl h-12 pl-12"
                />
              </div>
            )}

            <Input
              placeholder={isSignUp ? "Username" : "Username or email"}
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              required
              className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 rounded-xl h-12"
            />

            <Input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
              className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 rounded-xl h-12"
            />

            {isSignUp && (
              <div className="relative">
                <select className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-xl h-12 px-4 appearance-none">
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+91">🇮🇳 +91</option>
                </select>
                <Input
                  placeholder="(775) 351-6501"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 rounded-xl h-12 mt-2"
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={signupMutation.isPending || loginMutation.isPending}
              className="w-full bg-white text-black hover:bg-gray-100 rounded-xl h-12 font-medium text-base transition-all"
            >
              {signupMutation.isPending || loginMutation.isPending 
                ? 'Please wait...' 
                : isSignUp 
                  ? 'Create an account' 
                  : 'Sign in'
              }
            </Button>

            {isSignUp && (
              <>
                <div className="text-center text-gray-400 text-sm my-6">
                  OR SIGN IN WITH
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    className="bg-gray-700/50 border border-gray-600 rounded-xl h-12 flex items-center justify-center hover:bg-gray-600/50 transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="bg-gray-700/50 border border-gray-600 rounded-xl h-12 flex items-center justify-center hover:bg-gray-600/50 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.747.098.119.112.223.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.986C24.007 5.367 18.641.001.012.001z"/>
                    </svg>
                  </button>
                </div>

                <p className="text-xs text-gray-400 text-center mt-6">
                  By creating an account, you agree to our{' '}
                  <a href="#" className="text-blue-400 hover:underline">Terms & Service</a>
                </p>
              </>
            )}
          </form>
        </div>
      </div>


    </div>
  );
}