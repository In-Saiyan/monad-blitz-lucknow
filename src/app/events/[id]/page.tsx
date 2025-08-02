'use client';

import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LinkifiedText } from '@/components/LinkifiedText';
import LeaderboardSection from '@/components/LeaderboardSection';

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  initialPoints: number;
  difficulty: string;
  solved: boolean;
  fileUrl?: string;
}

interface Event {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  status: 'UPCOMING' | 'ACTIVE' | 'ENDED';
  participantCount: number;
  organizer: {
    username: string;
    email: string;
  } | null;
  challenges: Challenge[];
  participants: any[];
}

export default function EventPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [startingEvent, setStartingEvent] = useState(false);
  const [endingEvent, setEndingEvent] = useState(false);

  const eventId = params?.id as string;

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  // Check if user has joined when session or event data changes
  useEffect(() => {
    if (session?.user?.email && event?.participants) {
      setHasJoined(event.participants.some((p: any) => p.user.email === session.user?.email));
    }
  }, [session, event]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Event not found');
        } else {
          setError('Failed to load event');
        }
        return;
      }
      const data = await response.json();
      setEvent(data);
    } catch (err) {
      console.error('Error fetching event:', err);
      setError('Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async () => {
    if (!session) {
      return;
    }

    setJoining(true);
    try {
      const response = await fetch(`/api/events/${eventId}/join`, {
        method: 'POST',
      });

      if (response.ok) {
        setHasJoined(true);
        // Refresh event data to update participant count
        fetchEvent();
        alert('Successfully joined the event!');
      } else {
        const errorText = await response.text();
        alert(errorText || 'Failed to join event');
      }
    } catch (err) {
      console.error('Error joining event:', err);
      alert('Failed to join event');
    } finally {
      setJoining(false);
    }
  };

  const handleStartEvent = async () => {
    if (!confirm('Are you sure you want to start this event now? This will make it immediately available to participants.')) {
      return;
    }

    setStartingEvent(true);
    try {
      const response = await fetch(`/api/events/${eventId}/start`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        alert('Event started successfully!');
        // Refresh event data to update status
        fetchEvent();
      } else {
        alert(data.error || 'Failed to start event');
      }
    } catch (err) {
      console.error('Error starting event:', err);
      alert('Failed to start event');
    } finally {
      setStartingEvent(false);
    }
  };

  const handleEndEvent = async () => {
    if (!confirm('Are you sure you want to end this event now? This action cannot be undone and will immediately stop the event.')) {
      return;
    }

    setEndingEvent(true);
    try {
      const response = await fetch(`/api/events/${eventId}/end`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        alert('Event ended successfully!');
        // Refresh event data to update status
        fetchEvent();
      } else {
        alert(data.error || 'Failed to end event');
      }
    } catch (err) {
      console.error('Error ending event:', err);
      alert('Failed to end event');
    } finally {
      setEndingEvent(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case 'UPCOMING':
        return `${baseClasses} bg-yellow-500/20 text-yellow-300 border border-yellow-500/30`;
      case 'ACTIVE':
        return `${baseClasses} bg-green-500/20 text-green-300 border border-green-500/30`;
      case 'ENDED':
        return `${baseClasses} bg-gray-500/20 text-gray-300 border border-gray-500/30`;
      default:
        return `${baseClasses} bg-gray-500/20 text-gray-300 border border-gray-500/30`;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'hard':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <div className="text-white text-xl">Loading event...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <div className="text-white text-xl mb-4">{error || 'Event not found'}</div>
            <Link
              href="/events"
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              ← Back to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const timeUntilStart = event.startTime ? new Date(event.startTime).getTime() - Date.now() : 0;
  const timeUntilEnd = event.endTime ? new Date(event.endTime).getTime() - Date.now() : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/events"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4"
          >
            ← Back to Events
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{event.name}</h1>
              <div className="flex items-center gap-3">
                <span className={getStatusBadge(event.status)}>{event.status}</span>
                <span className="text-gray-400">
                  by {event.organizer?.username || 'Unknown Organizer'}
                </span>
              </div>
            </div>
            <div className="flex gap-3 mt-4 sm:mt-0">
              {/* Organizer-only buttons */}
              {session?.user?.email === event.organizer?.email && (
                <>
                  {/* Start Now button for upcoming events */}
                  {event.status === 'UPCOMING' && (
                    <button
                      onClick={handleStartEvent}
                      disabled={startingEvent}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium"
                    >
                      {startingEvent ? 'Starting...' : 'Start Now'}
                    </button>
                  )}
                  
                  {/* End Now button for active events */}
                  {event.status === 'ACTIVE' && (
                    <button
                      onClick={handleEndEvent}
                      disabled={endingEvent}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium"
                    >
                      {endingEvent ? 'Ending...' : 'End Now'}
                    </button>
                  )}
                  
                  <Link
                    href={`/events/${event.id}/challenges`}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium text-center"
                  >
                    Manage Challenges
                  </Link>
                </>
              )}
              
              {/* Participant Actions */}
              {session && session.user?.email !== event.organizer?.email && (
                <>
                  {event.status === 'UPCOMING' && (
                    <div className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 px-6 py-3 rounded-lg font-medium">
                      📅 Event Not Started Yet
                    </div>
                  )}
                  
                  {event.status === 'ACTIVE' && !hasJoined && (
                    <button
                      onClick={handleJoinEvent}
                      disabled={joining}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-bold transition-all transform hover:scale-105 disabled:transform-none"
                    >
                      {joining ? '⏳ Joining...' : '🚀 Join Competition'}
                    </button>
                  )}
                  
                  {event.status === 'ACTIVE' && hasJoined && (
                    <div className="flex gap-3">
                      <div className="bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg font-medium flex items-center">
                        <span className="mr-2">✅</span>
                        Participating
                      </div>
                      <Link
                        href={`/events/${event.id}/challenges-participant`}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105"
                      >
                        🎯 Solve Challenges
                      </Link>
                    </div>
                  )}
                  
                  {event.status === 'ENDED' && hasJoined && (
                    <div className="bg-gray-500/20 border border-gray-500/30 text-gray-300 px-6 py-3 rounded-lg font-medium">
                      🏁 You Participated
                    </div>
                  )}
                  
                  {event.status === 'ENDED' && !hasJoined && (
                    <div className="bg-gray-500/20 border border-gray-500/30 text-gray-300 px-6 py-3 rounded-lg font-medium">
                      💔 Competition Ended
                    </div>
                  )}
                </>
              )}
              
              {!session && (
                <div className="flex gap-3">
                  <Link
                    href="/auth/signin"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-bold transition-all transform hover:scale-105"
                  >
                    🔑 Sign In to Join
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium border border-white/20 transition-all"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4">About This Event</h2>
              <p className="text-gray-300 leading-relaxed">{event.description}</p>
            </div>

            {/* Challenges Overview */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Challenges Overview</h2>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-300 text-sm">
                    {event.challenges?.length || 0} total
                  </span>
                  {hasJoined && (
                    <span className="text-green-400 text-sm font-medium">
                      {event.challenges.filter(c => c.solved).length} solved
                    </span>
                  )}
                </div>
              </div>
              
              {hasJoined && event.challenges.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm">Your Progress</span>
                    <span className="text-white text-sm font-medium">
                      {Math.round((event.challenges.filter(c => c.solved).length / event.challenges.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(event.challenges.filter(c => c.solved).length / event.challenges.length) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
              
              {event.challenges && event.challenges.length > 0 ? (
                <div className="space-y-4">
                  {event.challenges.map((challenge) => (
                    <div key={challenge.id} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">{challenge.title}</h3>
                            {challenge.solved && (
                              <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs font-medium border border-green-500/50">
                                ✅ Solved
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 mb-3">
                            <span className={`text-sm font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                              {challenge.difficulty}
                            </span>
                            <span className="text-blue-400 font-bold">{challenge.initialPoints} pts</span>
                            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                              {challenge.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      <LinkifiedText 
                        text={challenge.description} 
                        className="text-gray-300 text-sm mb-3"
                      />
                      {challenge.fileUrl && (
                        <div className="mb-3">
                          <span className="inline-flex items-center text-blue-400 text-sm">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            📎 Attachment Available
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {hasJoined && event.status === 'ACTIVE' && (
                    <div className="text-center pt-4">
                      <Link
                        href={`/events/${event.id}/challenges-participant`}
                        className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105"
                      >
                        🎯 Start Solving Challenges
                        <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎯</div>
                  <p className="text-gray-400 text-lg">No challenges available yet.</p>
                  <p className="text-gray-500 text-sm mt-1">The organizer will add challenges soon!</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Info */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-bold text-white mb-4">Event Details</h3>
              <div className="space-y-4">
                <div className="flex items-center text-gray-300">
                  <svg className="h-5 w-5 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <div className="text-sm text-gray-400">Start Time</div>
                    <div className="font-medium">{formatDate(event.startTime)}</div>
                  </div>
                </div>
                <div className="flex items-center text-gray-300">
                  <svg className="h-5 w-5 mr-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="text-sm text-gray-400">End Time</div>
                    <div className="font-medium">{formatDate(event.endTime)}</div>
                  </div>
                </div>
                <div className="flex items-center text-gray-300">
                  <svg className="h-5 w-5 mr-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div>
                    <div className="text-sm text-gray-400">Participants</div>
                    <div className="font-medium">{event.participantCount}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Organizer Info */}
            {event.organizer && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-bold text-white mb-4">Organizer</h3>
                <div className="text-gray-300">
                  <div className="font-medium text-white">{event.organizer.username}</div>
                  <div className="text-sm text-gray-400">{event.organizer.email}</div>
                </div>
              </div>
            )}

            {/* Time Information */}
            {event.status === 'UPCOMING' && timeUntilStart > 0 && (
              <div className="bg-yellow-500/10 backdrop-blur-sm rounded-xl p-6 border border-yellow-500/20">
                <h3 className="text-lg font-bold text-yellow-300 mb-2">Starts In</h3>
                <div className="text-white text-2xl font-bold">
                  {Math.floor(timeUntilStart / (1000 * 60 * 60 * 24))}d{' '}
                  {Math.floor((timeUntilStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))}h{' '}
                  {Math.floor((timeUntilStart % (1000 * 60 * 60)) / (1000 * 60))}m
                </div>
              </div>
            )}

            {event.status === 'UPCOMING' && timeUntilStart > 0 && (
              <div className="bg-blue-500/10 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
                <h3 className="text-lg font-bold text-blue-300 mb-2">🚀 Starts In</h3>
                <div className="text-white text-2xl font-bold mb-3">
                  {Math.floor(timeUntilStart / (1000 * 60 * 60 * 24))}d{' '}
                  {Math.floor((timeUntilStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))}h{' '}
                  {Math.floor((timeUntilStart % (1000 * 60 * 60)) / (1000 * 60))}m
                </div>
                <p className="text-gray-300 text-sm">
                  Get ready! You can join once the event starts.
                </p>
              </div>
            )}

            {event.status === 'ACTIVE' && timeUntilEnd > 0 && (
              <div className="bg-red-500/10 backdrop-blur-sm rounded-xl p-6 border border-red-500/20">
                <h3 className="text-lg font-bold text-red-300 mb-2">⏰ Ends In</h3>
                <div className="text-white text-2xl font-bold mb-3">
                  {Math.floor(timeUntilEnd / (1000 * 60 * 60 * 24))}d{' '}
                  {Math.floor((timeUntilEnd % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))}h{' '}
                  {Math.floor((timeUntilEnd % (1000 * 60 * 60)) / (1000 * 60))}m
                </div>
                {!hasJoined && session && (
                  <p className="text-gray-300 text-sm mb-3">
                    Join now to start solving challenges!
                  </p>
                )}
                {hasJoined && (
                  <p className="text-green-300 text-sm">
                    Keep going! You're making great progress.
                  </p>
                )}
              </div>
            )}

            {event.status === 'ENDED' && (
              <div className="bg-gray-500/10 backdrop-blur-sm rounded-xl p-6 border border-gray-500/20">
                <h3 className="text-lg font-bold text-gray-300 mb-2">🏁 Event Completed</h3>
                <p className="text-gray-300 text-sm mb-3">
                  This event has ended. Check out the final results below!
                </p>
                <div className="text-gray-400 text-sm">
                  Ended: {new Date(event.endTime).toLocaleDateString()} at {new Date(event.endTime).toLocaleTimeString()}
                </div>
              </div>
            )}

            {/* Event Statistics */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-bold text-white mb-4">Event Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Participants</span>
                  <span className="text-white font-bold">{event.participantCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Challenges</span>
                  <span className="text-white font-bold">{event.challenges.length}</span>
                </div>
                {hasJoined && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Your Progress</span>
                    <span className="text-green-400 font-bold">
                      {event.challenges.filter(c => c.solved).length}/{event.challenges.length} solved
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Leaderboard - Show if joined OR if event has ended */}
            {(hasJoined || event.status === 'ENDED') && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">
                    {event.status === 'ENDED' ? 'Final Results' : 'Live Leaderboard'}
                  </h3>
                  {event.status === 'ENDED' && (
                    <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded border border-yellow-500/50">
                      🏆 Competition Ended
                    </span>
                  )}
                </div>
                <LeaderboardSection eventId={event.id} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
