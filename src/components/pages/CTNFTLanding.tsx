"use client";
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';

// Hooks and Components
import { useValidatedSession } from '@/hooks/useValidatedSession';
import Hero from '@/components/sections/Hero';
import HowItWorks from '@/components/sections/HowItWorks';
import WhyCTNFT from '@/components/sections/WhyCTNFT';
import CallToAction from '@/components/sections/CallToAction';
import MatrixBackground from '@/components/ui/effects/MatrixBackground';
import TerminalPrompt from '@/components/ui/effects/TerminalPrompt';

gsap.registerPlugin(ScrollTrigger);

// Type definitions for fetched data
interface CTFEvent {
  id: string;
  name: string;
  description: string;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  participantCount: number;
}

interface LeaderboardEntry {
  username: string;
  totalScore: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}


const CTNFTLanding = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // State and session management from new functionality
  const { data: session } = useValidatedSession();
  const [activeEvents, setActiveEvents] = useState<CTFEvent[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Original useEffect for GSAP scroll animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.section').forEach((section: any) => {
        gsap.fromTo(section, 
          { opacity: 0, y: 100 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse"
            }
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // New useEffect for fetching data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [eventsRes, leaderboardRes] = await Promise.all([
          fetch('/api/events?status=active'),
          fetch('/api/leaderboard?limit=5')
        ]);
        
        const eventsData: ApiResponse<CTFEvent[]> = await eventsRes.json();
        if (eventsData.success && eventsData.data) {
          setActiveEvents(eventsData.data);
        }

        const leaderboardData: ApiResponse<LeaderboardEntry[]> = await leaderboardRes.json();
        if (leaderboardData.success && leaderboardData.data) {
          setLeaderboard(leaderboardData.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setActiveEvents([]);
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* Matrix Background Effect */}
      <MatrixBackground />
      
      {/* Terminal Prompt Easter Egg */}
      <TerminalPrompt />
      
      {/* Main Content */}
      <div className="relative z-10">
        
        {/* --- ADDED: Navigation Bar --- */}
        <nav className="bg-background/80 backdrop-blur-sm border-b border-primary/20 fixed top-0 left-0 right-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-2xl font-bold font-mono text-primary hover:text-primary-focus transition-colors">
                CT<span className='text-accent'>NFT</span>
              </Link>
              <div className="flex items-center space-x-4">
                {session ? (
                  <>
                    <Link href="/dashboard" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                      Dashboard
                    </Link>
                    <span className="text-muted-foreground hidden sm:inline">Welcome, {session.user?.username}</span>
                    <Link href="/api/auth/signout" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                      Sign Out
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/auth/signin" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                      Sign In
                    </Link>
                    <Link href="/auth/signup" className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-all transform hover:scale-105">
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* The main content area now has padding-top to avoid being obscured by the fixed nav */}
        <main className="pt-16">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {/* Passing session to Hero allows it to show conditional buttons */}
            <Hero  />
          </motion.div>
          
          <div className="section">
            <HowItWorks />
          </div>
          
          <div className="section">
            <WhyCTNFT />
          </div>
          
          {/* --- ADDED: Active Events & Leaderboard Section --- */}
          <div className="section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Active Events Card */}
              <div className="bg-background/50 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-primary/20">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-primary font-mono">🔥 Live Competitions</h2>
                  <Link href="/events" className="text-accent hover:text-accent-focus text-sm font-medium">
                    View All →
                  </Link>
                </div>
                {loading ? (
                  <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div></div>
                ) : activeEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground text-lg mb-2">No active competitions</p>
                    <p className="text-muted-foreground/70 text-sm mb-4">New challenges coming soon!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeEvents.slice(0, 3).map((event) => (
                      <div key={event.id} className="bg-background/70 rounded-lg p-4 border border-primary/10 hover:border-accent transition-colors group">
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors mb-2">
                          {event.name}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{event.description}</p>
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                            <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs font-medium border border-green-500/50 animate-pulse">LIVE</span>
                            <span>•</span>
                            <span>{event.participantCount} competing</span>
                          </div>
                          <Link href={session ? `/events/${event.id}` : '/auth/signin'} className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105">
                            {session ? 'Join Now' : 'Sign In'}
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Players Card */}
              <div className="bg-background/50 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-primary/20">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-primary font-mono">🏆 Top Players</h2>
                  <Link href="/leaderboard" className="text-accent hover:text-accent-focus text-sm font-medium">
                    Full Rankings →
                  </Link>
                </div>
                {loading ? (
                  <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div></div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground text-lg mb-2">No players on the board yet.</p>
                    <p className="text-muted-foreground/70 text-sm mb-4">Be the first to solve a challenge!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leaderboard.map((entry, index) => (
                      <div key={entry.username} className="flex items-center justify-between bg-background/70 rounded-lg p-3 border border-primary/10 hover:border-accent transition-colors group">
                        <div className="flex items-center">
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold mr-4 ${
                            index === 0 ? 'bg-yellow-400 text-black' :
                            index === 1 ? 'bg-gray-400 text-black' :
                            index === 2 ? 'bg-orange-400 text-white' :
                            'bg-primary/30 text-primary'
                          }`}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : <span className="text-sm">{index + 1}</span>}
                          </div>
                          <span className="text-foreground font-medium group-hover:text-accent transition-colors">{entry.username}</span>
                        </div>
                        <span className="text-accent font-bold text-lg">{entry.totalScore} pts</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="section">
            <CallToAction />
          </div>

          {/* --- ADDED: Footer --- */}
          <footer className="bg-background/80 backdrop-blur-sm border-t border-primary/10 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center text-muted-foreground">
                <p>© {new Date().getFullYear()} CTNFT. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default CTNFTLanding;