import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
  Calendar,
  MapPin,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

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
  type: "current" | "past";
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
      "Built personal projects to strengthen programming skills",
    ],
    technologies: ["React Native", "JavaScript", "Firebase", "Git"],
    type: "past",
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
      "Gained experience in deployment and DevOps practices",
    ],
    technologies: ["MongoDB", "Express.js", "React", "Node.js", "Git", "Linux"],
    type: "past",
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
      "Collaborated with cross-functional teams on product roadmap",
    ],
    technologies: [
      "JavaScript",
      "Python",
      "React",
      "Django",
      "PostgreSQL",
      "Redis",
    ],
    type: "past",
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
      "Architecting cloud-native solutions for production ML workflows",
    ],
    technologies: ["Python", "React", "Node.js", "TensorFlow", "AWS", "Docker"],
    type: "current",
  },
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
      const currentCardCenter = currentCardLeft + cardWidth / 2;

      // Container has padding that shifts content
      const containerPadding = viewportWidth / 2 - 200; // calc(50vw - 200px)

      // We want: current card center = viewport center (when scrolled)
      // scroll + viewportCenter = currentCardCenter + containerPadding
      // Therefore: scroll = currentCardCenter + containerPadding - viewportCenter
      const scrollNeeded =
        currentCardCenter + containerPadding - viewportCenter;

      // Apply the scroll with additional offset to ensure nothing appears to the right
      const finalScroll = scrollNeeded + 550; // Add 150px to move current card more to the left
      container.scrollLeft = Math.max(0, finalScroll);
      console.log(
        `Centering current position. Final scroll: ${finalScroll}, card center: ${currentCardCenter}, viewport center: ${viewportCenter}`,
      );
    };

    // Multiple attempts to ensure proper centering
    const initTimeout1 = setTimeout(initializeScroll, 100);
    const initTimeout2 = setTimeout(initializeScroll, 500);
    const initTimeout3 = setTimeout(() => {
      initializeScroll();
      updateScrollState();
    }, 1000);

    // Update on scroll
    container.addEventListener("scroll", updateScrollState);

    return () => {
      clearTimeout(initTimeout1);
      clearTimeout(initTimeout2);
      clearTimeout(initTimeout3);
      container.removeEventListener("scroll", updateScrollState);
    };
  }, []);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -400, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 400, behavior: "smooth" });
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
              My professional journey through the years - current role
              highlighted in the center
            </p>
          </div>

          {/* Timeline Scroll Container */}
          <div className="timeline-scroll-wrapper">
            {/* Timeline Line - Solid to current, dotted after */}
            <div className="timeline-line-container">
              {/* Solid line up to current position */}
              <div className="timeline-line-solid" />
              {/* Dotted line after current */}
              <div className="timeline-line-dotted" />
              {/* Arrow at the end */}
              <div className="timeline-arrow" />
            </div>

            <div className="timeline-scroll-container" ref={scrollContainerRef}>
              {/* Experience Cards */}
              {workExperiences.map((experience, index) => (
                <motion.div
                  key={experience.id}
                  className={`timeline-item ${experience.type}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: index * 0.1,
                    duration: 0.5,
                    ease: "easeOut"
                  }}
                >
                  {/* Timeline Dot */}
                  <motion.div
                    className={`timeline-dot ${index === workExperiences.length - 1 ? "current" : ""}`}
                    animate={experience.type === "current" ? {
                      scale: [1, 1.2, 1],
                    } : {}}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <div className="dot-inner"></div>
                  </motion.div>

                  {/* Experience Card */}
                  <motion.div 
                    className="experience-card"
                    whileHover={{ 
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                    animate={experience.type === "current" ? {
                      boxShadow: [
                        "0 0 20px rgba(34, 197, 94, 0.3)",
                        "0 0 40px rgba(34, 197, 94, 0.5)",
                        "0 0 20px rgba(34, 197, 94, 0.3)"
                      ]
                    } : {}}
                    transition={{
                      boxShadow: {
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }
                    }}
                  >
                    {/* Card Header */}
                    <div className="card-header">
                      <div className="position-info">
                        <motion.h3 
                          className="position-title"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + index * 0.1 }}
                        >
                          {experience.position}
                        </motion.h3>
                        <motion.div 
                          className="company-info"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                        >
                          <span className="company-name">
                            {experience.company}
                          </span>
                          <div className="location-duration">
                            <MapPin size={14} />
                            <span>{experience.location}</span>
                            <Calendar size={14} />
                            <span>{experience.duration}</span>
                          </div>
                        </motion.div>
                      </div>
                      {experience.type === "current" && (
                        <motion.div 
                          className="current-badge"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ 
                            delay: 0.5,
                            type: "spring",
                            stiffness: 200
                          }}
                        >
                          <Sparkles size={14} className="inline mr-1" />
                          Current
                        </motion.div>
                      )}
                    </div>

                    {/* Description */}
                    <motion.div 
                      className="experience-description"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      {experience.description.map((item, i) => (
                        <motion.div 
                          key={i} 
                          className="description-item"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ 
                            delay: 0.5 + index * 0.1 + i * 0.05,
                            duration: 0.3
                          }}
                          whileHover={{ x: 5 }}
                        >
                          <span className="bullet">•</span>
                          <span>{item}</span>
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* Technologies */}
                    <motion.div 
                      className="technologies"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      {experience.technologies.map((tech, i) => (
                        <motion.span 
                          key={i} 
                          className="tech-tag"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ 
                            delay: 0.7 + index * 0.1 + i * 0.05,
                            duration: 0.2
                          }}
                          whileHover={{ 
                            scale: 1.1,
                            backgroundColor: "rgba(59, 130, 246, 0.2)",
                            transition: { duration: 0.1 }
                          }}
                        >
                          {tech}
                        </motion.span>
                      ))}
                    </motion.div>
                  </motion.div>
                </motion.div>
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
                className={`nav-button ${!canScrollLeft ? "disabled" : ""}`}
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                aria-label="Back to present"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                className={`nav-button ${!canScrollRight ? "disabled" : ""}`}
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
