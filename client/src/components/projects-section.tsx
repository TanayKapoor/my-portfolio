import { useState, useEffect, useRef } from 'react';
import { ExternalLink, Github, ChevronRight, Code2, Brain, FileSearch, ChevronLeft, Utensils, Timer, Cloud, DollarSign, BookOpen, Sprout } from 'lucide-react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import type { Project } from '@shared/schema';
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
      let overlayGradient = '';
      
      if (maxScroll === 0) {
        // No scrolling needed
        maskGradient = 'none';
        overlayGradient = 'none';
      } else if (scrollLeft === 0) {
        // At start - blur right only with dark gradient
        maskGradient = 'linear-gradient(90deg, black calc(100% - 60px), transparent 100%)';
        overlayGradient = 'linear-gradient(90deg, transparent calc(100% - 60px), rgba(15, 23, 42, 0.8) 100%)';
      } else if (scrollLeft >= maxScroll - 1) {
        // At end - blur left only with dark gradient
        maskGradient = 'linear-gradient(90deg, transparent 0px, black 60px)';
        overlayGradient = 'linear-gradient(90deg, rgba(15, 23, 42, 0.8) 0%, transparent 60px)';
      } else {
        // Middle - blur both sides with dark gradients
        maskGradient = 'linear-gradient(90deg, transparent 0px, black 60px, black calc(100% - 60px), transparent 100%)';
        overlayGradient = 'linear-gradient(90deg, rgba(15, 23, 42, 0.8) 0%, transparent 60px, transparent calc(100% - 60px), rgba(15, 23, 42, 0.8) 100%)';
      }
      
      container.style.mask = maskGradient;
      container.style.webkitMask = maskGradient;
      
      // Apply overlay gradient using a pseudo-element style approach
      container.style.setProperty('--overlay-gradient', overlayGradient);
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

  // Helper function to get the project icon from database or fallback
  const getProjectIcon = (project: Project) => {
    // If project has an uploaded icon, use that
    if (project.iconUrl) {
      return (
        <img 
          src={project.iconUrl} 
          alt={`${project.title} icon`}
          className="w-8 h-8 rounded-lg object-cover"
        />
      );
    }

    // Map of icon names to Lucide icons
    const iconMap = {
      'utensils': Utensils,
      'timer': Timer,
      'cloud': Cloud,
      'dollar-sign': DollarSign,
      'book-open': BookOpen,
      'sprout': Sprout,
      'code2': Code2,
      'brain': Brain,
      'file-search': FileSearch
    };

    // Get icon from database or fallback based on project title
    let IconComponent = iconMap['code2']; // default
    
    if (project.iconName && iconMap[project.iconName as keyof typeof iconMap]) {
      IconComponent = iconMap[project.iconName as keyof typeof iconMap];
    } else if (project.title) {
      // Fallback based on project title
      const titleLower = project.title.toLowerCase();
      if (titleLower.includes('meal') || titleLower.includes('food')) {
        IconComponent = Utensils;
      } else if (titleLower.includes('timer') || titleLower.includes('focus')) {
        IconComponent = Timer;
      } else if (titleLower.includes('weather') || titleLower.includes('climate')) {
        IconComponent = Cloud;
      } else if (titleLower.includes('expense') || titleLower.includes('money') || titleLower.includes('budget')) {
        IconComponent = DollarSign;
      } else if (titleLower.includes('reading') || titleLower.includes('book')) {
        IconComponent = BookOpen;
      } else if (titleLower.includes('plant') || titleLower.includes('care')) {
        IconComponent = Sprout;
      }
    }

    return <IconComponent size={32} className="text-white" />;
  };

  // Helper function to trim description
  const trimDescription = (description: string, maxLength: number = 100) => {
    if (description.length <= maxLength) return description;
    const trimmed = description.substring(0, maxLength);
    const lastSpace = trimmed.lastIndexOf(' ');
    if (lastSpace > 0) {
      return trimmed.substring(0, lastSpace) + '...';
    }
    return trimmed + '...';
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
    return project?.title ? (titleMap[project.title] || (index + 1)) : (index + 1);
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
    
    // Calculate rotation angles based on mouse position (more dramatic)
    const rotateX = (center.y / rect.height) * -30; // Increased rotation range
    const rotateY = (center.x / rect.width) * 30;   // Increased rotation range
    const distance = Math.sqrt(center.x**2 + center.y**2);
    
    // Create the 3D transform with perspective and dramatic rotation
    const transform = `
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale3d(1.05, 1.05, 1.05)
      translateZ(20px)
    `;
    
    // Create the glow effect that follows the mouse
    const glow = `
      radial-gradient(
        circle at
        ${leftX}px
        ${topY}px,
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
                        {getProjectIcon(project)}
                      </div>
                      <h3 className="project-title">{project.title}</h3>
                      <button className="project-arrow">
                        <ChevronRight size={20} />
                      </button>
                    </div>

                    {/* Description */}
                    <p className="project-description">{trimDescription(project.description)}</p>

                    {/* Divider */}
                    <div className="project-divider"></div>

                    {/* Project Screenshots or Visual Placeholder */}
                    <div className="project-image-placeholder">
                      <div className="project-visual-content">
                        {project.screenshotUrls && project.screenshotUrls.length > 0 ? (
                          <div className="project-screenshot">
                            <img 
                              src={project.screenshotUrls[0]} 
                              alt={`${project.title} screenshot`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            {project.screenshotUrls.length > 1 && (
                              <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                                +{project.screenshotUrls.length - 1}
                              </div>
                            )}
                          </div>
                        ) : (
                          // Fallback to visual elements when no screenshots available
                          <>
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
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          
          {/* View All Projects Button with Scroll Controls */}
          <div className="view-more-container">
            <div className="view-more-text">
              <Link href="/projects">
                <button className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg text-white transition-all duration-300 hover:scale-105">
                  View All Projects
                </button>
              </Link>
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