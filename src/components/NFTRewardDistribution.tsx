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
  [NFTTier.DIAMOND]: 'bg-gradient-to-r from-blue-400 to-purple-500 text-white',
  [NFTTier.PLATINUM]: 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800',
  [NFTTier.GOLD]: 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900',
  [NFTTier.SILVER]: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white',
  [NFTTier.BRONZE]: 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white'
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
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          🏆 NFT Rewards
        </h3>
        <p className="text-blue-600">
          NFT rewards will be available for distribution after the event ends.
        </p>
      </div>
    );
  }

  if (!isOrganizer) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          🏆 NFT Rewards
        </h3>
        <p className="text-gray-600">
          Only event organizers can distribute NFT rewards.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        🏆 NFT Reward Distribution
      </h3>

      {preview && (
        <>
          {/* Tier Distribution Summary */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3">Tier Distribution</h4>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
              {Object.entries(preview.tierDistribution).map(([tier, data]) => (
                <div
                  key={tier}
                  className={`rounded-lg p-3 text-center ${tierColors[tier as NFTTier]}`}
                >
                  <div className="text-sm font-medium">
                    {tierLabels[tier as NFTTier]}
                  </div>
                  <div className="text-lg font-bold">
                    {data.count}
                  </div>
                  <div className="text-xs opacity-90">
                    {data.percentage.toFixed(1)}%
                  </div>
                  {data.rankRange && (
                    <div className="text-xs opacity-75">
                      {data.rankRange}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-gray-600 text-sm">
              Total participants eligible for NFTs: <strong>{preview.totalParticipants}</strong>
            </p>
          </div>

          {/* Rankings Toggle */}
          <div className="mb-4">
            <button
              onClick={() => setShowRankings(!showRankings)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {showRankings ? '🔽 Hide Rankings' : '▶️ Show Rankings'}
            </button>
          </div>

          {/* Rankings Table */}
          {showRankings && (
            <div className="mb-6 overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Rank</th>
                    <th className="px-4 py-2 text-left">Username</th>
                    <th className="px-4 py-2 text-left">Score</th>
                    <th className="px-4 py-2 text-left">NFT Tier</th>
                    <th className="px-4 py-2 text-left">Wallet</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.rankings.slice(0, 20).map((participant) => (
                    <tr key={participant.userId} className="border-t">
                      <td className="px-4 py-2 font-mono">#{participant.rank}</td>
                      <td className="px-4 py-2 font-medium">{participant.username}</td>
                      <td className="px-4 py-2">{participant.totalScore.toLocaleString()}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${tierColors[participant.tier]}`}>
                          {participant.tier}
                        </span>
                      </td>
                      <td className="px-4 py-2 font-mono text-sm">
                        {participant.walletAddress.slice(0, 6)}...{participant.walletAddress.slice(-4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.rankings.length > 20 && (
                <p className="text-gray-500 text-sm mt-2">
                  Showing top 20 participants. Total: {preview.rankings.length}
                </p>
              )}
            </div>
          )}

          {/* Distribution Button */}
          <div className="border-t pt-4">
            <button
              onClick={distributeNFTs}
              disabled={distributing || preview.totalParticipants === 0}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                distributing || preview.totalParticipants === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
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
        <div className={`mt-4 p-4 rounded-lg ${
          distributionResult.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className={`font-medium ${
            distributionResult.success ? 'text-green-800' : 'text-red-800'
          }`}>
            {distributionResult.success ? '✅ Success!' : '❌ Error'}
          </div>
          <p className={`mt-1 ${
            distributionResult.success ? 'text-green-700' : 'text-red-700'
          }`}>
            {distributionResult.message}
          </p>
          
          {distributionResult.errors && distributionResult.errors.length > 0 && (
            <div className="mt-2">
              <details className="text-red-600">
                <summary className="cursor-pointer">View errors</summary>
                <ul className="mt-2 text-sm list-disc list-inside">
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
