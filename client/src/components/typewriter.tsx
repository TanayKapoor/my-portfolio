import { useState, useEffect } from 'react';

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
  const [isTyping, setIsTyping] = useState(true);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let typewriterInterval: NodeJS.Timeout;
    let cursorInterval: NodeJS.Timeout;

    const startTypewriterAnimation = () => {
      const typeMessage = () => {
        let charIndex = 0;
        const currentMessage = messages[currentMessageIndex];
        setIsTyping(true);

        typewriterInterval = setInterval(() => {
          if (charIndex < currentMessage.length) {
            setCurrentText(currentMessage.substring(0, charIndex + 1));
            charIndex++;
          } else {
            clearInterval(typewriterInterval);
            setTimeout(() => {
              setIsTyping(false);
              startBackspacing(currentMessage, charIndex);
            }, pauseBetweenMessages);
          }
        }, typingSpeed);
      };

      typeMessage();
    };

    const startBackspacing = (message: string, startIndex: number) => {
      let charIndex = startIndex;

      typewriterInterval = setInterval(() => {
        if (charIndex > 0) {
          charIndex--;
          setCurrentText(message.substring(0, charIndex));
        } else {
          clearInterval(typewriterInterval);
          setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
          setTimeout(() => {
            startTypewriterAnimation();
          }, 500);
        }
      }, backspaceSpeed);
    };

    const startCursorBlink = () => {
      cursorInterval = setInterval(() => {
        setShowCursor(prev => !prev);
      }, 600);
    };

    startTypewriterAnimation();
    startCursorBlink();

    return () => {
      clearInterval(typewriterInterval);
      clearInterval(cursorInterval);
    };
  }, [messages, currentMessageIndex, typingSpeed, backspaceSpeed, pauseBetweenMessages]);

  return (
    <span className="greeting-text">
      {currentText}
      <span className={`cursor ${showCursor ? 'visible' : ''}`}>|</span>
    </span>
  );
}
