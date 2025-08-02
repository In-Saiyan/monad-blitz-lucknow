'use client';

import { useState, useEffect } from 'react';
import { NFTMetadata, NFTTier } from '@/types';
import Link from 'next/link';

interface UserNFTCollectionProps {
  userId?: string; // If provided, shows NFTs for a specific user (for admin/organizer view)
  compact?: boolean; // If true, shows a more compact view
  maxDisplay?: number; // Maximum number of NFTs to display
}

interface NFTData {
  blockchainConnected: boolean;
  message?: string;
  contractAddress?: string;
  nftsEarned: NFTMetadata[];
  totalNFTs: number;
  walletAddress?: string;
  configStatus?: {
    providerUrl: string;
    privateKey: string;
    contractAddress: string;
  };
}

const tierColors = {
  [NFTTier.DIAMOND]: 'bg-gradient-to-r from-blue-400 to-purple-500',
  [NFTTier.PLATINUM]: 'bg-gradient-to-r from-gray-300 to-gray-400',
  [NFTTier.GOLD]: 'bg-gradient-to-r from-yellow-400 to-yellow-500',
  [NFTTier.SILVER]: 'bg-gradient-to-r from-gray-400 to-gray-500',
  [NFTTier.BRONZE]: 'bg-gradient-to-r from-yellow-600 to-yellow-700'
};

const tierIcons = {
  [NFTTier.DIAMOND]: '💎',
  [NFTTier.PLATINUM]: '🏆',
  [NFTTier.GOLD]: '🥇',
  [NFTTier.SILVER]: '🥈',
  [NFTTier.BRONZE]: '🥉'
};

const tierLabels = {
  [NFTTier.DIAMOND]: 'Diamond (Top 1%)',
  [NFTTier.PLATINUM]: 'Platinum (Top 5%)',
  [NFTTier.GOLD]: 'Gold (Top 10%)',
  [NFTTier.SILVER]: 'Silver (Top 20%)',
  [NFTTier.BRONZE]: 'Bronze (Participation)'
};

const tierBadgeColors = {
  [NFTTier.DIAMOND]: 'bg-blue-500/20 text-blue-300',
  [NFTTier.PLATINUM]: 'bg-gray-300/20 text-gray-300',
  [NFTTier.GOLD]: 'bg-yellow-400/20 text-yellow-300',
  [NFTTier.SILVER]: 'bg-gray-400/20 text-gray-300',
  [NFTTier.BRONZE]: 'bg-yellow-600/20 text-yellow-300'
};

