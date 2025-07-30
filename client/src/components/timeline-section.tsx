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
import { useQuery } from '@tanstack/react-query';
import type { WorkExperience } from '@shared/schema';

// Now using database data instead of hardcoded array

export default function TimelineSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Fetch work experiences from API
  const { data: workExperiences = [], isLoading, error } = useQuery<WorkExperience[]>({
    queryKey: ['/api/work-experiences'],
  });

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
      if (workExperiences.length === 0) return;
      // Current position is at index 3 (last item - current position)
      const currentIndex = workExperiences.length - 1; // Last item is current
      
      // Get actual card width based on screen size
      let cardWidth = Math.min(window.innerWidth - 48, 240); // Dynamic mobile width
      if (window.innerWidth >= 1024) {
        cardWidth = 400;
      } else if (window.innerWidth >= 768) {
        cardWidth = 380;
      } else if (window.innerWidth >= 640) {
        cardWidth = 350;
      } else if (window.innerWidth >= 480) {
        cardWidth = Math.min(300, window.innerWidth - 64);
      } else if (window.innerWidth >= 375) {
        cardWidth = Math.min(280, window.innerWidth - 64);
      }
      
      // Get actual gap based on screen size
      let gap = 24; // 1.5rem = 24px (mobile)
      if (window.innerWidth >= 1024) {
        gap = 48; // 3rem = 48px
      } else if (window.innerWidth >= 768) {
        gap = 40; // 2.5rem = 40px
      } else if (window.innerWidth >= 640) {
        gap = 32; // 2rem = 32px
      }

      // Get viewport dimensions
      const viewportWidth = window.innerWidth;
      const viewportCenter = viewportWidth / 2;

      // Calculate position of current card's left edge relative to container start
      const currentCardLeft = currentIndex * (cardWidth + gap);

      // Calculate position of current card's center
      const currentCardCenter = currentCardLeft + cardWidth / 2;

      // Container has padding that shifts content
      let containerPadding = 16; // Mobile: 1rem
      if (window.innerWidth >= 1024) {
        containerPadding = viewportWidth / 2 - 200;
      } else if (window.innerWidth >= 768) {
        containerPadding = viewportWidth / 2 - 300;
      } else if (window.innerWidth >= 640) {
        containerPadding = 32; // 2rem
      }

      // We want: current card center = viewport center (when scrolled)
      // scroll + viewportCenter = currentCardCenter + containerPadding
      // Therefore: scroll = currentCardCenter + containerPadding - viewportCenter
      const scrollNeeded =
        currentCardCenter + containerPadding - viewportCenter;

      // Apply the scroll with additional offset to ensure nothing appears to the right
      const finalScroll = scrollNeeded + (window.innerWidth >= 768 ? 550 : 300); // Responsive offset
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
  }, [workExperiences]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      // Get dynamic card width based on screen size
      let scrollAmount = Math.min(window.innerWidth - 48, 240);
      if (window.innerWidth >= 1024) {
        scrollAmount = 400;
      } else if (window.innerWidth >= 768) {
        scrollAmount = 380;
      } else if (window.innerWidth >= 640) {
        scrollAmount = 350;
      } else if (window.innerWidth >= 480) {
        scrollAmount = Math.min(300, window.innerWidth - 64);
      } else if (window.innerWidth >= 375) {
        scrollAmount = Math.min(280, window.innerWidth - 64);
      }
      scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      // Get dynamic card width based on screen size
      let scrollAmount = Math.min(window.innerWidth - 48, 240);
      if (window.innerWidth >= 1024) {
        scrollAmount = 400;
      } else if (window.innerWidth >= 768) {
        scrollAmount = 380;
      } else if (window.innerWidth >= 640) {
        scrollAmount = 350;
      } else if (window.innerWidth >= 480) {
        scrollAmount = Math.min(300, window.innerWidth - 64);
      } else if (window.innerWidth >= 375) {
        scrollAmount = Math.min(280, window.innerWidth - 64);
      }
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (isLoading) {
    return (
      <section className="timeline-section" id="timeline">
        <div className="timeline-container">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="timeline-header">
              <h2 className="timeline-title">Work Experience</h2>
              <p className="timeline-subtitle">Loading work experiences...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="timeline-section" id="timeline">
        <div className="timeline-container">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="timeline-header">
              <h2 className="timeline-title">Work Experience</h2>
              <p className="timeline-subtitle">Failed to load work experiences. Please try again later.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

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
