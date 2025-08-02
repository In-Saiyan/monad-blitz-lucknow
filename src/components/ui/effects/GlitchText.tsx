import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface GlitchTextProps {
  text: string;
  className?: string;
}

const GlitchText = ({ text, className = "" }: GlitchTextProps) => {
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = textRef.current;
    if (!element) return;

    const originalText = text;
    const glitchChars = '!@#$%^&*()_+{}[]|;:,.<>?~`';
    
    const glitchAnimation = () => {
      const duration = 0.1;
      const iterations = 5;
      
      for (let i = 0; i <= iterations; i++) {
        setTimeout(() => {
          if (i === iterations) {
            element.textContent = originalText;
          } else {
            // Create glitched version
            const glitchedText = originalText
              .split('')
              .map(char => 
                Math.random() < 0.3 
                  ? glitchChars[Math.floor(Math.random() * glitchChars.length)]
                  : char
              )
              .join('');
            element.textContent = glitchedText;
          }
        }, i * duration * 1000);
      }
    };

    // Set initial text
    element.textContent = originalText;
    element.setAttribute('data-text', originalText);

    // Trigger glitch on hover
    const handleMouseEnter = () => {
      glitchAnimation();
    };

    element.addEventListener('mouseenter', handleMouseEnter);

    // Auto-glitch occasionally
    const intervalId = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every interval
        glitchAnimation();
      }
    }, 3000);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      clearInterval(intervalId);
    };
  }, [text]);

  return (
    <span 
      ref={textRef}
      className={`glitch-text inline-block cursor-pointer ${className}`}
      data-text={text}
    />
  );
};

export default GlitchText;