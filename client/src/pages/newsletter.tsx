import { useState, useEffect } from 'react';
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
  const [animationKey, setAnimationKey] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    phone: ''
  });

  // Trigger animation on component mount and restart
  useEffect(() => {
    const timer = setTimeout(() => {
      const svg = document.querySelector('.intro-svg');
      if (svg) {
        svg.classList.add('go');
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [animationKey]);

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
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 w-full max-w-5xl">
          {/* Newsletter Signup Container */}
          <div className="newsletter-container bg-gray-800/40 backdrop-blur-lg rounded-3xl p-6 lg:p-8 w-full max-w-md shadow-2xl border border-gray-600/30">
            <div 
              className="newsletter-content flex items-start justify-start cursor-pointer pt-2 lg:pt-4 pl-2 lg:pl-4 mb-4 lg:mb-6" 
              onClick={() => {
                const svg = document.querySelector('.intro-svg');
                if (svg) {
                  svg.classList.remove('go');
                  setTimeout(() => {
                    svg.classList.add('go');
                  }, 100);
                }
              }}
            >
              <svg className="intro-svg" viewBox="0 0 200 86" style={{ maxWidth: '180px', width: '100%' }} key={animationKey}>
                <text textAnchor="start" x="10" y="30" className="text text-stroke" clipPath="url(#text1)">SignUp</text>
                <text textAnchor="start" x="10" y="50" className="text text-stroke" clipPath="url(#text2)">for</text>
                <text textAnchor="start" x="10" y="70" className="text text-stroke" clipPath="url(#text3)">NewsLetter</text>
                <text textAnchor="start" x="10" y="30" className="text text-stroke text-stroke-2" clipPath="url(#text1)">SignUp</text>
                <text textAnchor="start" x="10" y="50" className="text text-stroke text-stroke-2" clipPath="url(#text2)">for</text>
                <text textAnchor="start" x="10" y="70" className="text text-stroke text-stroke-2" clipPath="url(#text3)">NewsLetter</text>
                <defs>
                  <clipPath id="text1">
                    <text textAnchor="start" x="10" y="30" className="text">SignUp</text>
                  </clipPath>
                  <clipPath id="text2">
                    <text textAnchor="start" x="10" y="50" className="text">for</text>
                  </clipPath>
                  <clipPath id="text3">
                    <text textAnchor="start" x="10" y="70" className="text">NewsLetter</text>
                  </clipPath>
                </defs>
              </svg>
            </div>
            
            {/* Divider */}
            <div className="w-full px-4 lg:px-8 mb-3 lg:mb-4">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-400/50 to-transparent"></div>
            </div>
            
            {/* Description Text */}
            <div className="px-4 lg:px-8 pb-4 lg:pb-6">
              <p className="text-gray-300 text-sm lg:text-sm leading-relaxed">
                I send occasional, code-focused updates on my solo ML experiments, projects in progress, and useful dev tools.
                <br /><br />
                If you're into clean code and AI, sign up.
              </p>
            </div>
          </div>

          {/* Account Signup Container */}
          <div className="account-container relative bg-gray-800/40 backdrop-blur-lg rounded-3xl p-6 lg:p-8 w-full max-w-md shadow-2xl border border-gray-600/30">
          {/* Close Button */}
          <button 
            onClick={() => setLocation('/')}
            className="absolute top-4 lg:top-6 right-4 lg:right-6 text-gray-400 hover:text-white transition-colors z-10"
          >
            <X className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>

          <div className="account-content">
          {/* Tab Buttons */}
          <div className="flex mb-6 lg:mb-8 bg-gray-700/50 rounded-2xl p-1">
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2.5 lg:py-3 px-3 lg:px-4 rounded-xl text-sm font-medium transition-all ${
                isSignUp 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Sign up
            </button>
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2.5 lg:py-3 px-3 lg:px-4 rounded-xl text-sm font-medium transition-all ${
                !isSignUp 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Sign in
            </button>
          </div>

          {/* Form Title */}
          <h2 className="text-xl lg:text-2xl font-bold text-white mb-6 lg:mb-8 uppercase" style={{ fontFamily: 'Arial, sans-serif' }}>
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </h2>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 lg:space-y-4">
            {isSignUp && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                <Input
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 rounded-xl h-11 lg:h-12"
                />
                <Input
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 rounded-xl h-11 lg:h-12"
                />
              </div>
            )}

            {isSignUp && (
              <div className="relative">
                <Mail className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 rounded-xl h-11 lg:h-12 pl-10 lg:pl-12"
                />
              </div>
            )}

            <Input
              placeholder={isSignUp ? "Username" : "Username or email"}
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              required
              className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 rounded-xl h-11 lg:h-12"
            />

            <Input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
              className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 rounded-xl h-11 lg:h-12"
            />



            <Button
              type="submit"
              disabled={signupMutation.isPending || loginMutation.isPending}
              className="w-full bg-white text-black hover:bg-gray-100 rounded-xl h-11 lg:h-12 font-medium text-sm lg:text-base transition-all"
            >
              {signupMutation.isPending || loginMutation.isPending 
                ? 'Please wait...' 
                : isSignUp 
                  ? 'Create an account' 
                  : 'Sign in'
              }
            </Button>


          </form>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}