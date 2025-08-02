import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const TerminalPrompt = () => {
  const [currentCommand, setCurrentCommand] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  const commands = [
    'nmap -sS target.ctnft.io',
    'sqlmap -u "https://target.ctnft.io"',
    'john --wordlist=/usr/share/wordlists/rockyou.txt hash.txt',
    'hydra -l admin -P passwords.txt ssh://target.ctnft.io',
    'python exploit.py --target target.ctnft.io',
    'echo "flag{n3v3r_7ru57_u53r_1npu7}" | nc target.ctnft.io 1337'
  ];

  useEffect(() => {
    // Cursor blink effect
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    // Command rotation
    let commandIndex = 0;
    const rotateCommands = () => {
      const command = commands[commandIndex % commands.length];
      let charIndex = 0;
      
      const typeCommand = () => {
        if (charIndex <= command.length) {
          setCurrentCommand(command.substring(0, charIndex));
          charIndex++;
          setTimeout(typeCommand, 100 + Math.random() * 50);
        } else {
          // Wait before starting next command
          setTimeout(() => {
            commandIndex++;
            rotateCommands();
          }, 3000);
        }
      };
      
      // Clear current command first
      setCurrentCommand('');
      setTimeout(typeCommand, 500);
    };

    rotateCommands();

    return () => {
      clearInterval(cursorInterval);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 2, duration: 0.5 }}
      className="fixed bottom-4 left-4 z-50 font-mono text-sm bg-black/80 backdrop-blur-sm border border-primary/30 rounded px-3 py-2 max-w-md"
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
        <span className="text-accent text-xs">TERMINAL</span>
      </div>
      
      <div className="text-primary/90">
        <span className="text-secondary">root@ctnft:~#</span>
        <span className="ml-2">{currentCommand}</span>
        <span 
          className={`inline-block w-2 h-4 bg-primary ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}
        />
      </div>
    </motion.div>
  );
};

export default TerminalPrompt;