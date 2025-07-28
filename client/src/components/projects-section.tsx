import { useState } from 'react';
import { ExternalLink, Github, ChevronRight, Code2, Brain, FileSearch } from 'lucide-react';

interface Project {
  id: number;
  title: string;
  description: string;
  icon?: React.ReactNode;
  preview?: string[];
}

const projects: Project[] = [
  {
    id: 1,
    title: "Linear",
    description: "Create, search and modify your issues without leaving your keyboard.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="rgba(139, 92, 246, 0.3)"/>
        <path d="M10 16L16 22L22 10" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    preview: [
      "⌘K Quick actions",
      "⌘/ Create new issue", 
      "⌘. Open command menu",
      "⌘⇧P Project switcher",
      "⌘⇧F Global search"
    ]
  },
  {
    id: 2,
    title: "Google Translate",
    description: "Use Google Translate to effortlessly translate into multiple languages",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="rgba(59, 130, 246, 0.3)"/>
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="rgba(255, 255, 255, 0.9)" fontSize="16" fontWeight="600">G</text>
      </svg>
    ),
    preview: [
      "Omelette du fromage بالجبنة",
      "Cheese Omelette Kaas omelet",
      "Tortilla de queso Ostomeletti",
      "Käse omlett Omelette al form",
      "Ushizi Omelette チーズオムレツ"
    ]
  },
  {
    id: 3,
    title: "GitHub",
    description: "Search and browse GitHub repositories without leaving your keyboard",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="rgba(20, 20, 20, 0.9)"/>
        <path d="M16 8C11.582 8 8 11.582 8 16c0 3.535 2.292 6.533 5.47 7.59.4.073.547-.173.547-.385 0-.19-.007-.693-.01-1.36-2.226.483-2.695-1.073-2.695-1.073-.364-.924-.889-1.17-.889-1.17-.726-.496.055-.486.055-.486.803.056 1.226.824 1.226.824.714 1.223 1.872.87 2.328.665.073-.517.28-.87.508-1.07-1.777-.202-3.645-.888-3.645-3.954 0-.873.312-1.587.824-2.147-.083-.202-.357-1.016.078-2.117 0 0 .672-.215 2.2.82A7.66 7.66 0 0116 12.07c.68.003 1.365.092 2.004.27 1.527-1.035 2.198-.82 2.198-.82.436 1.101.162 1.915.08 2.117.513.56.823 1.274.823 2.147 0 3.073-1.87 3.75-3.653 3.947.287.247.543.735.543 1.48 0 1.07-.01 1.933-.01 2.195 0 .215.144.463.55.385C21.71 22.53 24 19.535 24 16c0-4.418-3.582-8-8-8z" fill="rgba(255, 255, 255, 0.9)"/>
      </svg>
    ),
    preview: [
      "★ 125k facebook/react",
      "★ 89k microsoft/vscode",
      "★ 67k tensorflow/tensorflow",
      "★ 45k vercel/next.js",
      "★ 38k vuejs/vue"
    ]
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