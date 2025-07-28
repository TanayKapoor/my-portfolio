import Typewriter from './typewriter';
import profilePic from '@assets/pfp_1753712646611.png';

export default function HalftoneHero() {
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
      <div className="halftone-content">
        {/* Profile Picture */}
        <div className="profile-picture mb-8">
          <img 
            src={profilePic} 
            alt="Tanay's pixel art avatar" 
            className="profile-img"
          />
        </div>

        {/* Job Title */}
        <h2 className="job-title">
          FullStack Machine Learning Engineer
        </h2>

        {/* Typewriter Text */}
        <div className="w-full max-w-7xl px-4">
          <Typewriter 
            messages={greetingMessages} 
            typingSpeed={150}
            backspaceSpeed={75}
            pauseBetweenMessages={2000}
          />
        </div>
      </div>
    </section>
  );
}
