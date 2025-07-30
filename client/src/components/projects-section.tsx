import { useState, useEffect, useRef } from 'react';
import { ExternalLink, Github, ChevronRight, Code2, Brain, FileSearch, ChevronLeft } from 'lucide-react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import type { Project } from '@/types/project';
import { colorThemes } from '@/types/project';

export default function ProjectsSection() {
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Fetch projects from API
  const { data: projects = [], isLoading, error } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const updateMask = () => {
      const scrollLeft = container.scrollLeft;
      const maxScroll = container.scrollWidth - container.clientWidth;
      
      // Update button states
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < maxScroll - 1);
      
      let maskGradient = '';
      
      if (maxScroll === 0) {
        // No scrolling needed
        maskGradient = 'none';
      } else if (scrollLeft === 0) {
        // At start - blur right only
        maskGradient = 'linear-gradient(90deg, black calc(100% - 40px), transparent 100%)';
      } else if (scrollLeft >= maxScroll - 1) {
        // At end - blur left only
        maskGradient = 'linear-gradient(90deg, transparent 0px, black 40px)';
      } else {
        // Middle - blur both sides
        maskGradient = 'linear-gradient(90deg, transparent 0px, black 40px, black calc(100% - 40px), transparent 100%)';
      }
      
      container.style.mask = maskGradient;
      container.style.webkitMask = maskGradient;
    };

    // Initial mask
    updateMask();
    
    // Update on scroll
    container.addEventListener('scroll', updateMask);

    // Cleanup listener
    return () => {
      if (container) {
        container.removeEventListener('scroll', updateMask);
      }
    };
  }, []);

  const scrollTo = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 400; // Adjust based on card width
    const currentScroll = container.scrollLeft;
    const targetScroll = direction === 'left' 
      ? currentScroll - scrollAmount 
      : currentScroll + scrollAmount;

    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  };

  // Helper function to get the project icon based on color theme
  const getProjectIcon = (colorTheme: string) => {
    const theme = (colorThemes as any)[colorTheme] || colorThemes.blue;
    
    switch (colorTheme) {
      case 'green':
        return (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill={theme.background}/>
            <path d="M16 8v8m-4-4h8M12 20h8a2 2 0 002-2v-4a2 2 0 00-2-2h-8a2 2 0 00-2 2v4a2 2 0 002 2z" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'blue':
        return (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill={theme.background}/>
            <circle cx="16" cy="16" r="8" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="2"/>
            <path d="M16 12v4l3 3" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case 'yellow':
        return (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill={theme.background}/>
            <path d="M8 20h16M8 12a4 4 0 018 0 4 4 0 014 4v0a4 4 0 01-4 4" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 24v-4M20 24v-4" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case 'purple':
        return (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill={theme.background}/>
            <path d="M16 8v16M8 12h16l-2-2M8 20h16l-2 2" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'red':
        return (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill={theme.background}/>
            <path d="M8 6h16a2 2 0 012 2v16a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2zM12 12h8M12 16h6" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'teal':
        return (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill={theme.background}/>
            <path d="M16 26v-8M8 18s0-6 8-6 8 6 8 6M12 22c0-2 2-4 4-4s4 2 4 4" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill={theme.background}/>
            <circle cx="16" cy="16" r="8" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="2"/>
            <path d="M16 12v4l3 3" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
    }
  };

  if (isLoading) {
    return (
      <section className="py-20 relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-['Courier_Prime'] text-white mb-4">Projects</h2>
            <p className="text-gray-400">Loading projects...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-['Courier_Prime'] text-white mb-4">Projects</h2>
            <p className="text-red-400">Failed to load projects. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 relative">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-['Courier_Prime'] text-white mb-4">Projects</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            A collection of projects showcasing different technologies and approaches to solving real-world problems.
          </p>
        </div>

        <div className="relative">
          {/* Left scroll button */}
          <button
            onClick={() => scrollTo('left')}
            className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-gray-800/80 backdrop-blur-sm border border-gray-700 flex items-center justify-center transition-all duration-300 ${
              canScrollLeft 
                ? 'text-white hover:bg-gray-700 hover:scale-110' 
                : 'text-gray-600 cursor-not-allowed'
            }`}
            disabled={!canScrollLeft}
          >
            <ChevronLeft size={20} />
          </button>

          {/* Right scroll button */}
          <button
            onClick={() => scrollTo('right')}
            className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-gray-800/80 backdrop-blur-sm border border-gray-700 flex items-center justify-center transition-all duration-300 ${
              canScrollRight 
                ? 'text-white hover:bg-gray-700 hover:scale-110' 
                : 'text-gray-600 cursor-not-allowed'
            }`}
            disabled={!canScrollRight}
          >
            <ChevronRight size={20} />
          </button>

          {/* Projects container */}
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="flex gap-6 px-16 py-4 min-w-max">
              {projects.map((project) => {
                const theme = (colorThemes as any)[project.colorTheme] || colorThemes.blue;
                
                return (
                  <Link key={project.id} href={`/project/${project.id}`} className="block">
                    <div
                      className="relative bg-gray-900/50 rounded-xl p-6 border border-gray-800 transition-all duration-300 cursor-pointer min-w-[320px] max-w-[320px] group"
                      onMouseEnter={() => setHoveredProject(project.id)}
                      onMouseLeave={() => setHoveredProject(null)}
                      style={{
                        boxShadow: hoveredProject === project.id ? 
                          theme.glow : 
                          'none',
                        willChange: 'box-shadow, transform'
                      }}
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                          {getProjectIcon(project.colorTheme)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white text-lg font-['Courier_Prime'] group-hover:text-green-400 transition-colors duration-300">
                            {project.title}
                          </h3>
                        </div>
                      </div>
                      
                      <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
                        {project.description}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Code2 size={14} />
                          <span>View Project</span>
                        </div>
                        <ChevronRight size={12} className="opacity-60" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}