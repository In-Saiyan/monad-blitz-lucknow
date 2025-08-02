'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ApiResponse, UserRole, NFTMetadata } from '@/types';
import OrganizerRequestForm from '@/components/OrganizerRequestForm';
import { useValidatedSession } from '@/hooks/useValidatedSession';
import MatrixBackground from '@/components/ui/effects/MatrixBackground';
import { FaUserShield, FaUserCog, FaTrophy, FaCalendarCheck, FaTasks, FaChartBar, FaWallet, FaEdit, FaSave, FaTimes, FaPlusSquare, FaUserSecret } from 'react-icons/fa';

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
  nftsEarned: NFTMetadata[];
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
      const profileResponse = await fetch('/api/user/profile');
      const profileData: ApiResponse<UserProfile> = await profileResponse.json();
      
      if (profileData.success && profileData.data) {
        setProfile(profileData.data);
        setEditedWallet(profileData.data.walletAddress || '');
      }

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
      } else {
        alert(data.error || 'Failed to update wallet address');
      }
    } catch (error) {
      console.error('Error updating wallet:', error);
      alert('An error occurred while updating wallet address');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="relative min-h-screen bg-background flex items-center justify-center">
        <MatrixBackground />
        <div className="relative z-10 flex flex-col items-center gap-4 text-primary font-mono">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-accent"></div>
          <p>Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (!session || !profile) {
    return null;
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
                <Link href="/api/auth/signout" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Sign Out
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-background/50 backdrop-blur-sm rounded-xl p-8 border border-primary/20 mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold font-mono text-primary mb-2">{profile.username}</h1>
                <p className="text-muted-foreground">{profile.email}</p>
                <div className="flex items-center mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                    profile.role === 'ADMIN' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                    profile.role === 'ORGANIZER' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                    'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  }`}>
                    {profile.role}
                  </span>
                </div>
                {(profile.role === 'ORGANIZER' || profile.role === 'ADMIN') && (
                  <div className="flex gap-2 mt-4">
                    <Link href="/organizer" className="inline-flex items-center px-3 py-1.5 bg-purple-600/20 border border-purple-500/30 text-purple-300 rounded-lg text-sm font-medium hover:bg-purple-600/30 transition-colors">
                      <FaUserCog className="w-4 h-4 mr-1.5" /> Event Dashboard
                    </Link>
                    {profile.role === 'ADMIN' && (
                      <Link href="/admin" className="inline-flex items-center px-3 py-1.5 bg-red-600/20 border border-red-500/30 text-red-300 rounded-lg text-sm font-medium hover:bg-red-600/30 transition-colors">
                        <FaUserShield className="w-4 h-4 mr-1.5" /> Admin Panel
                      </Link>
                    )}
                  </div>
                )}
              </div>
              <div className="text-right mt-4 sm:mt-0">
                <div className="text-4xl font-bold font-mono text-accent">
                  {profile.totalScore}
                </div>
                <div className="text-muted-foreground text-sm">Total Points</div>
              </div>
            </div>

            <div className="border-t border-primary/10 pt-6">
              <h3 className="text-lg font-semibold font-mono text-primary mb-4 flex items-center gap-2"><FaWallet /> Wallet Address</h3>
              {editMode ? (
                <div className="flex items-center space-x-3">
                  <input type="text" value={editedWallet} onChange={(e) => setEditedWallet(e.target.value)} placeholder="0x... (for NFT rewards)" className="flex-1 px-4 py-2 bg-background/70 border border-primary/20 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
                  <button onClick={updateWalletAddress} className="bg-primary hover:bg-primary/90 text-primary-foreground p-2 rounded-lg text-sm font-medium"><FaSave /></button>
                  <button onClick={() => setEditMode(false)} className="bg-muted hover:bg-muted/80 text-muted-foreground p-2 rounded-lg text-sm font-medium"><FaTimes /></button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-mono text-sm">
                    {profile.walletAddress || 'No wallet address set'}
                  </span>
                  <button onClick={() => setEditMode(true)} className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                    <FaEdit /> Edit
                  </button>
                </div>
              )}
              <p className="text-muted-foreground/70 text-xs mt-2">
                Connect your wallet to receive NFT rewards automatically.
              </p>
            </div>

            {profile.role === 'USER' && (
              <div className="border-t border-primary/10 pt-6 mt-6">
                <h3 className="text-lg font-semibold font-mono text-primary mb-4 flex items-center gap-2"><FaUserSecret /> Request Organizer Access</h3>
                <div className="bg-background/70 rounded-lg p-6 border border-primary/10">
                  <OrganizerRequestForm onSuccess={() => {
                    alert('Request submitted successfully!');
                  }} />
                </div>
              </div>
            )}
          </div>

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard icon={<FaCalendarCheck />} title="Events Participated" value={stats.totalEvents} />
              <StatCard icon={<FaTasks />} title="Total Solves" value={stats.totalSolves} />
              <StatCard icon={<FaChartBar />} title="Average Rank" value={`#${stats.averageRank || 'N/A'}`} />
            </div>
          )}

          <div className="bg-background/50 backdrop-blur-sm rounded-xl p-8 border border-primary/20">
            <h2 className="text-2xl font-bold font-mono text-primary mb-6 flex items-center gap-3"><FaTrophy /> NFT Collection</h2>
            {stats?.nftsEarned && stats.nftsEarned.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.nftsEarned.map((nft, index) => (
                  <NftCard key={index} nft={nft} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg mb-4">No NFTs collected yet.</p>
                <Link href="/events" className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition-transform transform hover:scale-105 inline-block">
                  Find an Event
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

const StatCard = ({ icon, title, value }: { icon: React.ReactNode, title: string, value: string | number }) => (
  <div className="bg-background/50 backdrop-blur-sm rounded-xl p-6 border border-primary/20 flex items-center gap-4">
    <div className="p-3 bg-primary/10 rounded-lg text-accent text-2xl">{icon}</div>
    <div>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold font-mono text-foreground">{value}</p>
    </div>
  </div>
);

const NftCard = ({ nft }: { nft: NFTMetadata }) => {
  const tierStyles = {
    LEGENDARY: 'from-yellow-500 to-orange-500 text-yellow-200 border-yellow-400',
    EPIC: 'from-purple-500 to-pink-500 text-purple-200 border-purple-400',
    RARE: 'from-blue-500 to-cyan-500 text-blue-200 border-blue-400',
    COMMON: 'from-gray-600 to-gray-700 text-gray-200 border-gray-500',
  };
  const tier = nft.tier as keyof typeof tierStyles;

  return (
    <div className={`bg-background/70 rounded-lg p-4 border border-primary/10 overflow-hidden`}>
      <div className={`w-full h-32 rounded-lg mb-4 flex items-center justify-center text-5xl bg-gradient-to-br ${tierStyles[tier]}`}>
        🏆
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1 truncate">{nft.eventName}</h3>
      <div className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold border ${tierStyles[tier]}`}>
        {nft.tier}
      </div>
      <div className="space-y-1 text-sm mt-3">
        <p className="text-muted-foreground">Rank: <span className="text-accent font-mono">#{nft.rank}</span></p>
        <p className="text-muted-foreground">Score: <span className="text-primary font-mono">{nft.score} pts</span></p>
        <p className="text-muted-foreground text-xs">Minted: <span className="text-foreground/80 font-mono">
          {new Date(nft.mintTimestamp).toLocaleDateString()}
        </span></p>
      </div>
    </div>
  );
};
