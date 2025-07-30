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
    
    // Update on resize
    window.addEventListener('resize', updateMask);
    
    return () => {
      container.removeEventListener('scroll', updateMask);
      window.removeEventListener('resize', updateMask);
    };
  }, []);

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
            {projects.map((project) => (
              <Link 
                key={project.id} 
                href={`/project/${project.id}`}
                className="project-card-link"
              >
                <div
                  className="project-card raycast-style"
                  data-project-id={project.id}
                  onMouseEnter={() => setHoveredProject(project.id)}
                  onMouseLeave={() => setHoveredProject(null)}
                >
                {/* Header with Icon and Title */}
                <div className="project-header">
                  <div className="project-icon-wrapper">
                    {project.icon || <Code2 size={32} />}
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
                    {project.id === 1 && (
                      <div className="meal-planner-visual">
                        <div className="food-grid">
                          <div className="food-item green"></div>
                          <div className="food-item orange"></div>
                          <div className="food-item red"></div>
                          <div className="food-item yellow"></div>
                        </div>
                      </div>
                    )}
                    {project.id === 2 && (
                      <div className="timer-visual">
                        <div className="timer-circle">
                          <div className="timer-progress"></div>
                          <div className="timer-center">25:00</div>
                        </div>
                      </div>
                    )}
                    {project.id === 3 && (
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
                    {project.id === 4 && (
                      <div className="expense-visual">
                        <div className="expense-chart">
                          <div className="expense-category" style={{width: '40%'}}></div>
                          <div className="expense-category" style={{width: '25%'}}></div>
                          <div className="expense-category" style={{width: '20%'}}></div>
                          <div className="expense-category" style={{width: '15%'}}></div>
                        </div>
                      </div>
                    )}
                    {project.id === 5 && (
                      <div className="reading-visual">
                        <div className="book-stack">
                          <div className="book book-1"></div>
                          <div className="book book-2"></div>
                          <div className="book book-3"></div>
                        </div>
                      </div>
                    )}
                    {project.id === 6 && (
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
            ))}
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