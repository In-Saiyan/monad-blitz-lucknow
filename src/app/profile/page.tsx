'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ApiResponse, UserRole } from '@/types';
import OrganizerRequestForm from '@/components/OrganizerRequestForm';
import UserNFTCollection from '@/components/UserNFTCollection';
import { useValidatedSession } from '@/hooks/useValidatedSession';

// Extend Window interface for MetaMask
declare global {
  interface Window {
    ethereum?: any;
  }
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  walletAddress?: string | null;
  totalScore: number;
  createdAt: Date;
}

interface UserStats {
  totalEvents: number;
  totalSolves: number;
  averageRank: number;
}

export default function Profile() {
  const { data: session, status } = useValidatedSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedWallet, setEditedWallet] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchProfileData();
  }, [session, status, router]);

  const fetchProfileData = async () => {
    try {
      // Fetch user profile
      const profileResponse = await fetch('/api/user/profile');
      const profileData: ApiResponse<UserProfile> = await profileResponse.json();
      
      if (profileData.success && profileData.data) {
        setProfile(profileData.data);
        setEditedWallet(profileData.data.walletAddress || '');
      }

      // Fetch user stats and NFTs
      const statsResponse = await fetch('/api/user/stats');
      const statsData: ApiResponse<UserStats> = await statsResponse.json();
      
      if (statsData.success && statsData.data) {
        setStats(statsData.data);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateWalletAddress = async () => {
    // Validate wallet address format
    if (editedWallet && !editedWallet.match(/^0x[a-fA-F0-9]{40}$/)) {
      alert('Please enter a valid Ethereum wallet address (0x followed by 40 hexadecimal characters)');
      return;
    }

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: editedWallet || null
        }),
      });

      const data: ApiResponse<any> = await response.json();
      
      if (data.success) {
        setProfile(prev => prev ? { ...prev, walletAddress: editedWallet || null } : null);
        setEditMode(false);
        alert('Wallet address updated successfully!');
      } else {
        alert(data.error || 'Failed to update wallet address');
      }
    } catch (error) {
      console.error('Error updating wallet:', error);
      alert('An error occurred while updating wallet address');
    }
  };

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts[0]) {
          setEditedWallet(accounts[0]);
          
          // Check if user is on Monad testnet and offer to switch
          try {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            const monadChainId = '0x279F'; // 10143 in hex
            
            if (chainId !== monadChainId) {
              const switchToMonad = confirm(
                'Your wallet is not connected to Monad testnet. Would you like to add/switch to Monad testnet?'
              );
              
              if (switchToMonad) {
                await addMonadTestnetToWallet();
              }
            }
          } catch (chainError) {
            console.warn('Could not check chain ID:', chainError);
          }
        }
      } else {
        alert('Please install MetaMask to connect your wallet');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet');
    }
  };

  const addMonadTestnetToWallet = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x279F', // 10143 in hex
          chainName: 'Monad Testnet',
          nativeCurrency: {
            name: 'MON',
            symbol: 'MON',
            decimals: 18
          },
          rpcUrls: ['https://rpc.ankr.com/monad_testnet'],
          blockExplorerUrls: ['https://testnet.monadexplorer.com/']
        }]
      });
      alert('Monad testnet added to MetaMask successfully!');
    } catch (error) {
      console.error('Error adding Monad testnet:', error);
      alert('Failed to add Monad testnet to wallet');
    }
  };

  const makeOrganizer = async () => {
    try {
      const response = await fetch('/api/admin/make-organizer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: profile?.email
        }),
      });

      const data: ApiResponse<any> = await response.json();
      
      if (data.success) {
        alert('You are now an organizer! Please refresh the page.');
        fetchProfileData();
      } else {
        alert(data.error || 'Failed to become organizer');
      }
    } catch (error) {
      console.error('Error becoming organizer:', error);
      alert('An error occurred');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!session || !profile) {
    return null;
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
                All Events
              </Link>
              <span className="text-gray-300">Welcome, {session.user?.username}</span>
              <Link href="/api/auth/signout" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{profile.username}</h1>
              <p className="text-gray-300">{profile.email}</p>
              <div className="flex items-center mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  profile.role === 'ADMIN' ? 'bg-red-500/20 text-red-300' :
                  profile.role === 'ORGANIZER' ? 'bg-purple-500/20 text-purple-300' :
                  'bg-blue-500/20 text-blue-300'
                }`}>
                  {profile.role}
                </span>
              </div>
              {/* Quick Access for Organizers and Admins */}
              {(profile.role === 'ORGANIZER' || profile.role === 'ADMIN') && (
                <div className="flex gap-2 mt-4">
                  <Link
                    href="/organizer"
                    className="inline-flex items-center px-3 py-1.5 bg-purple-600/20 border border-purple-500/30 text-purple-300 rounded-lg text-sm font-medium hover:bg-purple-600/30 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Event Dashboard
                  </Link>
                  {profile.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="inline-flex items-center px-3 py-1.5 bg-red-600/20 border border-red-500/30 text-red-300 rounded-lg text-sm font-medium hover:bg-red-600/30 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                      </svg>
                      Admin Panel
                    </Link>
                  )}
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {profile.totalScore}
              </div>
              <div className="text-gray-300 text-sm">Total Points</div>
            </div>
          </div>

          {/* Wallet Address */}
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Wallet Address</h3>
            {editMode ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={editedWallet}
                    onChange={(e) => setEditedWallet(e.target.value)}
                    placeholder="0x... (for NFT rewards)"
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-blue-400 text-white placeholder-gray-400"
                  />
                  <button
                    onClick={connectWallet}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
                  >
                    🦊 Connect MetaMask
                  </button>
                </div>
                
                {/* Validation feedback */}
                {editedWallet && !editedWallet.match(/^0x[a-fA-F0-9]{40}$/) && (
                  <p className="text-red-400 text-sm">
                    ⚠️ Please enter a valid Ethereum address (0x followed by 40 hex characters)
                  </p>
                )}
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={updateWalletAddress}
                    disabled={!!editedWallet && !editedWallet.match(/^0x[a-fA-F0-9]{40}$/)}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setEditedWallet(profile?.walletAddress || '');
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-gray-300 font-mono break-all">
                  {profile.walletAddress || 'No wallet address set'}
                </span>
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  {profile.walletAddress ? 'Edit' : 'Add Wallet'}
                </button>
              </div>
            )}
            <div className="mt-3 space-y-2">
              <p className="text-gray-400 text-sm">
                Connect your wallet to receive NFT rewards automatically
              </p>
              {!profile.walletAddress && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                  <p className="text-yellow-300 text-sm">
                    💡 <strong>Tip:</strong> Connect your Monad testnet wallet to receive exclusive NFT rewards based on your CTF performance!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Organizer Request */}
          {profile.role === 'USER' && (
            <div className="border-t border-white/10 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Request Organizer Access</h3>
              <div className="bg-white/5 rounded-lg p-6">
                <OrganizerRequestForm onSuccess={() => {
                  alert('Request submitted successfully!');
                }} />
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-2">Events Participated</h3>
              <p className="text-3xl font-bold text-blue-400">{stats.totalEvents}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-2">Total Solves</h3>
              <p className="text-3xl font-bold text-green-400">{stats.totalSolves}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-2">Average Rank</h3>
              <p className="text-3xl font-bold text-yellow-400">#{stats.averageRank || 'N/A'}</p>
            </div>
          </div>
        )}

        {/* NFT Collection */}
        <UserNFTCollection />
      </div>
    </div>
  );
}
