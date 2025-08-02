'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { LinkifiedText } from '@/components/LinkifiedText';
import Link from 'next/link';
import MatrixBackground from '@/components/ui/effects/MatrixBackground';
import { FaArrowLeft, FaFileDownload } from 'react-icons/fa';

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty?: string;
  fileUrl?: string;
  solved: boolean;
  pointsAwarded?: number;
  _count: {
    solves: number;
  };
}

interface Event {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  status: string;
  challenges: Challenge[];
}

export default function ChallengesParticipantPage() {
  const params = useParams();
  const { data: session, status } = useSession();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedChallenge, setExpandedChallenge] = useState<string | null>(null);
  const [flagInputs, setFlagInputs] = useState<Record<string, string>>({});
  const [submittingFlag, setSubmittingFlag] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const eventId = params?.id as string;

  useEffect(() => {
    if (status === 'loading') return;
    
    async function fetchEvent() {
      try {
        const response = await fetch(`/api/events/${eventId}/challenges-participant`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          }
        });
        if (response.ok) {
          const eventData = await response.json();
          setEvent(eventData);
        } else {
          console.error('Failed to fetch event:', response.status);
        }
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [eventId, status]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await fetch(`/api/events/${eventId}/challenges-participant`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      if (response.ok) {
        const eventData = await response.json();
        setEvent(eventData);
        setMessage({ type: 'success', text: 'Data refreshed successfully!' });
      }
    } catch (error) {
      console.error('Error refreshing:', error);
      setMessage({ type: 'error', text: 'Failed to refresh data' });
    } finally {
      setRefreshing(false);
    }
  };

  const handleFlagSubmit = async (challengeId: string) => {
    const flag = flagInputs[challengeId]?.trim();
    if (!flag) {
      setMessage({ type: 'error', text: 'Please enter a flag' });
      return;
    }

    setSubmittingFlag(challengeId);
    setMessage(null);

    try {
      const response = await fetch(`/api/events/${eventId}/challenges/${challengeId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ flag }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `Correct flag! You earned ${data.pointsAwarded} points!` 
        });
        setFlagInputs(prev => ({ ...prev, [challengeId]: '' }));
        
        const refreshResponse = await fetch(`/api/events/${eventId}/challenges-participant`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          }
        });
        if (refreshResponse.ok) {
          const refreshedEvent = await refreshResponse.json();
          setEvent(refreshedEvent);
        } else {
          console.error('Failed to refresh data:', refreshResponse.status);
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to submit flag' });
      }
    } catch (error) {
      console.error('Error submitting flag:', error);
      setMessage({ type: 'error', text: 'An error occurred while submitting the flag' });
    } finally {
      setSubmittingFlag(null);
    }
  };

  const isEventActive = (event: Event) => {
    const now = new Date();
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);
    return now >= start && now <= end;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      case 'hard': return 'bg-red-500/20 text-red-300 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="relative min-h-screen bg-background flex items-center justify-center">
        <MatrixBackground />
        <div className="relative z-10 flex flex-col items-center gap-4 text-primary font-mono">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-accent"></div>
          <p>Loading Targets...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="relative min-h-screen bg-background flex items-center justify-center">
        <MatrixBackground />
        <div className="relative z-10 text-center p-8 bg-background/50 backdrop-blur-sm rounded-xl border border-primary/20">
          <h2 className="text-2xl font-bold text-primary font-mono mb-4">Event Not Found</h2>
          <p className="text-muted-foreground mb-6">The requested event could not be loaded.</p>
          <Link href="/events" className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition-transform transform hover:scale-105 inline-block">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <MatrixBackground />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href={`/events/${eventId}`} className="inline-flex items-center text-accent hover:underline mb-4 font-mono">
            <FaArrowLeft className="mr-2" /> Back to Event Overview
          </Link>
          <div className="bg-background/50 backdrop-blur-sm rounded-xl p-6 border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-primary font-mono mb-2">
                  {event.name}
                </h1>
                <p className="text-muted-foreground">Engage and capture the flags.</p>
                <div className="flex items-center space-x-4 mt-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                    isEventActive(event) 
                      ? 'bg-green-500/20 text-green-300 border-green-500/50'
                      : 'bg-red-500/20 text-red-300 border-red-500/50'
                  }`}>
                    {isEventActive(event) ? 'Active' : 'Ended'}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {event.challenges.length} Targets
                  </span>
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="px-3 py-1 text-sm bg-accent/80 hover:bg-accent disabled:opacity-50 text-primary-foreground rounded-md transition-colors"
                  >
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div className={`bg-background/50 backdrop-blur-sm rounded-xl p-4 border mb-6 ${
            message.type === 'success' 
              ? 'border-green-500/50 text-green-300' 
              : 'border-red-500/50 text-red-300'
          }`}>
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          {event.challenges.map((challenge) => (
            <div
              key={challenge.id}
              className="bg-background/50 backdrop-blur-sm rounded-xl border border-primary/20 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-3">
                      <h3 className="text-xl font-semibold text-primary">{challenge.title}</h3>
                      <span className="px-2 py-1 bg-primary/20 text-accent rounded-full text-sm font-medium border border-primary/30">
                        {challenge.category}
                      </span>
                      {challenge.difficulty && (
                        <span className={`px-2 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(challenge.difficulty)}`}>
                          {challenge.difficulty}
                        </span>
                      )}
                      {challenge.solved && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-medium border border-green-500/50">
                          ✓ Solved ({challenge.pointsAwarded} pts)
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-muted-foreground text-sm">
                      {challenge._count.solves} solve{challenge._count.solves !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <button
                    onClick={() => setExpandedChallenge(
                      expandedChallenge === challenge.id ? null : challenge.id
                    )}
                    className="p-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {expandedChallenge === challenge.id ? (
                      <ChevronUpIcon className="w-5 h-5" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {expandedChallenge === challenge.id && (
                  <div className="mt-6 border-t border-primary/10 pt-6">
                    <div className="mb-6">
                      <h4 className="text-lg font-medium text-primary mb-3">Description</h4>
                      <div className="bg-background/70 rounded-lg p-4 border border-primary/10">
                        <LinkifiedText text={challenge.description} className="text-muted-foreground whitespace-pre-wrap" />
                      </div>
                    </div>

                    {challenge.fileUrl && (
                      <div className="mb-6">
                        <h4 className="text-lg font-medium text-primary mb-3">Attachments</h4>
                        <a
                          href={challenge.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all transform hover:scale-105"
                        >
                          <FaFileDownload /> Download File
                        </a>
                      </div>
                    )}

                    {isEventActive(event) && !challenge.solved && (
                      <div>
                        <h4 className="text-lg font-medium text-primary mb-3">Submit Flag</h4>
                        <div className="flex space-x-3">
                          <input
                            type="text"
                            value={flagInputs[challenge.id] || ''}
                            onChange={(e) => setFlagInputs(prev => ({
                              ...prev,
                              [challenge.id]: e.target.value
                            }))}
                            placeholder="ctf{...}"
                            className="flex-1 px-4 py-3 bg-background/70 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground placeholder-muted-foreground"
                            disabled={submittingFlag === challenge.id}
                          />
                          <button
                            onClick={() => handleFlagSubmit(challenge.id)}
                            disabled={submittingFlag === challenge.id || !flagInputs[challenge.id]?.trim()}
                            className="px-6 py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground rounded-lg font-medium transition-all transform hover:scale-105 disabled:transform-none"
                          >
                            {submittingFlag === challenge.id ? 'Submitting...' : 'Submit'}
                          </button>
                        </div>
                      </div>
                    )}

                    {challenge.solved && (
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                        <div className="flex items-center">
                          <span className="text-green-400 mr-2">✓</span>
                          <span className="text-green-300">Challenge completed! You earned {challenge.pointsAwarded} points.</span>
                        </div>
                      </div>
                    )}

                    {!isEventActive(event) && !challenge.solved && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                        <div className="flex items-center">
                          <span className="text-red-400 mr-2">⏰</span>
                          <span className="text-red-300">Event has ended. Flag submission is no longer available.</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {event.challenges.length === 0 && (
            <div className="bg-background/50 backdrop-blur-sm rounded-xl p-12 border border-primary/20 text-center">
              <div className="text-6xl mb-4 text-primary">🎯</div>
              <h3 className="text-xl font-semibold text-primary mb-2">No Targets Available</h3>
              <p className="text-muted-foreground">Targets will appear here once the event organizer adds them.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
