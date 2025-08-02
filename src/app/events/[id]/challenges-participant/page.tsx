'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { LinkifiedText } from '@/components/LinkifiedText';
import Link from 'next/link';

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
  title: string;
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

  useEffect(() => {
    if (status === 'loading') return;
    
    async function fetchEvent() {
      try {
        const resolvedParams = await params;
        const response = await fetch(`/api/events/${resolvedParams.id}/challenges-participant`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          }
        });
        if (response.ok) {
          const eventData = await response.json();
          console.log('Event data fetched:', eventData);
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
  }, [params, status]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const resolvedParams = await params;
      const response = await fetch(`/api/events/${resolvedParams.id}/challenges-participant`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      if (response.ok) {
        const eventData = await response.json();
        console.log('Data manually refreshed:', eventData);
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
      const resolvedParams = await params;
      const response = await fetch(`/api/events/${resolvedParams.id}/challenges/${challengeId}/submit`, {
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
        
        // Refresh the event data to update solved status
        console.log('Flag submitted successfully, refreshing data...');
        const resolvedParams = await params;
        const refreshResponse = await fetch(`/api/events/${resolvedParams.id}/challenges-participant`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          }
        });
        if (refreshResponse.ok) {
          const refreshedEvent = await refreshResponse.json();
          console.log('Data refreshed:', refreshedEvent);
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

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading challenges...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">Event not found</div>
          <Link
            href="/events"
            className="text-blue-400 hover:text-blue-300"
          >
            ← Back to Events
          </Link>
        </div>
      </div>
    );
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
              <Link href="/events" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Events
              </Link>
              <span className="text-gray-300">Welcome, {session?.user?.username}</span>
              <Link href="/api/auth/signout" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                {event.title}
              </h1>
              <p className="text-gray-300">{event.description}</p>
              <div className="flex items-center space-x-4 mt-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isEventActive(event) 
                    ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                    : 'bg-red-500/20 text-red-300 border border-red-500/50'
                }`}>
                  {isEventActive(event) ? 'Active' : 'Ended'}
                </span>
                <span className="text-gray-400 text-sm">
                  {event.challenges.length} Challenges
                </span>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md transition-colors"
                >
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>
            <Link
              href={`/events/${event.id}`}
              className="text-gray-400 hover:text-gray-300 text-sm"
            >
              ← Back to Event
            </Link>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 mb-6 ${
            message.type === 'success' 
              ? 'border-green-500/50 text-green-300' 
              : 'border-red-500/50 text-red-300'
          }`}>
            {message.text}
          </div>
        )}

        {/* Challenges */}
        <div className="space-y-6">
          {event.challenges.map((challenge) => (
            <div
              key={challenge.id}
              className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <h3 className="text-xl font-semibold text-white">{challenge.title}</h3>
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium border border-purple-500/50">
                        {challenge.category}
                      </span>
                      {challenge.difficulty && (
                        <span className={`px-2 py-1 rounded-full text-sm font-medium border ${
                          challenge.difficulty === 'Easy' 
                            ? 'bg-green-500/20 text-green-300 border-green-500/50'
                            : challenge.difficulty === 'Medium'
                            ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
                            : 'bg-red-500/20 text-red-300 border-red-500/50'
                        }`}>
                          {challenge.difficulty}
                        </span>
                      )}
                      {challenge.solved && (
                        <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-medium border border-green-500/50">
                          ✓ Solved ({challenge.pointsAwarded} pts)
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-gray-400 text-sm">
                      {challenge._count.solves} solve{challenge._count.solves !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <button
                    onClick={() => setExpandedChallenge(
                      expandedChallenge === challenge.id ? null : challenge.id
                    )}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    {expandedChallenge === challenge.id ? (
                      <ChevronUpIcon className="w-5 h-5" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {expandedChallenge === challenge.id && (
                  <div className="mt-6 border-t border-white/10 pt-6">
                    {/* Challenge Description */}
                    <div className="mb-6">
                      <h4 className="text-lg font-medium text-white mb-3">Description</h4>
                      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <LinkifiedText text={challenge.description} className="text-gray-300 whitespace-pre-wrap" />
                      </div>
                    </div>

                    {/* File Download */}
                    {challenge.fileUrl && (
                      <div className="mb-6">
                        <h4 className="text-lg font-medium text-white mb-3">Attachments</h4>
                        <a
                          href={challenge.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all transform hover:scale-105"
                        >
                          � Download File
                        </a>
                      </div>
                    )}

                    {/* Flag Submission */}
                    {isEventActive(event) && !challenge.solved && (
                      <div>
                        <h4 className="text-lg font-medium text-white mb-3">Submit Flag</h4>
                        <div className="flex space-x-3">
                          <input
                            type="text"
                            value={flagInputs[challenge.id] || ''}
                            onChange={(e) => setFlagInputs(prev => ({
                              ...prev,
                              [challenge.id]: e.target.value
                            }))}
                            placeholder="ctnft{...}"
                            className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400 text-white placeholder-gray-400"
                            disabled={submittingFlag === challenge.id}
                          />
                          <button
                            onClick={() => handleFlagSubmit(challenge.id)}
                            disabled={submittingFlag === challenge.id || !flagInputs[challenge.id]?.trim()}
                            className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all transform hover:scale-105 disabled:transform-none"
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
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-12 border border-white/20 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-white mb-2">No Challenges Yet</h3>
              <p className="text-gray-400">Challenges will appear here once the event organizer adds them.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
