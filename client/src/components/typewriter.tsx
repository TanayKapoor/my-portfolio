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
    <span className="greeting-text">
      {currentText}
      <span className={`cursor ${showCursor ? 'visible' : ''}`}>|</span>
    </span>
  );
}
