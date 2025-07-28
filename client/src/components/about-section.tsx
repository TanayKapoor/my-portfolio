import { useEffect, useRef } from 'react';

export default function AboutSection() {
  const aboutContentRef = useRef<HTMLDivElement>(null);

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

  const stats = [
    { number: '1.5+', label: 'Years of Experience' },
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
            
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="about-text">
                <h3 className="text-2xl font-bold text-gray-100 mb-6">
                  Hello! I'm Tanay
                </h3>
                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  Hey, I'm Tanay, and I currently work as a Full Stack Machine Learning Engineer in India. I work on all parts of the stack, but my primary focus is on making smart, AI-powered products that truly make a difference. I studied engineering and slowly moved toward Python and LLMs. I've been making things with them ever since.
                </p>
                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  When not focusing on new features or making workflows better, I'm usually in a terminal, enhancing architectures or looking for better ways to use code to solve real-world problems.
                </p>
                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  I like making ideas come to life with smart, scalable systems, whether they are front-end or back-end.
                </p>
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
