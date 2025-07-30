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
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

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

  // Enhanced 3D Corner Pop-out Effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, projectId: string) => {
    const card = cardRefs.current.get(projectId);
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Update CSS custom properties for dynamic glow position
    const mouseXPercent = ((e.clientX - rect.left) / rect.width) * 100;
    const mouseYPercent = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mouse-x', `${mouseXPercent}%`);
    card.style.setProperty('--mouse-y', `${mouseYPercent}%`);
    
    // Normalize mouse position (-1 to 1)
    const normalizedX = mouseX / (rect.width / 2);
    const normalizedY = mouseY / (rect.height / 2);
    
    // Calculate distance from center (0 to ~1.4 for corners)
    const distanceFromCenter = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
    
    // Enhanced corner detection - calculate which corner/edge is closest
    const absX = Math.abs(normalizedX);
    const absY = Math.abs(normalizedY);
    const isNearEdge = absX > 0.6 || absY > 0.6; // Closer to edges
    const isNearCorner = absX > 0.7 && absY > 0.7; // In corner regions
    
    // Enhanced multipliers for dramatic corner effects
    let intensityMultiplier = 1;
    if (isNearCorner) {
      intensityMultiplier = 2.5; // Much more dramatic at corners
    } else if (isNearEdge) {
      intensityMultiplier = 1.8; // Enhanced at edges
    } else {
      intensityMultiplier = Math.max(0.3, distanceFromCenter); // Minimal at center
    }
    
    // Calculate tilt angles with enhanced corner effects
    const baseTilt = 20; // Increased base tilt
    const tiltX = normalizedY * baseTilt * intensityMultiplier;
    const tiltY = -normalizedX * baseTilt * intensityMultiplier;
    
    // Calculate zoom with corner emphasis
    const baseZoom = 1.02;
    const maxZoom = isNearCorner ? 1.15 : (isNearEdge ? 1.10 : 1.06);
    const zoom = baseZoom + (maxZoom - baseZoom) * Math.pow(distanceFromCenter, 1.5);
    
    // Enhanced translation for pop-out effect
    const maxTranslate = isNearCorner ? 16 : (isNearEdge ? 12 : 6);
    const translateX = normalizedX * maxTranslate * intensityMultiplier;
    const translateY = normalizedY * maxTranslate * intensityMultiplier;
    
    // Calculate Z-axis translation for pop-out effect
    const popOutDistance = isNearCorner ? 25 : (isNearEdge ? 15 : 8);
    const translateZ = distanceFromCenter * popOutDistance;
    
    // Apply enhanced transform with z-translation
    card.style.transform = `
      perspective(1200px) 
      rotateX(${tiltX}deg) 
      rotateY(${tiltY}deg) 
      scale(${zoom}) 
      translate3d(${translateX}px, ${translateY}px, ${translateZ}px)
    `;

    // Enhanced parallax for inner elements with corner awareness
    const icon = card.querySelector('.project-icon-wrapper') as HTMLElement;
    const arrow = card.querySelector('.project-arrow') as HTMLElement;
    const header = card.querySelector('.project-header') as HTMLElement;
    
    const iconIntensity = isNearCorner ? 0.5 : 0.3;
    const arrowIntensity = isNearCorner ? 0.6 : 0.4;
    const headerIntensity = isNearCorner ? 0.2 : 0.1;
    
    if (icon) {
      icon.style.transform = `translate3d(${translateX * iconIntensity}px, ${translateY * iconIntensity}px, ${translateZ * 0.6}px)`;
    }
    
    if (arrow) {
      arrow.style.transform = `translate3d(${translateX * arrowIntensity}px, ${translateY * arrowIntensity}px, ${translateZ * 0.8}px)`;
    }
    
    if (header) {
      header.style.transform = `translate3d(${translateX * headerIntensity}px, ${translateY * headerIntensity}px, ${translateZ * 0.3}px)`;
    }
  };

  const handleMouseEnter = (projectId: string) => {
    setHoveredProject(projectId);
    const card = cardRefs.current.get(projectId);
    if (card) {
      card.style.transition = 'transform 0.1s cubic-bezier(0.4, 0, 0.2, 1)';
    }
  };

  const handleMouseLeave = (projectId: string) => {
    setHoveredProject(null);
    const card = cardRefs.current.get(projectId);
    if (card) {
      card.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1) translate3d(0, 0, 0)';
      
      // Reset mouse position for glow
      card.style.setProperty('--mouse-x', '50%');
      card.style.setProperty('--mouse-y', '50%');
      
      // Reset inner elements
      const icon = card.querySelector('.project-icon-wrapper') as HTMLElement;
      const arrow = card.querySelector('.project-arrow') as HTMLElement;
      const header = card.querySelector('.project-header') as HTMLElement;
      
      if (icon) {
        icon.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        icon.style.transform = 'translate3d(0, 0, 0)';
      }
      
      if (arrow) {
        arrow.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        arrow.style.transform = 'translate3d(0, 0, 0)';
      }
      
      if (header) {
        header.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        header.style.transform = 'translate3d(0, 0, 0)';
      }
    }
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
                    ref={(el) => {
                      if (el) {
                        cardRefs.current.set(project.id, el);
                      } else {
                        cardRefs.current.delete(project.id);
                      }
                    }}
                    className="project-card raycast-style"
                    data-project-id={visualId}
                    onMouseEnter={() => handleMouseEnter(project.id)}
                    onMouseLeave={() => handleMouseLeave(project.id)}
                    onMouseMove={(e) => handleMouseMove(e, project.id)}
                  >
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