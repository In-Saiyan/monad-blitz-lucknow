'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ApiResponse } from '@/types';

interface CTFEvent {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
  organizer: {
    id: string;
    username: string;
    email: string;
  };
  participants: Array<{
    id: string;
    totalScore: number;
    rank: number | null;
  }>;
  challenges: Array<{
    id: string;
    title: string;
    category: string;
    difficulty: string;
  }>;
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
      const url = filter === 'all' ? '/api/events' : `/api/events?status=${filter}`;
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

  const getEventStatus = (event: CTFEvent) => {
    const now = new Date();
    const startTime = new Date(event.startTime);
    const endTime = new Date(event.endTime);

    if (now < startTime) return 'upcoming';
    if (now > endTime) return 'ended';
    return 'active';
  };

  const getStatusBadge = (event: CTFEvent) => {
    const status = getEventStatus(event);
    const colors = {
      active: 'bg-green-100 text-green-800',
      upcoming: 'bg-blue-100 text-blue-800',
      ended: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const joinEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/join`, {
        method: 'POST',
      });

      const data: ApiResponse<any> = await response.json();
      
      if (data.success) {
        alert('Successfully joined the event!');
        fetchEvents(); // Refresh events to update participant count
      } else {
        alert(data.error || 'Failed to join event');
      }
    } catch (error) {
      console.error('Error joining event:', error);
      alert('An error occurred while joining the event');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              CTNFT
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Dashboard
              </Link>
              {session.user?.role === 'ADMIN' && (
                <Link href="/admin" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Admin
                </Link>
              )}
              <Link href="/profile" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Profile
              </Link>
              <span className="text-gray-300">Welcome, {session.user?.username}</span>
              <Link href="/api/auth/signout" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            CTF Events
          </h1>
          <p className="text-gray-300 text-lg">Browse and participate in Capture The Flag competitions</p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold text-white">{events.length}</div>
            <div className="text-gray-400 text-sm">Total Events</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold text-green-400">{events.filter((e: CTFEvent) => getEventStatus(e) === 'active').length}</div>
            <div className="text-gray-400 text-sm">Active Now</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold text-blue-400">{events.filter((e: CTFEvent) => getEventStatus(e) === 'upcoming').length}</div>
            <div className="text-gray-400 text-sm">Upcoming</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold text-gray-400">{events.filter((e: CTFEvent) => getEventStatus(e) === 'ended').length}</div>
            <div className="text-gray-400 text-sm">Completed</div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20">
            {[
              { key: 'all', label: 'All Events', emoji: '📋' },
              { key: 'active', label: 'Active', emoji: '🔴' },
              { key: 'upcoming', label: 'Upcoming', emoji: '⏰' },
              { key: 'ended', label: 'Ended', emoji: '🏁' }
            ].map(({ key, label, emoji }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all transform hover:scale-105 ${
                  filter === key
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {emoji} {label}
              </button>
            ))}
          </div>
        </div>

        {/* Create Event Button for Organizers/Admins */}
        {(session.user?.role === 'ORGANIZER' || session.user?.role === 'ADMIN') && (
          <div className="mb-8 flex gap-4">
            <Link
              href={session.user?.role === 'ADMIN' ? "/admin" : "/organizer"}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {session.user?.role === 'ADMIN' ? 'Admin Dashboard' : 'Organizer Dashboard'}
            </Link>
            {session.user?.role === 'ADMIN' && (
              <Link
                href="/organizer"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Event Management
              </Link>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Events Grid */}
        {events.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-center">
            <div className="text-6xl mb-4">🏁</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Events Found</h3>
            <p className="text-gray-400 mb-6">
              {filter === 'all' 
                ? 'There are no CTF events yet. Check back later!'
                : `No ${filter} events at the moment.`
              }
            </p>
            {(session.user?.role === 'ORGANIZER' || session.user?.role === 'ADMIN') && (
              <Link
                href="/admin"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium inline-block"
              >
                Create First Event
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {events.map((event) => (
              <div 
                key={event.id} 
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 cursor-pointer hover:bg-white/15 transition-colors"
                onClick={() => router.push(`/events/${event.id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{event.name}</h3>
                    {getStatusBadge(event)}
                  </div>
                </div>

                <p className="text-gray-300 text-sm mb-4 line-clamp-3">{event.description}</p>

                <div className="space-y-2 text-sm text-gray-400 mb-4">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Organizer: {event.organizer?.username || 'Unknown'}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {new Date(event.startTime).toLocaleDateString()} - {new Date(event.endTime).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {(event as any).participantCount || event.participants?.length || 0} / {(event as any).maxParticipants || 10000} participants
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {event.challenges?.length || 0} challenges
                  </div>
                  {(event as any).joinDeadlineMinutes !== undefined && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Join within {(event as any).joinDeadlineMinutes} min of start
                    </div>
                  )}
                </div>

                {/* Join restrictions info */}
                {(event as any).joinRestrictionReason && getEventStatus(event) === 'active' && (
                  <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                    <p className="text-yellow-300 text-sm">
                      ⚠️ {(event as any).joinRestrictionReason}
                    </p>
                  </div>
                )}

                <div className="flex space-x-3">
                  {getEventStatus(event) === 'active' && (event as any).canJoin !== false && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        joinEvent(event.id);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Join Event
                    </button>
                  )}
                  
                  {getEventStatus(event) === 'upcoming' && (
                    <div className="flex-1 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-lg text-sm font-medium text-center border border-blue-500/50">
                      Starts {new Date(event.startTime).toLocaleDateString()}
                    </div>
                  )}

                  {getEventStatus(event) === 'active' && (event as any).canJoin === false && (
                    <div className="flex-1 bg-gray-500/20 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium text-center border border-gray-500/50">
                      Cannot Join
                    </div>
                  )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        joinEvent(event.id);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Join Event
                    </button>
                  {getEventStatus(event) === 'active' && (event as any).canJoin === false && (
                    <div className="flex-1 bg-gray-500/20 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium text-center border border-gray-500/50">
                      Cannot Join
                    </div>
                  )}
                  
                  <Link
                    href={`/events/${event.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium text-center"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
