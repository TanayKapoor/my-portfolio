import { useState } from 'react';
import { ExternalLink, Github, ChevronRight, Code2, Brain, FileSearch } from 'lucide-react';

interface Project {
  id: number;
  title: string;
  description: string;
  icon?: React.ReactNode;
}

const projects: Project[] = [
  {
    id: 1,
    title: "Smart Meal Planner",
    description: "AI-powered meal planning app that suggests recipes based on dietary preferences and available ingredients.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="rgba(34, 197, 94, 0.3)"/>
        <path d="M16 8v8m-4-4h8M12 20h8a2 2 0 002-2v-4a2 2 0 00-2-2h-8a2 2 0 00-2 2v4a2 2 0 002 2z" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 2,
    title: "Focus Timer Pro",
    description: "Minimalist productivity app with Pomodoro technique and ambient soundscapes for deep focus sessions.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="rgba(59, 130, 246, 0.3)"/>
        <circle cx="16" cy="16" r="8" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="2"/>
        <path d="M16 12v4l3 3" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 3,
    title: "Local Weather Station",
    description: "Personal weather tracking app using IoT sensors with beautiful data visualizations and forecasts.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="rgba(245, 158, 11, 0.3)"/>
        <path d="M8 20h16M8 12a4 4 0 018 0 4 4 0 014 4v0a4 4 0 01-4 4" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 24v-4M20 24v-4" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 4,
    title: "Expense Tracker",
    description: "Simple expense tracking with smart categorization and insightful spending analytics.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="rgba(168, 85, 247, 0.3)"/>
        <path d="M16 8v16M8 12h16l-2-2M8 20h16l-2 2" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 5,
    title: "Reading List",
    description: "Personal book tracker with reading progress, notes, and recommendations from your favorite genres.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="rgba(236, 72, 153, 0.3)"/>
        <path d="M8 6h16a2 2 0 012 2v16a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2zM12 12h8M12 16h6" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 6,
    title: "Plant Care Assistant",
    description: "Track watering schedules, growth progress, and health monitoring for your indoor plant collection.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="rgba(20, 184, 166, 0.3)"/>
        <path d="M16 26v-8M8 18s0-6 8-6 8 6 8 6M12 22c0-2 2-4 4-4s4 2 4 4" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  }
];

export default function ProjectsSection() {
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
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
          <div className="projects-scroll-container">
            {projects.map((project) => (
              <div
                key={project.id}
                className="project-card raycast-style"
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
            ))}
          </div>
          
          {/* View More Text */}
          <div className="view-more-text">
            <span>View more →</span>
          </div>
        </div>
      </div>
    </section>
  );
}