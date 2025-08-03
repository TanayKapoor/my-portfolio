import { useState, useEffect, useRef } from 'react';

interface OdometerTextProps {
  messages: string[];
  animationDelay?: number;
  onTextChange?: (isAnimating: boolean) => void;
}

export default function OdometerText({ 
  messages, 
  animationDelay = 2000,
  onTextChange
}: OdometerTextProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [nextMessageIndex, setNextMessageIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentMessage = messages[currentMessageIndex] || '';
  const nextMessage = messages[nextMessageIndex] || '';

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
      
      // Start the flip animation
      setTimeout(() => {
        const newCurrentIndex = nextMessageIndex;
        const newNextIndex = (nextMessageIndex + 1) % messages.length;
        
        setCurrentMessageIndex(newCurrentIndex);
        setNextMessageIndex(newNextIndex);
        
        // Animation completes
        setTimeout(() => {
          setIsTransitioning(false);
          onTextChange?.(false);
        }, 600);
      }, 600);
      
    }, animationDelay);

    return () => clearInterval(interval);
  }, [messages, currentMessageIndex, nextMessageIndex, animationDelay, onTextChange]);

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

  console.log('Odometer Debug:', { currentMessage, nextMessage, maxLength, isTransitioning });

  // Fallback for when there's no content
  if (!currentMessage && !nextMessage) {
    return (
      <div 
        className="odometer-container"
        style={{ fontSize: currentFontSize }}
      >
        <div style={{ color: '#fff', textShadow: '1px 1px 5px rgba(0,0,0,0.5)' }}>
          {messages[0] || 'Loading...'}
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
      <div className="odometer-display">
        {Array.from({ length: maxLength }).map((_, index) => renderOdometerChar(index))}
      </div>
      {/* Debug info */}
      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '10px' }}>
        Current: "{currentMessage}" | Next: "{nextMessage}" | Transitioning: {isTransitioning.toString()}
      </div>
    </div>
  );
}