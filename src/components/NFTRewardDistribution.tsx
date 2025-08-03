'use client';

import { useState, useEffect } from 'react';
import { NFTTier } from '@/types';

interface NFTRewardDistributionProps {
  eventId: string;
  eventName: string;
  eventEnded: boolean;
  isOrganizer: boolean;
}

interface RewardPreview {
  eventName: string;
  totalParticipants: number;
  rankings: Array<{
    userId: string;
    username: string;
    walletAddress: string;
    totalScore: number;
    rank: number;
    tier: NFTTier;
  }>;
  tierDistribution: Record<NFTTier, { 
    count: number; 
    percentage: number; 
    rankRange: string; 
  }>;
}

interface DistributionResult {
  success: boolean;
  message: string;
  totalDistributed?: number;
  errors?: string[];
}

const tierColors = {
  [NFTTier.DIAMOND]: 'bg-gradient-to-r from-blue-400/20 to-purple-500/20 text-blue-300 border border-blue-400/30',
  [NFTTier.PLATINUM]: 'bg-gradient-to-r from-gray-300/20 to-gray-400/20 text-gray-300 border border-gray-400/30',
  [NFTTier.GOLD]: 'bg-gradient-to-r from-yellow-400/20 to-yellow-500/20 text-yellow-300 border border-yellow-400/30',
  [NFTTier.SILVER]: 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 text-gray-300 border border-gray-400/30',
  [NFTTier.BRONZE]: 'bg-gradient-to-r from-yellow-600/20 to-yellow-700/20 text-yellow-400 border border-yellow-600/30'
};

const tierLabels = {
  [NFTTier.DIAMOND]: 'Diamond (Top 1%)',
  [NFTTier.PLATINUM]: 'Platinum (Top 5%)',
  [NFTTier.GOLD]: 'Gold (Top 10%)',
  [NFTTier.SILVER]: 'Silver (Top 20%)',
  [NFTTier.BRONZE]: 'Bronze (Participation)'
};

