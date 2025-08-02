'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ApiResponse, LeaderboardEntry } from '@/types';
import MatrixBackground from '@/components/ui/effects/MatrixBackground';
import { FaTrophy } from 'react-icons/fa';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/leaderboard');
        const data: ApiResponse<LeaderboardEntry[]> = await response.json();

        if (data.success && data.data) {
          setLeaderboard(data.data);
        } else {
          setError(data.error || 'Failed to fetch leaderboard');
        }
      } catch (err) {
        setError('An error occurred while fetching the leaderboard.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
    if (rank === 2) return 'bg-gray-400/20 text-gray-300 border-gray-400/50';
    if (rank === 3) return 'bg-amber-600/20 text-amber-400 border-amber-600/50';
    return 'bg-primary/10 text-muted-foreground border-primary/20';
  };

  if (loading) {
    return (
      <div className="relative min-h-screen bg-background flex items-center justify-center">
        <MatrixBackground />
        <div className="relative z-10 flex flex-col items-center gap-4 text-primary font-mono">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-accent"></div>
          <p>Loading Global Rankings...</p>
        </div>
      </div>
    );
  }

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
                <Link href="/events" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Events
                </Link>
                <Link href="/profile" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Profile
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold font-mono text-primary mb-4 flex items-center justify-center gap-3">
              <FaTrophy className="text-yellow-400" /> Global Leaderboard
            </h1>
            <p className="text-muted-foreground text-lg">Top agents across all missions.</p>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-4 mb-8">
              <p className="text-red-300 text-center">{error}</p>
            </div>
          )}

          <div className="bg-background/50 backdrop-blur-sm rounded-xl p-6 border border-primary/20">
            {leaderboard.length > 0 ? (
              <div className="flow-root">
                <div className="-mx-6 -my-2 overflow-x-auto">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <table className="min-w-full divide-y divide-primary/10">
                      <thead>
                        <tr>
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-primary sm:pl-0">Rank</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-primary">Agent</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-primary">Solves</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-primary">Last Solve</th>
                          <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0 text-right text-sm font-semibold text-primary">Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-primary/10">
                        {leaderboard.map((entry) => (
                          <tr key={entry.userId}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0">
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border ${getRankColor(entry.rank)}`}>
                                {entry.rank}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-foreground font-medium">{entry.username}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">{entry.solveCount}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                              {entry.lastSolveTime ? new Date(entry.lastSolveTime).toLocaleString() : 'N/A'}
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-mono font-bold text-accent sm:pr-0">{entry.totalScore}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg mb-4">The leaderboard is empty.</p>
                <p className="text-muted-foreground/70">Participate in an event to get on the board!</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}