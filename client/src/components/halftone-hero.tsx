import Typewriter from './typewriter';

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
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400" 
            alt="Professional developer portrait" 
            className="profile-img"
          />
        </div>

        {/* Job Title */}
        <h2 className="job-title">
          FullStack Machine Learning Engineer
        </h2>

        {/* Typewriter Text */}
        <p>
          <Typewriter messages={greetingMessages} />
        </p>
      </div>
    </section>
  );
}
