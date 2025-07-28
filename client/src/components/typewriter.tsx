import { useState, useEffect, useRef } from 'react';

interface TypewriterProps {
  messages: string[];
  typingSpeed?: number;
  backspaceSpeed?: number;
  pauseBetweenMessages?: number;
}

export default function Typewriter({ 
  messages, 
  typingSpeed = 150, 
  backspaceSpeed = 75, 
  pauseBetweenMessages = 2000 
}: TypewriterProps) {
  const [currentText, setCurrentText] = useState('');
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [fontSize, setFontSize] = useState('2.4rem');

  // Calculate dynamic font size based on text length
  const calculateFontSize = (text: string) => {
    const length = text.length;
    if (length <= 20) return 'clamp(1.5rem, 4vw, 2.4rem)';
    if (length <= 30) return 'clamp(1.3rem, 3.5vw, 2rem)';
    if (length <= 40) return 'clamp(1.1rem, 3vw, 1.7rem)';
    return 'clamp(0.9rem, 2.5vw, 1.4rem)';
  };

  // Update font size when message changes
  useEffect(() => {
    const newFontSize = calculateFontSize(messages[currentMessageIndex]);
    setFontSize(newFontSize);
  }, [currentMessageIndex, messages]);

  useEffect(() => {
    const currentMessage = messages[currentMessageIndex];
    
    const typeTimeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (charIndex < currentMessage.length) {
          setCurrentText(currentMessage.substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          // Finished typing, pause then start deleting
          setTimeout(() => {
            setIsDeleting(true);
          }, pauseBetweenMessages);
        }
      } else {
        // Deleting
        if (charIndex > 0) {
          setCurrentText(currentMessage.substring(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          // Finished deleting, move to next message
          setIsDeleting(false);
          setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
        }
      }
    }, isDeleting ? backspaceSpeed : typingSpeed);

    return () => clearTimeout(typeTimeout);
  }, [charIndex, currentMessageIndex, isDeleting, messages, typingSpeed, backspaceSpeed, pauseBetweenMessages]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 600);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <span className="greeting-text" style={{ fontSize, transition: 'font-size 0.3s ease' }}>
      {currentText}
      <span className={`cursor ${showCursor ? 'visible' : ''}`}>|</span>
    </span>
  );
}
