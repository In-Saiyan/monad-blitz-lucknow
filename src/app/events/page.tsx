'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ApiResponse } from '@/types';
import MatrixBackground from '@/components/ui/effects/MatrixBackground';
import { FaUsers, FaCalendarAlt, FaClock, FaClipboardList, FaPlusSquare, FaUserCog, FaUserShield } from 'react-icons/fa';

interface CTFEvent {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  status: 'UPCOMING' | 'ACTIVE' | 'ENDED';
  participantCount: number;
  _count: {
    challenges: number;
  };
  organizer: {
    username: string;
  };
}

export default function AllEventsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<CTFEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'ended'>('all');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchEvents();
  }, [session, status, router, filter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const url = `/api/events?status=${filter}`;
      const response = await fetch(url);
      const data: ApiResponse<CTFEvent[]> = await response.json();

      if (data.success && data.data) {
        setEvents(data.data);
      } else {
        setError(data.error || 'Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: 'UPCOMING' | 'ACTIVE' | 'ENDED') => {
    const colors = {
      ACTIVE: 'bg-green-500/20 text-green-300 border-green-500/50',
      UPCOMING: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
      ENDED: 'bg-gray-500/20 text-gray-300 border-gray-500/50'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[status]}`}>
        {status}
      </span>
    );
  };

  if (status === 'loading' || loading) {
    return (
      <div className="relative min-h-screen bg-background flex items-center justify-center">
        <MatrixBackground />
        <div className="relative z-10 flex flex-col items-center gap-4 text-primary font-mono">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-accent"></div>
          <p>Loading Events...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const activeEvents = events.filter(e => e.status === 'ACTIVE').length;
  const upcomingEvents = events.filter(e => e.status === 'UPCOMING').length;
  const endedEvents = events.filter(e => e.status === 'ENDED').length;

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <MatrixBackground />
      <div className="relative z-10">
        <nav className="bg-background/80 backdrop-blur-sm border-b border-primary/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-2xl font-bold font-mono text-primary hover:text-primary-focus transition-colors">
                CTF<span className='text-accent'>NFT</span>
              </Link>
              <div className="flex items-center space-x-2 md:space-x-4">
                <Link href="/dashboard" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Dashboard
                </Link>
                <Link href="/profile" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Profile
                </Link>
                <Link href="/api/auth/signout" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Sign Out
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold font-mono text-primary mb-4">All Missions</h1>
            <p className="text-muted-foreground text-lg">Browse and participate in Capture The Flag competitions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-background/50 backdrop-blur-sm rounded-xl p-4 border border-primary/20"><div className="text-2xl font-bold text-foreground">{events.length}</div><div className="text-muted-foreground text-sm">Total Missions</div></div>
            <div className="bg-background/50 backdrop-blur-sm rounded-xl p-4 border border-primary/20"><div className="text-2xl font-bold text-green-400">{activeEvents}</div><div className="text-muted-foreground text-sm">Active</div></div>
            <div className="bg-background/50 backdrop-blur-sm rounded-xl p-4 border border-primary/20"><div className="text-2xl font-bold text-blue-400">{upcomingEvents}</div><div className="text-muted-foreground text-sm">Upcoming</div></div>
            <div className="bg-background/50 backdrop-blur-sm rounded-xl p-4 border border-primary/20"><div className="text-2xl font-bold text-gray-400">{endedEvents}</div><div className="text-muted-foreground text-sm">Ended</div></div>
          </div>

          <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex space-x-1 bg-background/50 backdrop-blur-sm rounded-lg p-1 border border-primary/20">
              {[
                { key: 'all', label: 'All' }, { key: 'active', label: 'Active' },
                { key: 'upcoming', label: 'Upcoming' }, { key: 'ended', label: 'Ended' }
              ].map(({ key, label }) => (
                <button key={key} onClick={() => setFilter(key as any)} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-primary hover:bg-primary/10'}`}>
                  {label}
                </button>
              ))}
            </div>
            {(session.user?.role === 'ORGANIZER' || session.user?.role === 'ADMIN') && (
              <Link href={session.user?.role === 'ADMIN' ? "/admin" : "/organizer"} className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition-transform transform hover:scale-105">
                {session.user?.role === 'ADMIN' ? <FaUserShield /> : <FaUserCog />}
                {session.user?.role === 'ADMIN' ? 'Admin Panel' : 'Organizer Panel'}
              </Link>
            )}
          </div>

          {error && <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-4 mb-8"><p className="text-red-300">{error}</p></div>}

          {events.length === 0 ? (
            <div className="bg-background/50 backdrop-blur-sm rounded-xl p-8 border border-primary/20 text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">No Missions Found</h3>
              <p className="text-muted-foreground mb-6">{filter === 'all' ? 'There are no missions yet. Check back later!' : `No ${filter} missions at the moment.`}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`} className="block group">
                  <div className="bg-background/50 backdrop-blur-sm rounded-xl p-6 border border-primary/20 h-full flex flex-col justify-between group-hover:border-accent transition-colors">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-semibold text-foreground group-hover:text-accent transition-colors">{event.name}</h3>
                        {getStatusBadge(event.status)}
                      </div>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{event.description}</p>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground border-t border-primary/10 pt-4 mt-4">
                      <div className="flex items-center gap-2"><FaUserCog /> Organizer: {event.organizer?.username || 'Unknown'}</div>
                      <div className="flex items-center gap-2"><FaCalendarAlt /> Starts: {new Date(event.startTime).toLocaleString()}</div>
                      <div className="flex items-center gap-2"><FaClock /> Ends: {new Date(event.endTime).toLocaleString()}</div>
                      <div className="flex items-center gap-2"><FaUsers /> {event.participantCount} agents</div>
                      <div className="flex items-center gap-2"><FaClipboardList /> {event._count.challenges} targets</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
