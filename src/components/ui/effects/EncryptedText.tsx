import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface EncryptedTextProps {
  encryptedText: string;
  decryptedText: string;
  className?: string;
  autoDecrypt?: boolean;
  decryptDelay?: number;
}

const EncryptedText = ({ 
  encryptedText, 
  decryptedText, 
  className = "",
  autoDecrypt = true,
  decryptDelay = 2000
}: EncryptedTextProps) => {
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [displayText, setDisplayText] = useState(encryptedText);

  useEffect(() => {
    if (autoDecrypt) {
      const timer = setTimeout(() => {
        decryptText();
      }, decryptDelay);

      return () => clearTimeout(timer);
    }
  }, [autoDecrypt, decryptDelay]);

  const decryptText = () => {
    if (isDecrypted) return;

    const decryptSteps = 10;
    const stepDuration = 50;
    
    for (let i = 0; i <= decryptSteps; i++) {
      setTimeout(() => {
        if (i === decryptSteps) {
          setDisplayText(decryptedText);
          setIsDecrypted(true);
        } else {
          // Create partially decrypted text
          const progress = i / decryptSteps;
          const charactersToDecrypt = Math.floor(decryptedText.length * progress);
          
          const partialText = decryptedText
            .split('')
            .map((char, index) => {
              if (index < charactersToDecrypt) {
                return char;
              } else if (Math.random() < 0.3) {
                // Random characters for non-decrypted parts
                const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                return randomChars[Math.floor(Math.random() * randomChars.length)];
              } else {
                return encryptedText[index % encryptedText.length] || char;
              }
            })
            .join('');
            
          setDisplayText(partialText);
        }
      }, i * stepDuration);
    }
  };

  return (
    <motion.div 
      className={`cursor-pointer group ${className}`}
      onClick={decryptText}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="relative">
        {/* Encrypted/Decrypted Text */}
        <motion.span
          key={isDecrypted ? 'decrypted' : 'encrypted'}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`font-mono transition-all duration-300 ${
            isDecrypted 
              ? 'text-foreground' 
              : 'text-primary/70 group-hover:text-primary'
          }`}
        >
          {displayText}
        </motion.span>
        
        {/* Encryption Status Indicator */}
        <div className="flex items-center justify-center mt-2 gap-2">
          <div 
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              isDecrypted 
                ? 'bg-accent animate-pulse' 
                : 'bg-primary animate-cyber-pulse'
            }`} 
          />
          <span className="text-xs font-mono text-muted-foreground">
            {isDecrypted ? 'DECRYPTED' : 'ENCRYPTED'}
          </span>
        </div>
        
        {/* Click hint for manual decryption */}
        {!autoDecrypt && !isDecrypted && (
          <div className="text-xs text-muted-foreground/50 mt-1 group-hover:text-muted-foreground transition-colors duration-300">
            Click to decrypt...
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EncryptedText;