import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { Card } from '@/components/ui/card';
import { Trophy, Infinity, Users, Zap, Shield, Globe } from 'lucide-react';

const WhyCTNFT = () => {
  const hashesRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      icon: Trophy,
      title: "Permanent Bragging Rights",
      description: "Your CTF victories live forever on the blockchain - no one can dispute your achievements",
      hash: "0x8f4a2b9c..."
    },
    {
      icon: Infinity,
      title: "Immutable Proof",
      description: "Cryptographically verified evidence of your hacking skills that can never be altered",
      hash: "0x3e7c1d5f..."
    },
    {
      icon: Users,
      title: "Elite Community",
      description: "Join a decentralized network of the world's top cybersecurity professionals",
      hash: "0x9b6e4a2c..."
    },
    {
      icon: Zap,
      title: "Instant Recognition",
      description: "Real-time minting means your achievements are recognized the moment you capture a flag",
      hash: "0x5d8f2a7b..."
    },
    {
      icon: Shield,
      title: "Zero-Knowledge Proofs",
      description: "Prove your skills without revealing sensitive challenge details or methodologies",
      hash: "0x1c9e6f4a..."
    },
    {
      icon: Globe,
      title: "Global Leaderboard",
      description: "Compete with hackers worldwide in a transparent, tamper-proof ranking system",
      hash: "0x7f2d8c5b..."
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate floating hashes
      gsap.to('.floating-hash', {
        y: -20,
        duration: 2,
        ease: "power1.inOut",
        stagger: 0.1,
        repeat: -1,
        yoyo: true
      });

      // Card hover animations
      gsap.utils.toArray('.feature-card').forEach((card: any) => {
        const hash = card.querySelector('.hash-display');
        
        card.addEventListener('mouseenter', () => {
          gsap.to(hash, {
            scale: 1.1,
            color: '#00ffff',
            duration: 0.3,
            ease: "power2.out"
          });
        });
        
        card.addEventListener('mouseleave', () => {
          gsap.to(hash, {
            scale: 1,
            color: '#64748b',
            duration: 0.3,
            ease: "power2.out"
          });
        });
      });
    }, hashesRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="py-20 px-4 relative">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-cyber font-bold text-secondary mb-4">
            WHY CTNFT?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Bragging rights, forever on-chain
          </p>
          
          {/* Animated tagline */}
          <motion.div
            className="font-mono text-accent text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            viewport={{ once: true }}
          >
            {">"} Because your hacking prowess deserves eternal recognition_
          </motion.div>
        </motion.div>

        {/* Floating Background Hashes */}
        <div ref={hashesRef} className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="floating-hash absolute font-mono text-xs text-primary/10"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`
              }}
              suppressHydrationWarning
            >
              {`0x${Math.random().toString(16).substr(2, 8)}...`}
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            
            return (
              <motion.div
                key={index}
                className="feature-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/20 hover:border-secondary/50 transition-all duration-300 h-full group relative overflow-hidden">
                  {/* Background Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Icon */}
                  <div className="flex justify-center mb-4 relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-lg flex items-center justify-center group-hover:shadow-neon transition-all duration-300">
                      <Icon className="w-8 h-8 text-secondary group-hover:text-accent transition-colors duration-300" />
                    </div>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg font-cyber font-bold text-center mb-3 text-secondary relative z-10">
                    {feature.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm text-muted-foreground text-center mb-4 relative z-10">
                    {feature.description}
                  </p>
                  
                  {/* Hash Display */}
                  <div className="text-center relative z-10">
                    <div className="hash-display font-mono text-xs text-muted-foreground/70 transition-all duration-300">
                      HASH: {feature.hash}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA Section */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="inline-block p-6 bg-gradient-to-r from-card/50 to-card/30 border border-primary/30 rounded-lg backdrop-blur-sm">
            <h3 className="text-xl font-cyber font-bold text-primary mb-2">
              READY TO IMMORTALIZE YOUR SKILLS?
            </h3>
            <p className="text-muted-foreground mb-4">
              Join the elite ranks of blockchain-verified cybersecurity experts
            </p>
            <div className="flex justify-center items-center gap-4 text-sm font-mono">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span className="text-accent">LIVE NETWORK</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                <span className="text-secondary">ZERO FEES</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-primary">INSTANT MINT</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyCTNFT;