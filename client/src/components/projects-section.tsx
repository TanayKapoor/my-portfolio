import { useState } from 'react';
import { ExternalLink, Github, ChevronRight, Code2, Brain, FileSearch } from 'lucide-react';

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
  icon?: React.ReactNode;
  preview?: string[];
}

const projects: Project[] = [
  {
    id: 1,
    title: "CodeFlow",
    description: "Create, search and modify your code without leaving your keyboard.",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&h=300&fit=crop&crop=entropy",
    techStack: ["Python", "TensorFlow", "TypeScript", "React"],
    liveUrl: "https://example.com",
    githubUrl: "https://github.com",
    featured: true,
    icon: <Code2 size={32} />,
    preview: [
      "// AI-powered code completion",
      "function generateOptimizedCode() {",
      "  const suggestions = await AI.analyze(context);",
      "  return suggestions.map(s => s.optimized);",
      "}"
    ]
  },
  {
    id: 2,
    title: "Neural Translate",
    description: "Use AI to effortlessly translate into multiple languages",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop&crop=entropy",
    techStack: ["React", "Node.js", "PostgreSQL", "Chart.js"],
    liveUrl: "https://example.com",
    githubUrl: "https://github.com",
    icon: <Brain size={32} />,
    preview: [
      "Machine Learning Models",
      "Natural Language Processing",
      "Real-time Translation API",
      "Multi-language Support",
      "Context-aware Results"
    ]
  },
  {
    id: 3,
    title: "DocuScan",
    description: "Automated document processing with OCR and intelligent categorization",
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500&h=300&fit=crop&crop=entropy",
    techStack: ["Python", "OpenCV", "FastAPI", "Docker"],
    githubUrl: "https://github.com",
    icon: <FileSearch size={32} />,
    preview: [
      "• PDF Document Analysis",
      "• Image Text Extraction",
      "• Smart Categorization",
      "• Batch Processing",
      "• API Integration"
    ]
  },
  {
    id: 4,
    title: "E-commerce Recommendation Engine",
    description: "Machine learning powered recommendation system that personalizes product suggestions based on user behavior and preferences.",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&h=300&fit=crop&crop=entropy",
    techStack: ["Python", "scikit-learn", "Redis", "React"],
    liveUrl: "https://example.com"
  },
  {
    id: 5,
    title: "Collaborative Task Manager",
    description: "Real-time collaborative task management application with AI-powered task prioritization and workload balancing.",
    image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=300&fit=crop&crop=entropy",
    techStack: ["Next.js", "Socket.io", "MongoDB", "Tailwind"],
    liveUrl: "https://example.com",
    githubUrl: "https://github.com"
  },
  {
    id: 6,
    title: "Health Monitoring Platform",
    description: "IoT-based health monitoring system with predictive analytics for early detection of health anomalies.",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&h=300&fit=crop&crop=entropy",
    techStack: ["Python", "TensorFlow", "Flutter", "Firebase"],
    githubUrl: "https://github.com"
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
                className={`project-card raycast-style ${project.featured ? 'featured' : ''}`}
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

                {/* Preview Content */}
                {project.preview && (
                  <div className="project-preview">
                    {project.preview.map((line, index) => (
                      <div key={index} className="preview-line">
                        {line}
                      </div>
                    ))}
                  </div>
                )}

                {/* Bottom Section with Links */}
                <div className="project-bottom">
                  <div className="project-links">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-link-icon"
                        aria-label="View live project"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-link-icon"
                        aria-label="View source code"
                      >
                        <Github size={16} />
                      </a>
                    )}
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