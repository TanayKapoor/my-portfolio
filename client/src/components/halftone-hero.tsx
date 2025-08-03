import { useState } from 'react';
import OdometerText from './odometer-text';
import profilePic from '@assets/pfp_1753712646611.png';

export default function HalftoneHero() {
  const [isTyping, setIsTyping] = useState(true);
  
  const greetingMessages = [
    "Hi, the name's Tanay.",
    "i_like_to_code.py",
    "full_stack_wizard.js",
    "building_cool_things_since_2020",
    "and I'm addicted to tea."
  ];

  const handleContactClick = () => {
    const element = document.getElementById('about');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="halftone-section">
      <div className="halftone"></div>
      {/* Profile Picture - Absolute center of pulse animation */}
      <div className="profile-picture-center">
        <div className={`profile-picture ${isTyping ? 'typing-active' : ''}`}>
          <img 
            src={profilePic} 
            alt="Tanay's pixel art avatar" 
            className="profile-img"
          />
        </div>
      </div>

      {/* Content below profile picture */}
      <div className="halftone-content">
        {/* Job Title - Below profile picture */}
        <h2 className="job-title">
          FullStack Machine Learning Engineer
        </h2>

        {/* Odometer Text - Below job title */}
        <div className="w-full max-w-7xl px-4">
          <OdometerText 
            messages={greetingMessages} 
            animationDelay={2000}
            onTextChange={setIsTyping}
          />
        </div>
      </div>
    </section>
  );
}