export default function NFTRewardDistribution({ 
  eventId, 
  eventName, 
  eventEnded, 
  isOrganizer 
}: NFTRewardDistributionProps) {
  const [preview, setPreview] = useState<RewardPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [distributing, setDistributing] = useState(false);
  const [distributionResult, setDistributionResult] = useState<DistributionResult | null>(null);
  const [showRankings, setShowRankings] = useState(false);

  useEffect(() => {
    if (eventEnded && isOrganizer) {
      loadPreview();
    }
  }, [eventId, eventEnded, isOrganizer]);

  const loadPreview = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/events/${eventId}/nft-rewards`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Expected JSON but got: ${text.substring(0, 100)}...`);
      }
      
      const data = await response.json();

      if (data.success) {
        setPreview(data.preview);
      } else {
        console.error('Failed to load NFT preview:', data.error);
      }
    } catch (error) {
      console.error('Error loading NFT preview:', error);
    } finally {
      setLoading(false);
    }
  };

  const distributeNFTs = async () => {
    try {
      setDistributing(true);
      setDistributionResult(null);

      const response = await fetch(`/api/events/${eventId}/nft-rewards`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Expected JSON but got: ${text.substring(0, 100)}...`);
      }

      const result = await response.json();
      setDistributionResult(result);

      if (result.success) {
        // Refresh preview to show updated status
        await loadPreview();
      }
    } catch (error) {
      console.error('Error distributing NFTs:', error);
      setDistributionResult({
        success: false,
        message: `Failed to distribute NFTs: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`
      });
    } finally {
      setDistributing(false);
    }
  };

  if (!eventEnded) {
    return (
      <div className="bg-background/80 backdrop-blur-sm border border-primary/20 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-primary mb-2">
          🏆 NFT Rewards
        </h3>
        <p className="text-foreground/70">
          NFT rewards will be available for distribution after the event ends.
        </p>
      </div>
    );
  }

  if (!isOrganizer) {
    return (
      <div className="bg-background/80 backdrop-blur-sm border border-primary/20 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-primary mb-2">
          🏆 NFT Rewards
        </h3>
        <p className="text-foreground/70">
          Only event organizers can distribute NFT rewards.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-background/80 backdrop-blur-sm border border-primary/20 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-primary/20 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-primary/10 rounded w-full"></div>
            <div className="h-4 bg-primary/10 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background/80 backdrop-blur-sm border border-primary/20 rounded-lg p-6">
      <h3 className="text-xl font-bold text-primary mb-4">
        🏆 NFT Reward Distribution
      </h3>

      {preview && (
        <>
          {/* Tier Distribution Summary */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-primary mb-3">Tier Distribution</h4>
            <div className="space-y-2 mb-4">
              {Object.entries(preview.tierDistribution).map(([tier, data]) => (
                <div
                  key={tier}
                  className={`rounded-lg p-3 flex justify-between items-center ${tierColors[tier as NFTTier]}`}
                >
                  <div className="flex flex-col">
                    <div className="text-sm font-medium">
                      {tierLabels[tier as NFTTier]}
                    </div>
                    {data.rankRange && (
                      <div className="text-xs opacity-75">
                        {data.rankRange}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {data.count}
                    </div>
                    <div className="text-xs opacity-90">
                      {data.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-foreground/70 text-sm">
              Total participants eligible for NFTs: <strong className="text-accent">{preview.totalParticipants}</strong>
            </p>
          </div>

          {/* Rankings Toggle */}
          <div className="mb-4">
            <button
              onClick={() => setShowRankings(!showRankings)}
              className="text-accent hover:text-primary font-medium transition-colors"
            >
              {showRankings ? '🔽 Hide Rankings' : '▶️ Show Rankings'}
            </button>
          </div>

          {/* Rankings Table */}
          {showRankings && (
            <div className="mb-6 overflow-x-auto">
              <table className="min-w-full border border-primary/20 rounded-lg bg-background/50">
                <thead className="bg-primary/10">
                  <tr>
                    <th className="px-4 py-2 text-left text-primary">Rank</th>
                    <th className="px-4 py-2 text-left text-primary">Username</th>
                    <th className="px-4 py-2 text-left text-primary">Score</th>
                    <th className="px-4 py-2 text-left text-primary">NFT Tier</th>
                    <th className="px-4 py-2 text-left text-primary">Wallet</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.rankings.slice(0, 20).map((participant) => (
                    <tr key={participant.userId} className="border-t border-primary/10">
                      <td className="px-4 py-2 font-mono text-accent">#{participant.rank}</td>
                      <td className="px-4 py-2 font-medium text-foreground">{participant.username}</td>
                      <td className="px-4 py-2 text-foreground">{participant.totalScore.toLocaleString()}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${tierColors[participant.tier]}`}>
                          {participant.tier}
                        </span>
                      </td>
                      <td className="px-4 py-2 font-mono text-sm text-foreground/70">
                        {participant.walletAddress.slice(0, 6)}...{participant.walletAddress.slice(-4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.rankings.length > 20 && (
                <p className="text-foreground/50 text-sm mt-2">
                  Showing top 20 participants. Total: {preview.rankings.length}
                </p>
              )}
            </div>
          )}

          {/* Distribution Button */}
          <div className="border-t border-primary/20 pt-4">
            <button
              onClick={distributeNFTs}
              disabled={distributing || preview.totalParticipants === 0}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                distributing || preview.totalParticipants === 0
                  ? 'bg-primary/20 text-foreground/50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary to-accent text-background hover:shadow-lg hover:shadow-primary/25'
              }`}
            >
              {distributing 
                ? '🔄 Distributing NFTs...' 
                : `🎁 Distribute NFTs to ${preview.totalParticipants} Participants`
              }
            </button>
          </div>
        </>
      )}

      {/* Distribution Result */}
      {distributionResult && (
        <div className={`mt-4 p-4 rounded-lg border ${
          distributionResult.success 
            ? 'bg-green-500/10 border-green-500/30 text-green-300' 
            : 'bg-red-500/10 border-red-500/30 text-red-300'
        }`}>
          <div className="font-medium">
            {distributionResult.success ? '✅ Success!' : '❌ Error'}
          </div>
          <p className="mt-1 opacity-90">
            {distributionResult.message}
          </p>
          
          {distributionResult.errors && distributionResult.errors.length > 0 && (
            <div className="mt-2">
              <details className="text-red-300">
                <summary className="cursor-pointer">View errors</summary>
                <ul className="mt-2 text-sm list-disc list-inside opacity-80">
                  {distributionResult.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </details>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
