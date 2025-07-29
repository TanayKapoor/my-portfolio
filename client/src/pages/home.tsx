import { useState } from 'react';
import HalftoneHero from '@/components/halftone-hero';
import AboutSection from '@/components/about-section';
import ProjectsSection from '@/components/projects-section';
import TimelineSection from '@/components/timeline-section';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Mail, Send } from 'lucide-react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    
    // Simulate saving email (in real app, this would be an API call)
    setTimeout(() => {
      toast({
        title: "Email saved!",
        description: "Thanks for connecting. I'll be in touch soon!",
      });
      setEmail('');
      setIsConnecting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/10 backdrop-blur-md z-50 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Left side - Social Icons */}
            <div className="flex items-center space-x-4">
              {/* LinkedIn Icon */}
              <a 
                href="https://linkedin.com/in/tanay-profile" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white hover:text-blue-400 transition-colors duration-300 transform hover:scale-110"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
                </svg>
              </a>
              
              {/* GitHub Icon */}
              <a 
                href="https://github.com/tanay-username" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300 transition-colors duration-300 transform hover:scale-110"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.652.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>

            {/* Right side - Get in touch dropdown */}
            <div className="flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    Get in touch
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 p-4 bg-slate-900 border border-white/20 backdrop-blur-xl">
                  {/* Send email option */}
                  <DropdownMenuItem 
                    className="cursor-pointer hover:bg-white/10 p-3 rounded-lg transition-colors text-white"
                    onClick={() => window.location.href = 'mailto:tanay_kapoor@icloud.com'}
                  >
                    <Mail className="mr-3 h-5 w-5" />
                    <span>Send me an email</span>
                  </DropdownMenuItem>
                  
                  {/* Divider */}
                  <DropdownMenuSeparator className="my-4 bg-white/20" />
                  
                  {/* Email input form */}
                  <div className="px-2">
                    <p className="text-sm text-gray-400 mb-3">
                      Or share your email and I'll reach out to you
                    </p>
                    <form onSubmit={handleEmailSubmit} className="space-y-3">
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-white/40"
                        disabled={isConnecting}
                      />
                      <Button 
                        type="submit" 
                        className="w-full bg-white text-slate-900 hover:bg-gray-200 font-medium transition-all"
                        disabled={isConnecting}
                      >
                        {isConnecting ? (
                          "Connecting..."
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Let's connect
                          </>
                        )}
                      </Button>
                    </form>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <HalftoneHero />
        <AboutSection />
        <ProjectsSection />
        <TimelineSection />
      </main>
    </div>
  );
}
