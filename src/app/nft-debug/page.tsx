'use client';

import { useState, useEffect } from 'react';

export default function NFTDebugPage() {
  const [debugData, setDebugData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchDebugData = async () => {
    setLoading(true);
    try {
      const [userResponse, nftResponse, profileResponse] = await Promise.all([
        fetch('/api/user/stats'),
        fetch('/api/user/nfts'),
        fetch('/api/user/profile')
      ]);

      const debugInfo = {
        timestamp: new Date().toISOString(),
        userStats: userResponse.ok ? await userResponse.json() : { error: await userResponse.text() },
        nfts: nftResponse.ok ? await nftResponse.json() : { error: await nftResponse.text() },
        profile: profileResponse.ok ? await profileResponse.json() : { error: await profileResponse.text() },
        walletStatus: {
          ethereum: typeof window !== 'undefined' ? typeof window.ethereum !== 'undefined' : false,
          accounts: null as any,
          chainId: null as any,
          error: null as any
        }
      };

      // Get wallet info if available
      if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          debugInfo.walletStatus.accounts = accounts;
          debugInfo.walletStatus.chainId = parseInt(chainId, 16);
        } catch (error) {
          debugInfo.walletStatus.error = String(error);
        }
      }

      setDebugData(debugInfo);
    } catch (error) {
      console.error('Debug fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebugData();
  }, []);

  const checkDatabaseNFTs = async () => {
    try {
      const response = await fetch('/api/debug/nfts');
      if (response.ok) {
        const data = await response.json();
        console.log('Database NFTs:', data);
        alert(`Found ${data.nfts?.length || 0} NFTs in database. Check console for details.`);
      } else {
        alert('Failed to fetch database NFTs');
      }
    } catch (error) {
      console.error('Error checking database NFTs:', error);
      alert('Error checking database NFTs');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">NFT Debug Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <button
          onClick={fetchDebugData}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh Debug Data'}
        </button>
        
        <button
          onClick={checkDatabaseNFTs}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
        >
          Check Database NFTs
        </button>
      </div>

      {debugData && (
        <div className="space-y-6">
          {/* User Profile */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">User Profile</h2>
            <div className="bg-gray-100 p-4 rounded overflow-auto">
              <pre className="text-sm">{JSON.stringify(debugData.profile, null, 2)}</pre>
            </div>
          </div>

          {/* Wallet Status */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Wallet Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium">MetaMask Available</h3>
                <p className={debugData.walletStatus.ethereum ? 'text-green-600' : 'text-red-600'}>
                  {debugData.walletStatus.ethereum ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <h3 className="font-medium">Connected Accounts</h3>
                <p className="text-sm">{debugData.walletStatus.accounts?.length || 0} accounts</p>
              </div>
              <div>
                <h3 className="font-medium">Chain ID</h3>
                <p className={debugData.walletStatus.chainId === 10143 ? 'text-green-600' : 'text-orange-600'}>
                  {debugData.walletStatus.chainId || 'Not connected'}
                  {debugData.walletStatus.chainId === 10143 && ' (Monad Testnet)'}
                </p>
              </div>
              <div>
                <h3 className="font-medium">Profile Wallet</h3>
                <p className="text-sm break-all">
                  {debugData.profile?.user?.walletAddress || 'Not set'}
                </p>
              </div>
            </div>
            {debugData.walletStatus.error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
                <strong>Wallet Error:</strong> {debugData.walletStatus.error}
              </div>
            )}
          </div>

          {/* NFT Collection */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">NFT Collection</h2>
            <div className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
              <pre className="text-sm">{JSON.stringify(debugData.nfts, null, 2)}</pre>
            </div>
          </div>

          {/* User Stats */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">User Stats</h2>
            <div className="bg-gray-100 p-4 rounded overflow-auto">
              <pre className="text-sm">{JSON.stringify(debugData.userStats, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}

      {!debugData && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">Click "Refresh Debug Data" to load information</p>
        </div>
      )}
    </div>
  );
}
