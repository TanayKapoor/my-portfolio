import { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

interface WorkExperience {
  id: number;
  position: string;
  company: string;
  location: string;
  duration: string;
  startDate: string;
  endDate: string;
  description: string[];
  technologies: string[];
  type: 'current' | 'past';
}

const workExperiences: WorkExperience[] = [
  {
    id: 4,
    position: "Intern - Software Development",
    company: "InnovateLabs",
    location: "Remote",
    duration: "2019 - 2020",
    startDate: "2019", 
    endDate: "2020",
    description: [
      "Assisted in developing mobile applications using React Native",
      "Learned fundamentals of software engineering and testing",
      "Participated in code reviews and documentation",
      "Built personal projects to strengthen programming skills"
    ],
    technologies: ["React Native", "JavaScript", "Firebase", "Git"],
    type: "past"
  },
  {
    id: 3,
    position: "Junior Developer",
    company: "StartupHub India",
    location: "Delhi, India", 
    duration: "2020 - 2021",
    startDate: "2020",
    endDate: "2021",
    description: [
      "Worked on full-stack web applications using MERN stack",
      "Contributed to open-source projects and internal tools",
      "Participated in agile development processes",
      "Gained experience in deployment and DevOps practices"
    ],
    technologies: ["MongoDB", "Express.js", "React", "Node.js", "Git", "Linux"],
    type: "past"
  },
  {
    id: 2,
    position: "Software Engineer",
    company: "DataBridge Analytics",
    location: "Bangalore, India",
    duration: "2021 - 2023",
    startDate: "2021",
    endDate: "2023",
    description: [
      "Developed data visualization dashboards using React and D3.js",
      "Built ETL pipelines for processing large-scale datasets",
      "Implemented machine learning models for predictive analytics",
      "Collaborated with cross-functional teams on product roadmap"
    ],
    technologies: ["JavaScript", "Python", "React", "Django", "PostgreSQL", "Redis"],
    type: "past"
  },
  {
    id: 1,
    position: "Full Stack Machine Learning Engineer",
    company: "TechFlow Solutions",
    location: "Mumbai, India",
    duration: "2023 - Present",
    startDate: "2023",
    endDate: "Present",
    description: [
      "Leading development of AI-powered products using modern ML frameworks",
      "Building scalable web applications with React, Node.js, and Python",
      "Implementing LLM integrations and prompt engineering solutions",
      "Architecting cloud-native solutions for production ML workflows"
    ],
    technologies: ["Python", "React", "Node.js", "TensorFlow", "AWS", "Docker"],
    type: "current"
  }
];

export default function TimelineSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const updateScrollState = () => {
      const scrollLeft = container.scrollLeft;
      const maxScroll = container.scrollWidth - container.clientWidth;
      
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < maxScroll - 1);
    };

    // Initialize scroll to show current position in center
    const initializeScroll = () => {
      // Current position is at index 3 (last item - current position)
      const currentIndex = workExperiences.length - 1; // Last item is current
      const cardWidth = 400;
      const gap = 48; // 3rem = 48px
      
      // Get viewport dimensions
      const viewportWidth = window.innerWidth;
      const viewportCenter = viewportWidth / 2;
      
      // Calculate position of current card's left edge relative to container start
      const currentCardLeft = currentIndex * (cardWidth + gap);
      
      // Calculate position of current card's center
      const currentCardCenter = currentCardLeft + (cardWidth / 2);
      
      // Container has padding that shifts content
      const containerPadding = (viewportWidth / 2) - 200; // calc(50vw - 200px)
      
      // We want: current card center = viewport center (when scrolled)
      // scroll + viewportCenter = currentCardCenter + containerPadding
      // Therefore: scroll = currentCardCenter + containerPadding - viewportCenter
      const scrollNeeded = currentCardCenter + containerPadding - viewportCenter;
      
      // Apply the scroll with slight additional offset to ensure nothing appears to the right
      const finalScroll = scrollNeeded + 50; // Add 50px to ensure current is truly rightmost visible
      container.scrollLeft = Math.max(0, finalScroll);
      console.log(`Centering current position. Final scroll: ${finalScroll}, card center: ${currentCardCenter}, viewport center: ${viewportCenter}`);
    };

    // Multiple attempts to ensure proper centering
    const initTimeout1 = setTimeout(initializeScroll, 100);
    const initTimeout2 = setTimeout(initializeScroll, 500);
    const initTimeout3 = setTimeout(() => {
      initializeScroll();
      updateScrollState();
    }, 1000);
    
    // Update on scroll
    container.addEventListener('scroll', updateScrollState);
    
    return () => {
      clearTimeout(initTimeout1);
      clearTimeout(initTimeout2);
      clearTimeout(initTimeout3);
      container.removeEventListener('scroll', updateScrollState);
    };
  }, []);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  return (
    <section className="timeline-section" id="timeline">
      <div className="timeline-container">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="timeline-header">
            <h2 className="timeline-title">Work Experience</h2>
            <p className="timeline-subtitle">
              My professional journey through the years - current role highlighted in the center
            </p>
          </div>

          {/* Timeline Scroll Container */}
          <div className="timeline-scroll-wrapper">
            {/* Timeline Line - Outside scroll container */}
            <div className="timeline-line"></div>
            
            <div className="timeline-scroll-container" ref={scrollContainerRef}>
              
              {/* Experience Cards */}
              {workExperiences.map((experience, index) => (
                <div key={experience.id} className={`timeline-item ${experience.type}`}>
                  
                  {/* Timeline Dot */}
                  <div className={`timeline-dot ${index === workExperiences.length - 1 ? 'current' : ''}`}>
                    <div className="dot-inner"></div>
                  </div>
                  
                  {/* Experience Card */}
                  <div className="experience-card">
                    
                    {/* Card Header */}
                    <div className="card-header">
                      <div className="position-info">
                        <h3 className="position-title">{experience.position}</h3>
                        <div className="company-info">
                          <span className="company-name">{experience.company}</span>
                          <div className="location-duration">
                            <MapPin size={14} />
                            <span>{experience.location}</span>
                            <Calendar size={14} />
                            <span>{experience.duration}</span>
                          </div>
                        </div>
                      </div>
                      {experience.type === 'current' && (
                        <div className="current-badge">Current</div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="experience-description">
                      {experience.description.map((item, i) => (
                        <div key={i} className="description-item">
                          <span className="bullet">•</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    {/* Technologies */}
                    <div className="technologies">
                      {experience.technologies.map((tech, i) => (
                        <span key={i} className="tech-tag">{tech}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="timeline-controls">
            <div className="timeline-nav-text">
              <span>← Past experiences | Current position | Future →</span>
            </div>
            <div className="timeline-nav-buttons">
              <button 
                className={`nav-button ${!canScrollLeft ? 'disabled' : ''}`}
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                aria-label="Back to present"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                className={`nav-button ${!canScrollRight ? 'disabled' : ''}`}
                onClick={scrollRight}
                disabled={!canScrollRight}
                aria-label="Explore past"
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