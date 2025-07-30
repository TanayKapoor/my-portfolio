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
  const [cardTransforms, setCardTransforms] = useState<Record<string, { 
    transform: string; 
    glow: string; 
    transition: string;
  }>>({});

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

  // Helper function to map database project IDs to visual project IDs for styling
  const getVisualProjectId = (project: Project, index: number) => {
    // Map based on project title or use index + 1 as fallback
    const titleMap: Record<string, number> = {
      'Smart Meal Planner': 1,
      'Focus Timer Pro': 2,
      'Local Weather Station': 3,
      'Expense Tracker': 4,
      'Reading List Manager': 5,
      'Plant Care Assistant': 6
    };
    return titleMap[project.title] || (index + 1);
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  // Enhanced 3D card animation handlers with glow effect
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>, projectId: string) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const leftX = mouseX - rect.x;
    const topY = mouseY - rect.y;
    const center = {
      x: leftX - rect.width / 2,
      y: topY - rect.height / 2
    };
    const distance = Math.sqrt(center.x**2 + center.y**2);
    
    // Create the 3D transform similar to the reference
    const transform = `
      scale3d(1.05, 1.05, 1.05)
      rotate3d(
        ${center.y / 100},
        ${-center.x / 100},
        0,
        ${Math.log(distance + 1) * 2}deg
      )
    `;
    
    // Create the glow effect that follows the mouse
    const glow = `
      radial-gradient(
        circle at
        ${center.x * 2 + rect.width/2}px
        ${center.y * 2 + rect.height/2}px,
        rgba(255, 255, 255, 0.25),
        rgba(255, 255, 255, 0.05)
      )
    `;

    setCardTransforms(prev => ({
      ...prev,
      [projectId]: {
        transform,
        glow,
        transition: '150ms'
      }
    }));
  };

  const handleCardMouseEnter = (projectId: string) => {
    setHoveredProject(projectId);
  };

  const handleCardMouseLeave = (projectId: string) => {
    setHoveredProject(null);
    setCardTransforms(prev => ({
      ...prev,
      [projectId]: {
        transform: '',
        glow: '',
        transition: '300ms'
      }
    }));
  };

  return (
    <section className="projects-section" id="projects">
      <div className="projects-container">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="projects-title">Projects</h2>
            <p className="projects-subtitle">
              A collection of my recent work and side projects
            </p>
          </div>

          {/* Projects Horizontal Scroll */}
          <div className="projects-scroll-container pl-[0px] pr-[0px] mt-[23px] mb-[23px]" ref={scrollContainerRef}>
            {projects.map((project, index) => {
              const visualId = getVisualProjectId(project, index);
              return (
                <Link 
                  key={project.id} 
                  href={`/project/${project.id}`}
                  className="project-card-link"
                >
                  <div
                    className="project-card raycast-style"
                    data-project-id={visualId}
                    style={{
                      transform: cardTransforms[project.id]?.transform || '',
                      transitionDuration: cardTransforms[project.id]?.transition || '300ms',
                      transitionProperty: 'transform, box-shadow',
                      transitionTimingFunction: 'ease-out'
                    }}
                    onMouseEnter={() => handleCardMouseEnter(project.id)}
                    onMouseLeave={() => handleCardMouseLeave(project.id)}
                    onMouseMove={(e) => handleCardMouseMove(e, project.id)}
                  >
                    {/* Glow overlay */}
                    <div 
                      className="card-glow"
                      style={{
                        backgroundImage: cardTransforms[project.id]?.glow || 'radial-gradient(circle at 50% -20%, rgba(255, 255, 255, 0.1), rgba(0, 0, 0, 0.05))'
                      }}
                    />
                    
                    {/* Header with Icon and Title */}
                    <div className="project-header">
                      <div className="project-icon-wrapper">
                        {getProjectIcon(project.colorTheme)}
                      </div>
                      <h3 className="project-title">{project.title}</h3>
                      <button className="project-arrow">
                        <ChevronRight size={20} />
                      </button>
                    </div>

                    {/* Description */}
                    <p className="project-description">{project.description}</p>

                    {/* Divider */}
                    <div className="project-divider"></div>

                    {/* Bottom Image Placeholder */}
                    <div className="project-image-placeholder">
                      <div className="project-visual-content">
                        {/* Create visual elements based on project type */}
                        {visualId === 1 && (
                          <div className="meal-planner-visual">
                            <div className="food-grid">
                              <div className="food-item green"></div>
                              <div className="food-item orange"></div>
                              <div className="food-item red"></div>
                              <div className="food-item yellow"></div>
                            </div>
                          </div>
                        )}
                        {visualId === 2 && (
                          <div className="timer-visual">
                            <div className="timer-circle">
                              <div className="timer-progress"></div>
                              <div className="timer-center">25:00</div>
                            </div>
                          </div>
                        )}
                        {visualId === 3 && (
                          <div className="weather-visual">
                            <div className="weather-chart">
                              <div className="chart-bar" style={{height: '30%'}}></div>
                              <div className="chart-bar" style={{height: '60%'}}></div>
                              <div className="chart-bar" style={{height: '45%'}}></div>
                              <div className="chart-bar" style={{height: '80%'}}></div>
                              <div className="chart-bar" style={{height: '35%'}}></div>
                            </div>
                          </div>
                        )}
                        {visualId === 4 && (
                          <div className="expense-visual">
                            <div className="expense-chart">
                              <div className="expense-category" style={{width: '40%'}}></div>
                              <div className="expense-category" style={{width: '25%'}}></div>
                              <div className="expense-category" style={{width: '20%'}}></div>
                              <div className="expense-category" style={{width: '15%'}}></div>
                            </div>
                          </div>
                        )}
                        {visualId === 5 && (
                          <div className="reading-visual">
                            <div className="book-stack">
                              <div className="book book-1"></div>
                              <div className="book book-2"></div>
                              <div className="book book-3"></div>
                            </div>
                          </div>
                        )}
                        {visualId === 6 && (
                          <div className="plant-visual">
                            <div className="plant-growth">
                              <div className="growth-stage stage-1"></div>
                              <div className="growth-stage stage-2"></div>
                              <div className="growth-stage stage-3"></div>
                              <div className="growth-stage stage-4"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          
          {/* View More Text with Scroll Controls */}
          <div className="view-more-container">
            <div className="view-more-text">
              <span>View more →</span>
            </div>
            <div className="scroll-controls">
              <button 
                className={`scroll-button ${!canScrollLeft ? 'disabled' : ''}`}
                onClick={scrollLeft}
                disabled={!canScrollLeft}
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                className={`scroll-button ${!canScrollRight ? 'disabled' : ''}`}
                onClick={scrollRight}
                disabled={!canScrollRight}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}