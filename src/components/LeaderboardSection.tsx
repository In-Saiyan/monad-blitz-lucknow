'use client';

import { useState, useEffect } from 'react';

interface LeaderboardEntry {
  id: string;
  totalScore: number;
  rank: number;
  user: {
    id: string;
    username: string;
  };
}

interface LeaderboardSectionProps {
  eventId: string;
}

export default function LeaderboardSection({ eventId }: LeaderboardSectionProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await fetch(`/api/events/${eventId}/leaderboard`);
        if (response.ok) {
          const data = await response.json();
          setLeaderboard(data);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
    
    // Refresh leaderboard every 30 seconds
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, [eventId]);

  if (loading) {
    return <div className="text-gray-400 text-sm">Loading leaderboard...</div>;
  }

  if (leaderboard.length === 0) {
    return <div className="text-gray-400 text-sm">No participants yet</div>;
  }

  return (
    <div className="space-y-3">
      {leaderboard.slice(0, 10).map((entry) => (
        <div
          key={entry.id}
          className="flex items-center justify-between bg-white/5 rounded-lg p-3"
        >
          <div className="flex items-center space-x-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              entry.rank === 1 
                ? 'bg-yellow-500 text-yellow-900'
                : entry.rank === 2
                ? 'bg-gray-400 text-gray-900'
                : entry.rank === 3
                ? 'bg-amber-600 text-amber-900'
                : 'bg-gray-600 text-white'
            }`}>
              {entry.rank}
            </div>
            <span className="text-white font-medium text-sm">
              {entry.user.username}
            </span>
          </div>
          <span className="text-blue-400 font-bold text-sm">
            {entry.totalScore}
          </span>
        </div>
      ))}
      {leaderboard.length > 10 && (
        <div className="text-center text-gray-400 text-xs pt-2">
          ... and {leaderboard.length - 10} more
        </div>
      )}
    </div>
  );
}
