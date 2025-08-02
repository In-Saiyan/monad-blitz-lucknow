'use client';

import { useValidatedSession } from '@/hooks/useValidatedSession';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ApiResponse, LeaderboardEntry } from '@/types';

interface CTFEvent {
  id: string;
  name: string;
  description: string;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  participantCount: number;
}

export default function Home() {
  const { data: session } = useValidatedSession();
  const [activeEvents, setActiveEvents] = useState<CTFEvent[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch active events
        const eventsResponse = await fetch('/api/events?status=active');
        const eventsData: ApiResponse<CTFEvent[]> = await eventsResponse.json();
        
        if (eventsData.success && eventsData.data) {
          setActiveEvents(eventsData.data);
        } else {
          setActiveEvents([]);
        }

        // Fetch leaderboard
        const leaderboardResponse = await fetch('/api/leaderboard?limit=5');
        const leaderboardData: ApiResponse<LeaderboardEntry[]> = await leaderboardResponse.json();
        
        if (leaderboardData.success && leaderboardData.data) {
          setLeaderboard(leaderboardData.data);
        } else {
          setLeaderboard([]);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              CTNFT
            </Link>
            <div className="flex items-center space-x-4">
              {session ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                  <span className="text-gray-300">Welcome, {session.user?.username}</span>
                  <Link
                    href="/api/auth/signout"
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign Out
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all transform hover:scale-105"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Capture The{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                NFT
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Compete in Capture The Flag challenges and earn exclusive NFT rewards. 
              Show your skills, climb the leaderboard, and collect unique digital assets.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {session ? (
                <>
                  <Link
                    href="/dashboard"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg text-lg font-bold transition-all transform hover:scale-105"
                  >
                    Go to Dashboard
                  </Link>
                  <Link
                    href="/events"
                    className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-8 py-4 rounded-lg text-lg font-bold border border-white/20 transition-all"
                  >
                    Browse All Events
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signup"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg text-lg font-bold transition-all transform hover:scale-105"
                  >
                    Start Competing
                  </Link>
                  <Link
                    href="/events"
                    className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-8 py-4 rounded-lg text-lg font-bold border border-white/20 transition-all"
                  >
                    Browse Events
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🏆</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Dynamic Scoring</h3>
            <p className="text-gray-300">
              Advanced scoring system that rewards speed and skill. First solvers get maximum points with decay over time.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🎨</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-4">NFT Rewards</h3>
            <p className="text-gray-300">
              Earn exclusive NFTs based on your performance. Different tiers for different achievements.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Real-time Updates</h3>
            <p className="text-gray-300">
              Live leaderboard updates and instant feedback on flag submissions. See your rank change in real-time.
            </p>
          </div>
        </div>
      </div>

      {/* Active Events & Leaderboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Events */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">🔥 Live Competitions</h2>
              <Link
                href="/events"
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                View All →
              </Link>
            </div>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-600 rounded w-3/4 mx-auto mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2 mx-auto"></div>
                </div>
              </div>
            ) : activeEvents && activeEvents.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">⏰</div>
                <p className="text-gray-400 text-lg mb-2">No active competitions</p>
                <p className="text-gray-500 text-sm mb-4">New challenges coming soon!</p>
                {session ? (
                  <Link
                    href="/events"
                    className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105"
                  >
                    Browse All Events
                  </Link>
                ) : (
                  <Link
                    href="/auth/signup"
                    className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105"
                  >
                    Join CTNFT
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {activeEvents && activeEvents.slice(0, 3).map((event, index) => (
                  <div key={event.id} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                            {event.name}
                          </h3>
                          <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs font-medium border border-green-500/50 animate-pulse">
                            🟢 LIVE
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mb-3 line-clamp-2">{event.description}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-gray-400 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {event.participantCount} competing
                        </span>
                      </div>
                      <Link
                        href={session ? `/events/${event.id}` : '/auth/signin'}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105"
                      >
                        {session ? '⚡ Join Now' : '🔑 Sign In'}
                      </Link>
                    </div>
                  </div>
                ))}
                <div className="text-center pt-4">
                  <Link
                    href="/events"
                    className="inline-flex items-center text-blue-400 hover:text-blue-300 font-medium"
                  >
                    View All Competitions
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Top Players */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">🏆 Top Players</h2>
              <Link
                href="/leaderboard"
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                Full Rankings →
              </Link>
            </div>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-pulse space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-600 rounded w-2/3 mb-1"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : leaderboard && leaderboard.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🎯</div>
                <p className="text-gray-400 text-lg mb-2">No players yet.</p>
                <p className="text-gray-500 text-sm mb-4">Be the first to solve a challenge!</p>
                {session ? (
                  <Link
                    href="/events"
                    className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105"
                  >
                    🚀 Start Competing
                  </Link>
                ) : (
                  <Link
                    href="/auth/signup"
                    className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105"
                  >
                    🎖️ Join the Race
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {leaderboard && leaderboard.map((entry, index) => (
                  <div key={entry.username} className="flex items-center justify-between bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors group">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mr-4 ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-lg' :
                        index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-black shadow-lg' :
                        index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-lg' :
                        'bg-gradient-to-r from-gray-600 to-gray-700 text-white'
                      }`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                      </div>
                      <div>
                        <span className="text-white font-medium group-hover:text-blue-300 transition-colors">
                          {entry.username}
                        </span>
                        <div className="text-xs text-gray-400">
                          {index === 0 ? 'Champion' : index === 1 ? 'Runner-up' : index === 2 ? 'Third Place' : 'Top Player'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-blue-400 font-bold text-lg">{entry.totalScore}</span>
                      <div className="text-xs text-gray-400">points</div>
                    </div>
                  </div>
                ))}
                <div className="text-center pt-4">
                  <Link
                    href="/leaderboard"
                    className="inline-flex items-center text-blue-400 hover:text-blue-300 font-medium"
                  >
                    View Complete Rankings
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2024 CTNFT. Built for hackathon purposes.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
