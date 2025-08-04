import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import NewsletterStatus from '@/components/newsletter-status';
import { 
  User, 
  Mail, 
  Calendar, 
  Settings,
  ArrowLeft,
  LogOut
} from 'lucide-react';

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  // Type guard for user object
  const typedUser = user as any;

  // Redirect if not logged in
  if (!user) {
    setLocation('/auth');
    return null;
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setLocation('/')}
                className="text-white hover:text-gray-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {typedUser?.isAdmin && (
                <Button
                  variant="outline"
                  onClick={() => setLocation('/admin')}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Admin Panel
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <div className="lg:col-span-1">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm text-gray-400">Username</div>
                  <div className="text-white font-medium">{typedUser?.username || 'N/A'}</div>
                </div>
                
                {typedUser?.email && (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-400">Email</div>
                    <div className="text-white font-medium">{typedUser.email}</div>
                  </div>
                )}
                
                {(typedUser?.firstName || typedUser?.lastName) && (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-400">Name</div>
                    <div className="text-white font-medium">
                      {[typedUser.firstName, typedUser.lastName].filter(Boolean).join(' ')}
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="text-sm text-gray-400">Member since</div>
                  <div className="text-white font-medium flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {typedUser?.createdAt ? new Date(typedUser.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>

                {typedUser?.isAdmin && (
                  <div className="pt-2">
                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      Administrator
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Newsletter Status */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <NewsletterStatus />
              
              {/* Quick Actions Card */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                  <CardDescription className="text-gray-300">
                    Explore the portfolio and projects
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setLocation('/projects')}
                      className="border-white/20 text-white hover:bg-white/10 justify-start"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      View Projects
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = 'mailto:tanay_kapoor@icloud.com'}
                      className="border-white/20 text-white hover:bg-white/10 justify-start"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}