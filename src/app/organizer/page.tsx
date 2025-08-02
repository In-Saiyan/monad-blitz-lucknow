'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import EventCreateForm from '@/components/EventCreateForm';

export default function OrganizerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingEvent, setStartingEvent] = useState<string | null>(null);
  const [endingEvent, setEndingEvent] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (session.user?.role !== 'ORGANIZER' && session.user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    fetchMyEvents();
  }, [session, status, router]);

  const fetchMyEvents = async () => {
    try {
      const response = await fetch('/api/events/my-events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to start this event now? This will make it immediately available to participants.')) {
      return;
    }

    setStartingEvent(eventId);
    try {
      const response = await fetch(`/api/events/${eventId}/start`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        alert('Event started successfully!');
        // Refresh the events list
        fetchMyEvents();
      } else {
        alert(data.error || 'Failed to start event');
      }
    } catch (error) {
      console.error('Error starting event:', error);
      alert('An error occurred while starting the event');
    } finally {
      setStartingEvent(null);
    }
  };

  const handleEndEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to end this event now? This action cannot be undone and will immediately stop the event.')) {
      return;
    }

    setEndingEvent(eventId);
    try {
      const response = await fetch(`/api/events/${eventId}/end`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        alert('Event ended successfully!');
        // Refresh the events list
        fetchMyEvents();
      } else {
        alert(data.error || 'Failed to end event');
      }
    } catch (error) {
      console.error('Error ending event:', error);
      alert('An error occurred while ending the event');
    } finally {
      setEndingEvent(null);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!session || (session.user?.role !== 'ORGANIZER' && session.user?.role !== 'ADMIN')) {
    return null;
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
              <Link href="/events" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                All Events
              </Link>
              <Link href="/profile" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Profile
              </Link>
              {session.user?.role === 'ADMIN' && (
                <Link href="/admin" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Admin Panel
                </Link>
              )}
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
          <h1 className="text-3xl font-bold text-white mb-2">
            {session.user?.role === 'ADMIN' ? 'Admin' : 'Organizer'} Dashboard
          </h1>
          <p className="text-gray-300">Manage your CTF events and challenges</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Event Form */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-6">Create New Event</h2>
            <EventCreateForm onSuccess={fetchMyEvents} />
          </div>

          {/* My Events */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-6">My Events</h2>
            
            {loading ? (
              <div className="text-gray-300">Loading events...</div>
            ) : events.length === 0 ? (
              <div className="text-gray-400 text-center py-8">
                <div className="text-4xl mb-4">🎯</div>
                <p>No events created yet</p>
                <p className="text-sm">Create your first CTF event!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-white">{event.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        event.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800' 
                          : event.status === 'UPCOMING'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">{event.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-400">
                        <div>Participants: {event.participantCount || 0}</div>
                        <div>Challenges: {event.challenges?.length || 0}</div>
                        <div className="mt-1 text-gray-500">
                          Start: {new Date(event.startTime).toLocaleDateString()} {new Date(event.startTime).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {/* Start Now button for upcoming events */}
                        {event.status === 'UPCOMING' && (
                          <button
                            onClick={() => handleStartEvent(event.id)}
                            disabled={startingEvent === event.id}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                          >
                            {startingEvent === event.id ? 'Starting...' : 'Start Now'}
                          </button>
                        )}
                        
                        {/* End Now button for active events */}
                        {event.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleEndEvent(event.id)}
                            disabled={endingEvent === event.id}
                            className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                          >
                            {endingEvent === event.id ? 'Ending...' : 'End Now'}
                          </button>
                        )}
                        
                        <Link
                          href={`/events/${event.id}/challenges`}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs font-medium"
                        >
                          Manage Challenges
                        </Link>
                        <Link
                          href={`/events/${event.id}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium"
                        >
                          View Event
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
