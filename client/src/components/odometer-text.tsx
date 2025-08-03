import { useState, useEffect, useRef } from 'react';

interface OdometerTextProps {
  messages: string[];
  animationDelay?: number;
  onTextChange?: (isAnimating: boolean) => void;
}

export default function OdometerText({ 
  messages, 
  animationDelay = 3000,
  onTextChange
}: OdometerTextProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize display text
  useEffect(() => {
    if (messages.length > 0 && !displayText) {
      setDisplayText(messages[0]);
    }
  }, [messages, displayText]);

  // Calculate dynamic font size based on text length
  const calculateFontSize = (text: string) => {
    const length = text.length;
    if (length <= 20) return 'clamp(1.5rem, 4vw, 2.4rem)';
    if (length <= 30) return 'clamp(1.3rem, 3.5vw, 2rem)';
    if (length <= 40) return 'clamp(1.1rem, 3vw, 1.7rem)';
    return 'clamp(0.9rem, 2.5vw, 1.4rem)';
  };

  useEffect(() => {
    if (messages.length <= 1) return;

    const interval = setInterval(() => {
      setIsAnimating(true);
      onTextChange?.(true);
      
      // Wait for animation to start, then change text
      setTimeout(() => {
        const nextIndex = (currentMessageIndex + 1) % messages.length;
        setCurrentMessageIndex(nextIndex);
        setDisplayText(messages[nextIndex]);
        
        // Animation completes
        setTimeout(() => {
          setIsAnimating(false);
          onTextChange?.(false);
        }, 300);
      }, 300);
      
    }, animationDelay);

    return () => clearInterval(interval);
  }, [messages, currentMessageIndex, animationDelay, onTextChange]);

  const currentFontSize = calculateFontSize(displayText);

  // Debug logging
  console.log('OdometerText render:', { displayText, isAnimating, messages: messages.length });

  if (!displayText) {
    return (
      <div 
        className="odometer-container"
        style={{ fontSize: currentFontSize }}
      >
        <div className="odometer-text">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="odometer-container"
      style={{ fontSize: currentFontSize }}
    >
      <div className={`odometer-text ${isAnimating ? 'animating' : ''}`}>
        {displayText.split('').map((char, index) => (
          <span
            key={`${currentMessageIndex}-${index}`}
            className="odometer-char"
            style={{
              '--char-delay': `${index * 0.03}s`
            } as React.CSSProperties}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </div>
    </div>
  );
}