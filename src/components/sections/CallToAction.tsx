import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { Button } from '@/components/ui/button';
import { ArrowRight, Terminal, Users, Zap } from 'lucide-react';

const CallToAction = () => {
  const hologramRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Holographic button effect
      gsap.to('.hologram-effect', {
        backgroundPosition: '200% center',
        duration: 2,
        ease: "none",
        repeat: -1
      });

      // Floating particles animation
      gsap.to('.particle', {
        y: -30,
        opacity: 0.7,
        duration: 3,
        ease: "power1.inOut",
        stagger: 0.1,
        repeat: -1,
        yoyo: true
      });
    }, hologramRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Animated Particles */}
        <div ref={hologramRef} className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="particle absolute w-1 h-1 bg-primary/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`
              }}
              suppressHydrationWarning

            />
          ))}
        </div>

        {/* Main CTA Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "backOut" }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Terminal Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center shadow-cyber-glow">
              <Terminal className="w-10 h-10 text-primary animate-cyber-pulse" />
            </div>
          </div>

          {/* Main Heading */}
          <h2 className="text-4xl md:text-6xl font-cyber font-black text-primary mb-6">
            ENTER THE GRID
          </h2>
          
          <p className="text-xl md:text-2xl text-secondary font-semibold mb-4">
            Your next capture awaits immortalization
          </p>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
            Step into the decentralized future of cybersecurity achievement tracking. 
            Every flag you capture becomes a permanent testament to your elite skills.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="group relative overflow-hidden bg-primary text-primary-foreground hover:bg-primary/90 px-12 py-6 text-xl font-bold transition-all duration-300 hover:shadow-cyber-glow"
            >
              {/* Holographic overlay */}
              <div className="hologram-effect absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_100%] bg-[position:-200%_center]" />
              
              <span className="relative z-10 flex items-center gap-3">
                <Zap className="w-6 h-6" />
                Mint Your First Flag
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="border-secondary text-secondary hover:bg-secondary/10 px-12 py-6 text-xl font-bold neon-border transition-all duration-300 group"
            >
              <Users className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
              Join the Elite
            </Button>
          </div>

          {/* Network Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto"
          >
            <div className="bg-card/50 border border-primary/20 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-accent mb-1">10,847</div>
              <div className="text-sm text-muted-foreground">Flags Captured</div>
            </div>
            <div className="bg-card/50 border border-primary/20 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-primary mb-1">2,394</div>
              <div className="text-sm text-muted-foreground">Elite Hackers</div>
            </div>
            <div className="bg-card/50 border border-primary/20 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold text-secondary mb-1">156</div>
              <div className="text-sm text-muted-foreground">Active CTFs</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom Encrypted Message */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          viewport={{ once: true }}
          className="mt-16 pt-8 border-t border-primary/20"
        >
          <div className="font-mono text-xs text-muted-foreground/50 leading-relaxed">
            {">"} Welcome to the future of cybersecurity achievement verification<br />
            {">"} Smart contract: 0x742d35Cc3BF21f1180AD6C7ED49C9AD2ffA2aB42<br />
            {">"} Network: Ethereum Mainnet | Gas optimized | Immutable records<br />
            {">"} Ready to proceed? [Y/n]: _
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToAction;