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

  }
];

export default function ProjectsSection() {
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const displayedProjects = projects.slice(0, 3); // Show only first 3 projects

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

          {/* Projects Grid */}
          <div className="projects-grid">
            {displayedProjects.map((project) => (
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
                  <div className="image-placeholder-content">
                    <div className="placeholder-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <path d="M21 15l-5-5L5 21"/>
                      </svg>
                    </div>
                    <span className="placeholder-text">Project Preview</span>
                  </div>
                </div>
              </div>
            ))}
            
            {/* View More Card */}
            <div className="project-card raycast-style view-more-card">
              <div className="project-header">
                <div className="project-icon-wrapper">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                </div>
                <h3 className="project-title">View More</h3>
                <button className="project-arrow">
                  <ChevronRight size={20} />
                </button>
              </div>
              
              <p className="project-description">
                Explore additional projects and experiments
              </p>
              
              <div className="view-more-preview">
                <div className="more-project-item">
                  <span className="more-project-number">+6</span>
                  <span className="more-project-text">More Projects</span>
                </div>
                <div className="more-categories">
                  <div className="category-tag">Machine Learning</div>
                  <div className="category-tag">Web Development</div>
                  <div className="category-tag">Mobile Apps</div>
                  <div className="category-tag">Data Science</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}