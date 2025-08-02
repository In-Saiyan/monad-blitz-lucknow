'use client';

import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LinkifiedText } from '@/components/LinkifiedText';
import LeaderboardSection from '@/components/LeaderboardSection';
import MatrixBackground from '@/components/ui/effects/MatrixBackground';
import { FaArrowLeft, FaUsers, FaCalendarAlt, FaClock, FaTrophy, FaClipboardList, FaFileDownload } from 'react-icons/fa';
import NFTRewardDistribution from '@/components/NFTRewardDistribution';

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  initialPoints: number;
  difficulty: string;
  solved: boolean;
  pointsAwarded?: number;
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
  const [refreshing, setRefreshing] = useState(false);

  const eventId = params?.id as string;

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  useEffect(() => {
    if (session?.user?.email && event?.participants) {
      setHasJoined(event.participants.some((p: any) => p.user.email === session.user?.email));
    }
  }, [session, event]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
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

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      if (response.ok) {
        const data = await response.json();
        setEvent(data);
      }
    } catch (err) {
      console.error('Error refreshing event:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium border";
    switch (status) {
      case 'UPCOMING':
        return `${baseClasses} bg-blue-500/20 text-blue-300 border-blue-500/50`;
      case 'ACTIVE':
        return `${baseClasses} bg-green-500/20 text-green-300 border-green-500/50`;
      case 'ENDED':
        return `${baseClasses} bg-gray-500/20 text-gray-300 border-gray-500/50`;
      default:
        return `${baseClasses} bg-gray-500/20 text-gray-300 border-gray-500/50`;
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
        return 'text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen bg-background flex items-center justify-center">
        <MatrixBackground />
        <div className="relative z-10 flex flex-col items-center gap-4 text-primary font-mono">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-accent"></div>
          <p>Loading Event...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="relative min-h-screen bg-background flex items-center justify-center">
        <MatrixBackground />
        <div className="relative z-10 text-center p-8 bg-background/50 backdrop-blur-sm rounded-xl border border-primary/20">
          <h2 className="text-2xl font-bold text-primary font-mono mb-4">{error || 'Event Not Found'}</h2>
          <p className="text-muted-foreground mb-6">The requested event could not be loaded or does not exist.</p>
          <Link href="/events" className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition-transform transform hover:scale-105 inline-block">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
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
    <div className="relative min-h-screen bg-background text-foreground">
      <MatrixBackground />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/events" className="inline-flex items-center text-accent hover:underline mb-4 font-mono">
            <FaArrowLeft className="mr-2" /> Back to All Missions
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-background/50 backdrop-blur-sm rounded-xl p-6 border border-primary/20">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-primary font-mono mb-2">{event.name}</h1>
              <div className="flex items-center gap-3">
                <span className={getStatusBadge(event.status)}>{event.status}</span>
                <span className="text-muted-foreground">
                  by {event.organizer?.username || 'Unknown Organizer'}
                </span>
              </div>
            </div>
            <div className="flex gap-3 mt-4 sm:mt-0">
              {session?.user?.email === event.organizer?.email && (
                <>
                  {event.status === 'UPCOMING' && (
                    <button onClick={handleStartEvent} disabled={startingEvent} className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium">
                      {startingEvent ? 'Starting...' : 'Start Now'}
                    </button>
                  )}
                  {event.status === 'ACTIVE' && (
                    <button onClick={handleEndEvent} disabled={endingEvent} className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium">
                      {endingEvent ? 'Ending...' : 'End Now'}
                    </button>
                  )}
                  <Link href={`/events/${event.id}/challenges`} className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium text-center">
                    Manage Challenges
                  </Link>
                </>
              )}
              {session && session.user?.email !== event.organizer?.email && (
                <>
                  {event.status === 'UPCOMING' && (
                    <div className="bg-blue-500/20 border border-blue-500/30 text-blue-300 px-6 py-3 rounded-lg font-medium">
                      Event Not Started Yet
                    </div>
                  )}
                  {event.status === 'ACTIVE' && !hasJoined && (
                    <button onClick={handleJoinEvent} disabled={joining} className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-lg font-bold transition-all transform hover:scale-105 disabled:transform-none disabled:bg-primary/50">
                      {joining ? 'Joining...' : 'Join Competition'}
                    </button>
                  )}
                  {event.status === 'ACTIVE' && hasJoined && (
                    <div className="flex gap-3">
                      <div className="bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg font-medium flex items-center">
                        Participating
                      </div>
                      <Link href={`/events/${event.id}/challenges-participant`} className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105">
                        Solve Challenges
                      </Link>
                    </div>
                  )}
                  {event.status === 'ENDED' && (
                    <div className="bg-gray-500/20 border border-gray-500/30 text-gray-300 px-6 py-3 rounded-lg font-medium">
                      {hasJoined ? 'You Participated' : 'Competition Ended'}
                    </div>
                  )}
                </>
              )}
              {!session && (
                <Link href="/auth/signin" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-lg font-bold transition-all transform hover:scale-105">
                  Sign In to Join
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-background/50 backdrop-blur-sm rounded-xl p-6 border border-primary/20">
              <h2 className="text-xl font-bold text-primary font-mono mb-4">About This Mission</h2>
              <p className="text-muted-foreground leading-relaxed">{event.description}</p>
            </div>

            <div className="bg-background/50 backdrop-blur-sm rounded-xl p-6 border border-primary/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-primary font-mono">Targets Overview</h2>
                <div className="flex items-center space-x-4">
                  <span className="text-muted-foreground text-sm">{event.challenges?.length || 0} total</span>
                  {hasJoined && <span className="text-green-400 text-sm font-medium">{event.challenges.filter(c => c.solved).length} solved</span>}
                  <button onClick={handleRefresh} disabled={refreshing} className="px-3 py-1 text-sm bg-accent/80 hover:bg-accent disabled:opacity-50 text-primary-foreground rounded-md transition-colors">
                    {refreshing ? '...' : 'Refresh'}
                  </button>
                </div>
              </div>
              
              {hasJoined && event.challenges.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground text-sm">Your Progress</span>
                    <span className="text-foreground text-sm font-medium">{Math.round((event.challenges.filter(c => c.solved).length / event.challenges.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-primary/10 rounded-full h-2">
                    <div className="bg-accent h-2 rounded-full transition-all duration-300" style={{ width: `${(event.challenges.filter(c => c.solved).length / event.challenges.length) * 100}%` }}></div>
                  </div>
                </div>
              )}
              
              {event.challenges && event.challenges.length > 0 ? (
                <div className="space-y-4">
                  {event.challenges.map((challenge) => (
                    <div key={challenge.id} className="bg-background/70 rounded-lg p-4 border border-primary/10 hover:border-accent transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-foreground">{challenge.title}</h3>
                            {challenge.solved && (
                              <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs font-medium border border-green-500/50">
                                Solved {challenge.pointsAwarded && `(+${challenge.pointsAwarded} pts)`}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 mb-3">
                            <span className={`text-sm font-medium ${getDifficultyColor(challenge.difficulty)}`}>{challenge.difficulty}</span>
                            <span className="text-primary font-bold">{challenge.initialPoints} pts</span>
                            <span className="text-xs bg-primary/20 text-accent px-2 py-1 rounded">{challenge.category}</span>
                          </div>
                        </div>
                      </div>
                      <LinkifiedText text={challenge.description} className="text-muted-foreground text-sm mb-3" />
                      {challenge.fileUrl && (
                        <div className="mb-3">
                          <span className="inline-flex items-center text-accent text-sm">
                            <FaFileDownload className="w-4 h-4 mr-1" /> Attachment Available
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                  {hasJoined && event.status === 'ACTIVE' && (
                    <div className="text-center pt-4">
                      <Link href={`/events/${event.id}/challenges-participant`} className="inline-flex items-center bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105">
                        Start Solving
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-lg">No targets available yet.</p>
                  <p className="text-muted-foreground/70 text-sm mt-1">The organizer will add targets soon!</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-background/50 backdrop-blur-sm rounded-xl p-6 border border-primary/20">
              <h3 className="text-lg font-bold text-primary font-mono mb-4">Mission Details</h3>
              <div className="space-y-4">
                <div className="flex items-center text-muted-foreground"><FaCalendarAlt className="h-5 w-5 mr-3 text-accent" /><div><div className="text-sm">Start Time</div><div className="font-medium text-foreground">{formatDate(event.startTime)}</div></div></div>
                <div className="flex items-center text-muted-foreground"><FaClock className="h-5 w-5 mr-3 text-accent" /><div><div className="text-sm">End Time</div><div className="font-medium text-foreground">{formatDate(event.endTime)}</div></div></div>
                <div className="flex items-center text-muted-foreground"><FaUsers className="h-5 w-5 mr-3 text-accent" /><div><div className="text-sm">Participants</div><div className="font-medium text-foreground">{event.participantCount}</div></div></div>
                <div className="flex items-center text-muted-foreground"><FaClipboardList className="h-5 w-5 mr-3 text-accent" /><div><div className="text-sm">Targets</div><div className="font-medium text-foreground">{event.challenges.length}</div></div></div>
              </div>
            </div>

            {event.organizer && (
              <div className="bg-background/50 backdrop-blur-sm rounded-xl p-6 border border-primary/20">
                <h3 className="text-lg font-bold text-primary font-mono mb-4">Organizer</h3>
                <div className="text-muted-foreground">
                  <div className="font-medium text-foreground">{event.organizer.username}</div>
                  <div className="text-sm">{event.organizer.email}</div>
                </div>
              </div>
            )}

            {event.status === 'UPCOMING' && timeUntilStart > 0 && (
              <div className="bg-blue-500/10 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
                <h3 className="text-lg font-bold text-blue-300 mb-2">Starts In</h3>
                <div className="text-foreground text-2xl font-bold font-mono">
                  {Math.floor(timeUntilStart / (1000 * 60 * 60 * 24))}d{' '}
                  {Math.floor((timeUntilStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))}h{' '}
                  {Math.floor((timeUntilStart % (1000 * 60 * 60)) / (1000 * 60))}m
                </div>
              </div>
            )}

            {event.status === 'ACTIVE' && timeUntilEnd > 0 && (
              <div className="bg-red-500/10 backdrop-blur-sm rounded-xl p-6 border border-red-500/20">
                <h3 className="text-lg font-bold text-red-300 mb-2">Ends In</h3>
                <div className="text-foreground text-2xl font-bold font-mono">
                  {Math.floor(timeUntilEnd / (1000 * 60 * 60 * 24))}d{' '}
                  {Math.floor((timeUntilEnd % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))}h{' '}
                  {Math.floor((timeUntilEnd % (1000 * 60 * 60)) / (1000 * 60))}m
                </div>
              </div>
            )}

            {event.status === 'ENDED' && (
              <div className="bg-gray-500/10 backdrop-blur-sm rounded-xl p-6 border border-gray-500/20">
                <h3 className="text-lg font-bold text-gray-300 mb-2">Mission Completed</h3>
                <p className="text-muted-foreground text-sm">This event has ended. Check out the final results.</p>
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

            {/* NFT Reward Distribution - Only for organizers */}
            {session?.user?.email === event.organizer?.email && (
              <NFTRewardDistribution
                eventId={event.id}
                eventName={event.name}
                eventEnded={event.status === 'ENDED'}
                isOrganizer={true}
              />
            )}

            {/* Leaderboard - Show if joined OR if event has ended */}
            {(hasJoined || event.status === 'ENDED') && (
              <div className="bg-background/50 backdrop-blur-sm rounded-xl p-6 border border-primary/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-primary font-mono">
                    {event.status === 'ENDED' ? 'Final Results' : 'Live Leaderboard'}
                  </h3>
                  {event.status === 'ENDED' && <FaTrophy className="text-yellow-400" />}
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
