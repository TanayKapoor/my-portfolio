import { useEffect, useRef, useState } from 'react';

export default function AboutSection() {
  const aboutContentRef = useRef<HTMLDivElement>(null);
  const [showTldr, setShowTldr] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const setupScrollObserver = () => {
      const aboutContent = aboutContentRef.current;
      
      if (aboutContent) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
            }
          });
        }, {
          threshold: 0.1,
          rootMargin: '0px 0px -100px 0px'
        });
        
        observer.observe(aboutContent);

        return () => observer.disconnect();
      }
    };

    setupScrollObserver();
  }, []);

  const skills = ['Python', 'JavaScript', 'Machine Learning', 'React', 'Node.js', 'TensorFlow'];

  const tldrText = "Full Stack ML Engineer from India. I build AI-powered products with Python, LLMs, and modern web tech. Love solving real-world problems with smart, scalable systems.";
  const fullText = `Hey, I'm Tanay, and I currently work as a Full Stack Machine Learning Engineer in India. I work on all parts of the stack, but my primary focus is on making smart, AI-powered products that truly make a difference. I studied engineering and slowly moved toward Python and LLMs. I've been making things with them ever since.

When not focusing on new features or making workflows better, I'm usually in a terminal, enhancing architectures or looking for better ways to use code to solve real-world problems.

I like making ideas come to life with smart, scalable systems, whether they are front-end or back-end.`;

  useEffect(() => {
    if (showTldr) {
      // Start with current text and erase quickly
      const currentText = fullText;
      setIsTyping(true);
      
      // Fast erase phase
      let eraseIndex = currentText.length;
      const eraseInterval = setInterval(() => {
        setDisplayText(currentText.substring(0, eraseIndex));
        eraseIndex -= 8; // Erase 8 characters at a time for speed
        
        if (eraseIndex <= 0) {
          clearInterval(eraseInterval);
          setDisplayText('');
          
          // Start typing the TL;DR text
          let typeIndex = 0;
          const typeInterval = setInterval(() => {
            setDisplayText(tldrText.substring(0, typeIndex + 1));
            typeIndex++;
            
            if (typeIndex >= tldrText.length) {
              clearInterval(typeInterval);
              setIsTyping(false);
            }
          }, 15); // Type one character every 15ms
        }
      }, 10); // Erase every 10ms
    } else {
      // When switching to full content, animate it too
      const currentText = tldrText;
      setIsTyping(true);
      
      // Fast erase phase
      let eraseIndex = currentText.length;
      const eraseInterval = setInterval(() => {
        setDisplayText(currentText.substring(0, eraseIndex));
        eraseIndex -= 8; // Erase 8 characters at a time for speed
        
        if (eraseIndex <= 0) {
          clearInterval(eraseInterval);
          setDisplayText('');
          
          // Start typing the full text
          let typeIndex = 0;
          const typeInterval = setInterval(() => {
            setDisplayText(fullText.substring(0, typeIndex + 1));
            typeIndex++;
            
            if (typeIndex >= fullText.length) {
              clearInterval(typeInterval);
              setIsTyping(false);
            }
          }, 8); // Type faster for longer text
        }
      }, 10); // Erase every 10ms
    }
  }, [showTldr]);

  // Initialize with full text
  useEffect(() => {
    if (!showTldr && displayText === '') {
      setDisplayText(fullText);
    }
  }, []);

  const calculateYearsOfExperience = () => {
    const startYear = 2022;
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // 0-indexed, so add 1
    
    let years = currentYear - startYear;
    
    // If we're still early in the year (before work anniversary), show previous year value
    // Assuming work started around mid-year for more accurate calculation
    if (currentMonth < 6) {
      years = Math.max(0, years - 1);
    }
    
    // Format the display
    if (years === 0) {
      return '<1';
    } else if (years === 1) {
      return '1+';
    } else {
      return `${years}+`;
    }
  };

  const stats = [
    { number: calculateYearsOfExperience(), label: 'Years of Experience' },
    { number: '10+', label: 'Projects Completed' },
    { number: '∞', label: 'Cups of Tea' }
  ];

  return (
    <section className="about-section" id="about">
      <div className="parallax-container">
        <div className="parallax-background"></div>
        <div ref={aboutContentRef} className="about-content">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="about-title">Here is a little background</h2>
              <div className="title-underline"></div>
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-100">
                Hello! I'm Tanay
              </h3>
              <div className="tldr-toggle-container">
                <span className="tldr-label">TL;DR</span>
                <button 
                  onClick={() => setShowTldr(!showTldr)}
                  className={`tldr-toggle ${showTldr ? 'active' : ''}`}
                  aria-label={showTldr ? "Show full content" : "Show TL;DR"}
                >
                  <div className="toggle-slider"></div>
                </button>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="about-text">
                
                <div className="content-container">
                  <div className={`typing-content ${showTldr ? 'tldr-mode' : 'full-mode'}`}>
                    <p className="text-gray-300 text-lg leading-relaxed mb-6" style={{ whiteSpace: 'pre-line' }}>
                      {displayText}
                      {isTyping && <span className="typing-cursor">|</span>}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {skills.map((skill, index) => (
                    <span key={index} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="about-stats">
                {stats.map((stat, index) => (
                  <div key={index} className="stat-item">
                    <div className="stat-number">{stat.number}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
