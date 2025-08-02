'use client'

import { useValidatedSession } from '@/hooks/useValidatedSession'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import UserNFTCollection from '@/components/UserNFTCollection'
import MonadNetworkInfo from '@/components/MonadNetworkInfo'
import { FaTrophy, FaCalendarCheck, FaLaptopCode, FaChartLine } from 'react-icons/fa'

// Import the themed components for a consistent look
import MatrixBackground from '@/components/ui/effects/MatrixBackground'
import TerminalPrompt from '@/components/ui/effects/TerminalPrompt'

// --- Type definitions ---
interface AvailableEvent {
  id: string;
  title: string;
  description: string;
  status: 'UPCOMING' | 'ACTIVE' | 'ENDED';
  participantCount: number;
  _count: {
    challenges: number;
  };
}

interface UserStats {
  totalScore: number;
  eventsParticipated: number;
  challengesSolved: number;
  rank: number;
}

interface ParticipatedEvent {
  id: string;
  name: string;
  isActive: boolean;
  userScore: number;
  userRank: number;
  totalChallenges: number;
  solvedChallenges: number;
}

export default function Dashboard() {
  const { data: session, status } = useValidatedSession()
  const router = useRouter()
  const [availableEvents, setAvailableEvents] = useState<AvailableEvent[]>([])
  const [participatedEvents, setParticipatedEvents] = useState<ParticipatedEvent[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    const fetchData = async () => {
      try {
        const [availableRes, participatedRes, statsRes] = await Promise.all([
          fetch('/api/events'), // Fetches available (active/upcoming, un-joined) events
          fetch('/api/events/my-events'), // Fetches participated events
          fetch('/api/user/stats')
        ]);

        const availableData = await availableRes.json();
        setAvailableEvents(availableData.events || []);

        const participatedData = await participatedRes.json();
        setParticipatedEvents(participatedData.events || []);

        const statsData = await statsRes.json();
        setUserStats(statsData.stats || null);

      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setAvailableEvents([]);
        setParticipatedEvents([]);
        setUserStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData()
  }, [session, status, router])

  if (status === 'loading' || loading) {
    return (
      <div className="relative min-h-screen bg-background flex items-center justify-center">
        <MatrixBackground />
        <div className="relative z-10 flex flex-col items-center gap-4 text-primary font-mono">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-accent"></div>
          <p>Initializing Dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <MatrixBackground />
      <TerminalPrompt />

      <div className="relative z-10">
        <nav className="bg-background/80 backdrop-blur-sm border-b border-primary/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-2xl font-bold font-mono text-primary hover:text-primary-focus transition-colors">
                CTF<span className='text-accent'>NFT</span>
              </Link>
              <div className="flex items-center space-x-2 md:space-x-4">
                <Link href="/events" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Events
                </Link>
                <Link href="/leaderboard" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Leaderboard
                </Link>
                <Link href="/api/auth/signout" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Sign Out
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-background/50 backdrop-blur-sm rounded-xl p-8 border border-primary/20 mb-8">
            <h1 className="text-3xl font-bold font-mono text-primary mb-2">
              Welcome back, {session.user.username}!
            </h1>
            <p className="text-muted-foreground">Ready to capture some flags? Here's your status report.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard icon={<FaTrophy />} title="Total Score" value={userStats?.totalScore || 0} color="text-primary" />
            <StatCard icon={<FaCalendarCheck />} title="Events Joined" value={participatedEvents.length} color="text-accent" />
            <StatCard icon={<FaLaptopCode />} title="Challenges Solved" value={userStats?.challengesSolved || 0} color="text-green-400" />
            <StatCard icon={<FaChartLine />} title="Global Rank" value={`#${userStats?.rank || 'N/A'}`} color="text-yellow-400" />

          {/* NFT Collection Preview */}
          <div className="lg:col-span-2">
            <UserNFTCollection compact={true} maxDisplay={3} />
          </div>
        </div>

        {/* Monad Network Information */}
        <div className="mb-8">
          <MonadNetworkInfo />
        </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-background/50 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-primary/20">
              <h2 className="text-2xl font-bold font-mono text-primary mb-6">My Missions</h2>
              <div className="space-y-4 max-h-[28rem] overflow-y-auto pr-2">
                {participatedEvents.length > 0 ? participatedEvents.map(event => (
                  <EventCard key={event.id} event={event} type="participated" />
                )) : <EmptyState message="No missions joined yet." action={{ href: "/events", text: "Browse Missions" }} />}
              </div>
            </div>

            <div className="bg-background/50 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-primary/20">
              <h2 className="text-2xl font-bold font-mono text-primary mb-6">Available Missions</h2>
              <div className="space-y-4 max-h-[28rem] overflow-y-auto pr-2">
                {availableEvents.length > 0 ? availableEvents.slice(0, 6).map(event => (
                   <EventCard key={event.id} event={event} type="available" />
                )) : <EmptyState message="No new missions currently available." />}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

// --- Reusable Thematic Components ---

const StatCard = ({ icon, title, value, color }: { icon: React.ReactNode, title: string, value: string | number, color: string }) => (
  <div className="bg-background/70 backdrop-blur-sm rounded-xl p-6 border border-primary/10 flex items-center gap-4">
    <div className="p-3 bg-primary/10 rounded-lg text-primary text-2xl">{icon}</div>
    <div>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
    </div>
  </div>
);

const EventCard = ({ event, type }: { event: any, type: 'participated' | 'available' }) => {
  const statusConfig: Record<'ACTIVE' | 'UPCOMING' | 'ENDED', string> = {
    ACTIVE: 'bg-green-500/20 text-green-300 border-green-500/50',
    UPCOMING: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
    ENDED: 'bg-gray-500/20 text-gray-300 border-gray-500/50'
  };
  const statusKey = (event.status ?? (event.isActive ? 'ACTIVE' : 'ENDED')) as keyof typeof statusConfig;

  // --- Card for "My Missions" (Participated Events) ---
  if (type === 'participated') {
    return (
      <div className="bg-background/70 rounded-lg p-4 border border-primary/10 hover:border-accent transition-colors group">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors">{event.name}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[statusKey]}`}>{statusKey}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm mt-4">
          <div><p className="text-muted-foreground">Score</p><p className="font-bold text-primary">{event.userScore} pts</p></div>
          <div><p className="text-muted-foreground">Rank</p><p className="font-bold text-accent">#{event.userRank || 'N/A'}</p></div>
          <div><p className="text-muted-foreground">Progress</p><p className="font-bold text-green-400">{event.solvedChallenges}/{event.totalChallenges}</p></div>
          <div className="flex justify-end items-end">
            {(event.isActive || statusKey === 'ACTIVE') && <Link href={`/events/${event.id}`} className="text-accent hover:underline font-semibold">Continue →</Link>}
          </div>
        </div>
      </div>
    );
  }

  // --- Card for "Available Missions" ---
  if (type === 'available') {
    return (
      <Link href={`/events/${event.id}`} className="block group">
        <div className="bg-background/70 rounded-lg p-4 border border-primary/10 group-hover:border-accent transition-colors h-full flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors">{event.title}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[statusKey]}`}>{statusKey}</span>
            </div>
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{event.description}</p>
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            <span>👥 {event.participantCount} agents</span>
            <span className="mx-2">|</span>
            <span>🎯 {event._count.challenges} targets</span>
          </div>
        </div>
      </Link>
    );
  }

  return null; // Should not happen
};


const EmptyState = ({ message, action }: { message: string, action?: { href: string, text: string }}) => (
  <div className="text-center py-12">
    <p className="text-muted-foreground text-lg mb-4">{message}</p>
    {action && (
      <Link href={action.href} className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition-transform transform hover:scale-105 inline-block">
        {action.text}
      </Link>
    )}
  </div>
);