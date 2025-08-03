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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentMessage = messages[currentMessageIndex] || messages[0] || '';
  const nextIndex = (currentMessageIndex + 1) % messages.length;
  const nextMessage = messages[nextIndex] || '';

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
      setIsTransitioning(true);
      onTextChange?.(true);
      
      // Start the flip animation immediately
      setTimeout(() => {
        setCurrentMessageIndex(nextIndex);
        
        // Animation completes
        setTimeout(() => {
          setIsTransitioning(false);
          onTextChange?.(false);
        }, 700);
      }, 50);
      
    }, animationDelay);

    return () => clearInterval(interval);
  }, [messages, currentMessageIndex, nextIndex, animationDelay, onTextChange]);

  // Get the longer message to determine dimensions
  const longerMessage = currentMessage.length >= nextMessage.length ? currentMessage : nextMessage;
  const maxLength = Math.max(currentMessage.length, nextMessage.length);
  const currentFontSize = calculateFontSize(longerMessage);

  // Create character positions for odometer effect
  const renderOdometerChar = (position: number) => {
    const currentChar = currentMessage[position] || '';
    const nextChar = nextMessage[position] || '';
    
    return (
      <div 
        key={position}
        className="odometer-digit"
        style={{
          '--char-delay': `${position * 0.05}s`
        } as React.CSSProperties}
      >
        <div className={`odometer-digit-inner ${isTransitioning ? 'flipping' : ''}`}>
          <div className="odometer-digit-current">
            {currentChar === ' ' ? '\u00A0' : currentChar}
          </div>
          <div className="odometer-digit-next">
            {nextChar === ' ' ? '\u00A0' : nextChar}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className="odometer-container"
      style={{ fontSize: currentFontSize }}
    >
      <div className="odometer-display">
        {Array.from({ length: maxLength }).map((_, index) => renderOdometerChar(index))}
      </div>
    </div>
  );
}