export default function UserNFTCollection({ 
  userId, 
  compact = false, 
  maxDisplay 
}: UserNFTCollectionProps) {
  const [nftData, setNftData] = useState<NFTData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNFTs();
  }, [userId]);

  const fetchNFTs = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = userId ? `/api/user/nfts?userId=${userId}` : '/api/user/nfts';
      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setNftData(result.data);
      } else {
        setError(result.error || 'Failed to fetch NFTs');
      }
    } catch (err) {
      console.error('Error fetching NFTs:', err);
      setError('Failed to load NFT data');
    } finally {
      setLoading(false);
    }
  };

  const displayNFTs = maxDisplay 
    ? nftData?.nftsEarned.slice(0, maxDisplay) 
    : nftData?.nftsEarned;

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/5 rounded-lg p-6">
                <div className="h-32 bg-gray-300 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6">NFT Collection</h2>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-300">{error}</p>
          <button
            onClick={fetchNFTs}
            className="mt-2 text-blue-400 hover:text-blue-300 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">NFT Collection</h2>
        {nftData?.totalNFTs && nftData.totalNFTs > 0 && (
          <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
            {nftData.totalNFTs} NFT{nftData.totalNFTs > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Connection Status */}
      {nftData?.message && (
        <div className={`mb-6 p-4 rounded-lg border ${
          nftData.blockchainConnected 
            ? 'bg-green-500/10 border-green-500/20 text-green-300'
            : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300'
        }`}>
          <p className="text-sm">{nftData.message}</p>
          {nftData.configStatus && !nftData.blockchainConnected && (
            <details className="mt-2 text-xs">
              <summary className="cursor-pointer">Configuration Status</summary>
              <ul className="mt-2 space-y-1">
                <li>Provider URL: {nftData.configStatus.providerUrl}</li>
                <li>Private Key: {nftData.configStatus.privateKey}</li>
                <li>Contract Address: {nftData.configStatus.contractAddress}</li>
              </ul>
            </details>
          )}
        </div>
      )}

      {/* NFT Grid */}
      {displayNFTs && displayNFTs.length > 0 ? (
        <>
          <div className={`grid gap-6 ${
            compact 
              ? 'grid-cols-1 sm:grid-cols-2' 
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {displayNFTs.map((nft, index) => {
              const tier = nft.tier as NFTTier;
              const tierKey = Object.values(NFTTier).includes(tier) ? tier : NFTTier.BRONZE;
              
              return (
                <div 
                  key={nft.tokenId || index} 
                  className="bg-white/5 rounded-lg p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105"
                >
                  {/* NFT Visual */}
                  <div className={`w-full ${compact ? 'h-24' : 'h-32'} rounded-lg mb-4 flex items-center justify-center ${
                    compact ? 'text-2xl' : 'text-4xl'
                  } ${tierColors[tierKey] || tierColors[NFTTier.BRONZE]}`}>
                    {tierIcons[tierKey] || '🏆'}
                  </div>

                  {/* NFT Info */}
                  <h3 className={`font-semibold text-white mb-2 ${
                    compact ? 'text-base' : 'text-lg'
                  }`}>
                    {nft.eventName}
                  </h3>

                  <div className={`space-y-1 ${compact ? 'text-xs' : 'text-sm'}`}>
                    {/* Tier Badge */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Tier:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        tierBadgeColors[tierKey] || tierBadgeColors[NFTTier.BRONZE]
                      }`}>
                        {tierKey}
                      </span>
                    </div>

                    {/* Rank and Score */}
                    <div className="flex justify-between">
                      <span className="text-gray-300">Rank:</span>
                      <span className="text-white font-medium">#{nft.rank}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-300">Score:</span>
                      <span className="text-white font-medium">
                        {nft.score?.toLocaleString()}
                      </span>
                    </div>

                    {!compact && (
                      <div className="flex justify-between">
                        <span className="text-gray-300">Minted:</span>
                        <span className="text-white font-medium">
                          {new Date(nft.mintTimestamp).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Explorer Link */}
                  {!compact && nft.tokenId && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <a
                        href={`https://testnet.monadexplorer.com/token/${process.env.NEXT_PUBLIC_CTNFT_CONTRACT_ADDRESS || nftData?.contractAddress || ''}/${nft.tokenId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium inline-flex items-center"
                      >
                        View on Explorer
                        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* View More Link */}
          {maxDisplay && nftData && nftData.totalNFTs > maxDisplay && (
            <div className="text-center mt-6">
              <p className="text-gray-400 text-sm">
                Showing {maxDisplay} of {nftData.totalNFTs} NFTs
              </p>
              <Link
                href="/profile"
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                View All NFTs →
              </Link>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-semibold text-white mb-2">No NFTs Yet</h3>
          <p className="text-gray-400 mb-6">
            Participate in CTF events and earn your place on the leaderboard to receive exclusive NFT rewards!
          </p>
          <div className="space-y-2">
            <p className="text-gray-500 text-sm">
              💎 Top 1% → Diamond • 🏆 Top 5% → Platinum • 🥇 Top 10% → Gold
            </p>
            <p className="text-gray-500 text-sm">
              🥈 Top 20% → Silver • 🥉 Everyone → Bronze
            </p>
          </div>
          <div className="mt-6">
            <Link
              href="/dashboard"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium inline-block"
            >
              Join an Event
            </Link>
          </div>
        </div>
      )}

      {/* Wallet Setup Reminder */}
      {!nftData?.walletAddress && (
        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-yellow-300 text-sm">
            💡 <strong>Tip:</strong> Set your wallet address in your profile to automatically receive NFT rewards!
          </p>
        </div>
      )}
    </div>
  );
}
