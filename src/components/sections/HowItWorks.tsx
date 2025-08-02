import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { Card } from '@/components/ui/card';
import { Target, Shield, Coins, TrendingUp } from 'lucide-react';

const HowItWorks = () => {
  const timelineRef = useRef<HTMLDivElement>(null);

  const steps = [
    {
      id: 1,
      title: "HACK",
      description: "Solve cybersecurity challenges and capture flags in CTF competitions",
      icon: Target,
      hash: "0x4f2a8b3c...",
      encrypted: "48414B4B494E47"
    },
    {
      id: 2,
      title: "CAPTURE",
      description: "Submit your captured flag with proof of completion",
      icon: Shield,
      hash: "0x7e5d9a1f...",
      encrypted: "434150545552"
    },
    {
      id: 3,
      title: "MINT",
      description: "Your achievement is minted as a unique NFT on the blockchain",
      icon: Coins,
      hash: "0x2c8f4b9e...",
      encrypted: "4D494E54494E47"
    },
    {
      id: 4,
      title: "TRADE",
      description: "Showcase, trade, or hold your hacking achievements forever",
      icon: TrendingUp,
      hash: "0x9a3e7c2d...",
      encrypted: "5452414449"
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate timeline connections
      gsap.fromTo('.timeline-line', 
        { scaleX: 0 },
        { 
          scaleX: 1, 
          duration: 2,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: timelineRef.current,
            start: "top 70%",
            end: "bottom 30%",
          }
        }
      );

      // Stagger step animations
      gsap.fromTo('.step-card',
        { 
          opacity: 0, 
          y: 50,
          scale: 0.8 
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: timelineRef.current,
            start: "top 70%",
          }
        }
      );
    }, timelineRef);

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
          <h2 className="text-4xl md:text-5xl font-cyber font-bold text-primary mb-4">
            HOW IT WORKS
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your cybersecurity achievements into permanent blockchain records
          </p>
          
          {/* Encrypted subtitle */}
          <div className="mt-4 font-mono text-xs text-muted-foreground/50">
            {">"} 0x48324C504A8F2B9D7E1A5C8F3B6E9A2D4F7C1B8E5A3F9C2B8D5E1A7F4C9B2E6A8D3F5C1B7E4A9F2C6D8B1E5A3C9F7B2D6E8A4F1C5B9E2A7D3F8C6B1E4A9F2D5C8B3E6A1F7C4B9E2D8A5F3C1B6E9A2F4D7C8B5E1A3F6C9B2D4E7A8F1C5B3E6A9F2D7C4B8E1A5F3C9B6E2A4D7F8C1B5E3A6F9C2D4B7E8A1F5C3B9E6A2D4F7C8B1E5A3F9C6B2D7E4A8F1C5B3E9A6F2D4C7B8E1A5F3C9B6E2A4D7F8C1B5E3A6F9C2D4B7E8A1F5C3B9E6A2D4F7C8B1E5A
          </div>
        </motion.div>

        {/* Timeline */}
        <div ref={timelineRef} className="relative">
          {/* Connection Lines */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-primary via-secondary to-accent timeline-line transform -translate-y-1/2" />
          
          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              
              return (
                <motion.div
                  key={step.id}
                  className="step-card relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-all duration-300 neon-border group">
                    {/* Step Number */}
                    <div className="absolute -top-4 left-6 bg-background border border-primary/50 rounded-full w-8 h-8 flex items-center justify-center text-primary font-bold text-sm">
                      {step.id}
                    </div>
                    
                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center group-hover:shadow-cyber-glow transition-all duration-300">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-xl font-cyber font-bold text-center mb-3 text-primary">
                      {step.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      {step.description}
                    </p>
                    
                    {/* Hash Display */}
                    <div className="text-center">
                      <div className="font-mono text-xs text-accent/70 mb-1">
                        HASH: {step.hash}
                      </div>
                      <div className="font-mono text-xs text-secondary/50">
                        {step.encrypted}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Additional Info */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-card/50 border border-primary/20 rounded-lg">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="font-mono text-sm text-muted-foreground">
              SMART CONTRACT VERIFIED • GAS OPTIMIZED • IMMUTABLE RECORDS
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;