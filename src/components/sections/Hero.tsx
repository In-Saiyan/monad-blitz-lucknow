import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { Button } from '@/components/ui/button';
import { Shield, Flag, Lock, Cpu } from 'lucide-react';
import GlitchText from '@/components/ui/effects/GlitchText'
import EncryptedText from '@/components/ui/effects/EncryptedText';

const Hero = () => {
  const flagRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const [isDecrypted, setIsDecrypted] = useState(false);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.5 });
    
    // Animate flag assembly from code snippets
    tl.from('.code-snippet', {
      scale: 0,
      rotation: 360,
      opacity: 0,
      duration: 1,
      stagger: 0.1,
      ease: "back.out(1.7)"
    })
    .to('.code-snippet', {
      x: 0,
      y: 0,
      duration: 1,
      ease: "power2.inOut",
      onComplete: () => setIsDecrypted(true)
    });

    // Logo animation
    if (logoRef.current) {
      gsap.from(logoRef.current, {
        scale: 0,
        rotation: 180,
        duration: 1.5,
        delay: 2,
        ease: "elastic.out(1, 0.5)"
      });
    }
  }, []);

  const codeSnippets = [
    "0x4834f7a2",
    "#!/bin/bash",
    "flag{",
    "capture",
    "_the_",
    "blockchain",
    "}",
    "mint()"
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
      {/* Floating Code Snippets that form the flag */}
      <div className="absolute inset-0 pointer-events-none">
        {codeSnippets.map((snippet, index) => (
          <motion.div
            key={index}
            className="code-snippet absolute text-sm font-mono text-primary/50"
            style={{
              left: `${20 + (index * 10)}%`,
              top: `${30 + (index % 3) * 15}%`,
            }}
            suppressHydrationWarning
            animate={{
              x: isDecrypted ? 0 : Math.random() * 200 - 100,
              y: isDecrypted ? 0 : Math.random() * 200 - 100,
              opacity: isDecrypted ? 0 : 0.7,
            }}
            transition={{
              duration: 2,
              delay: index * 0.1,
            }}
          >
            {snippet}
          </motion.div>
        ))}
      </div>

      <div className="text-center max-w-4xl mx-auto relative z-10">
        {/* Flag Icon that assembles */}
        <motion.div 
          ref={flagRef}
          className="flex justify-center mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 2, duration: 1, ease: "backOut" }}
        >
          <div className="relative">
            <Flag className="w-20 h-20 text-primary animate-cyber-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Cpu className="w-8 h-8 text-accent animate-float" />
            </div>
          </div>
        </motion.div>

        {/* Main Heading with Glitch Effect */}
        <div className="mb-6">
          <GlitchText 
            text="CAPTURE THE FLAG"
            className="text-5xl md:text-7xl font-cyber font-black text-primary mb-4"
          />
          <GlitchText 
            text="OWN THE NFT"
            className="text-3xl md:text-5xl font-cyber font-bold text-secondary"
          />
        </div>

        {/* Animated Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3, duration: 0.8 }}
          className="mb-8"
        >
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Every conquered challenge becomes an{' '}
            <span className="text-accent font-semibold">eternal proof</span> of your hacking prowess.
            <br />
            <span className="text-primary">Mint your victories. Build your legend.</span>
          </p>
        </motion.div>

        {/* Encrypted Description */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4, duration: 1 }}
          className="mb-12"
        >
          <EncryptedText 
            encryptedText="Q1RGIEJMS1ItV0FSUklPUi1NT0RF"
            decryptedText="Transform cybersecurity challenges into blockchain-verified achievements"
            className="text-sm md:text-base"
          />
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4.5, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button 
            size="lg" 
            className="group relative overflow-hidden bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 text-lg font-semibold transition-all duration-300 hover:shadow-cyber-glow"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Enter the Grid
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="border-primary text-primary hover:bg-primary/10 px-8 py-4 text-lg font-semibold neon-border transition-all duration-300"
          >
            <Lock className="w-5 h-5 mr-2" />
            View Documentation
          </Button>
        </motion.div>

        {/* Status Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 5, duration: 1 }}
          className="mt-16 flex justify-center gap-8 text-sm font-mono"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-accent">BLOCKCHAIN: ACTIVE</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-primary">NETWORK: SECURE</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
            <span className="text-secondary">STATUS: OPERATIONAL</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;