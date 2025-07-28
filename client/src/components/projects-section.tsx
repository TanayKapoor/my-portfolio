import { useState } from 'react';
import { ExternalLink, Github } from 'lucide-react';

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
}

const projects: Project[] = [
  {
    id: 1,
    title: "AI-Powered Code Assistant",
    description: "An intelligent IDE plugin that provides real-time code suggestions and refactoring recommendations using advanced LLMs.",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&h=300&fit=crop&crop=entropy",
    techStack: ["Python", "TensorFlow", "TypeScript", "React"],
    liveUrl: "https://example.com",
    githubUrl: "https://github.com",
    featured: true
  },
  {
    id: 2,
    title: "Real-time Analytics Dashboard",
    description: "A comprehensive dashboard for monitoring and analyzing application metrics with ML-based anomaly detection.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop&crop=entropy",
    techStack: ["React", "Node.js", "PostgreSQL", "Chart.js"],
    liveUrl: "https://example.com",
    githubUrl: "https://github.com"
  },
  {
    id: 3,
    title: "Smart Document Processor",
    description: "Automated document processing system using OCR and NLP to extract and categorize information from various file formats.",
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500&h=300&fit=crop&crop=entropy",
    techStack: ["Python", "OpenCV", "FastAPI", "Docker"],
    githubUrl: "https://github.com"
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
            {projects.map((project) => (
              <div
                key={project.id}
                className={`project-card ${project.featured ? 'featured' : ''}`}
                onMouseEnter={() => setHoveredProject(project.id)}
                onMouseLeave={() => setHoveredProject(null)}
              >
                {/* Project Image */}
                <div className="project-image-container">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="project-image"
                  />
                  <div className={`project-overlay ${hoveredProject === project.id ? 'active' : ''}`}>
                    <div className="project-links">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="project-link"
                          aria-label="View live project"
                        >
                          <ExternalLink size={20} />
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="project-link"
                          aria-label="View source code"
                        >
                          <Github size={20} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Project Content */}
                <div className="project-content">
                  <h3 className="project-title">{project.title}</h3>
                  <p className="project-description">{project.description}</p>
                  
                  {/* Tech Stack */}
                  <div className="project-tech-stack">
                    {project.techStack.map((tech, index) => (
                      <span key={index} className="tech-tag">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}