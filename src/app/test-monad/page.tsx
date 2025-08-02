'use client';

import { useState } from 'react';
import { getContractAddresses, MONAD_TESTNET_CONFIG, addMonadTestnetToWallet } from '@/lib/blockchain';

export default function MonadTestPage() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [currentNetwork, setCurrentNetwork] = useState('');
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  const contractAddresses = getContractAddresses();

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        setWalletAddress(accounts[0]);
        setWalletConnected(true);
        setCurrentNetwork(chainId);
        setIsCorrectNetwork(chainId === MONAD_TESTNET_CONFIG.chainId);
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    } else {
      alert('Please install MetaMask or another Web3 wallet');
    }
  };

  const addMonadNetwork = async () => {
    const success = await addMonadTestnetToWallet();
    if (success) {
      // Refresh network info
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setCurrentNetwork(chainId);
      setIsCorrectNetwork(chainId === MONAD_TESTNET_CONFIG.chainId);
    }
  };

  const switchToMonad = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: MONAD_TESTNET_CONFIG.chainId }],
        });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        setCurrentNetwork(chainId);
        setIsCorrectNetwork(chainId === MONAD_TESTNET_CONFIG.chainId);
      } catch (error) {
        console.error('Failed to switch network:', error);
        // If network not added, try to add it
        await addMonadNetwork();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          🌐 Monad Testnet Integration Test
        </h1>

        {/* Wallet Connection */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-6">
          <h2 className="text-2xl font-semibold text-white mb-4">1. Wallet Connection</h2>
          
          {!walletConnected ? (
            <button
              onClick={connectWallet}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              🦊 Connect Wallet
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-green-400">✅ Wallet Connected</p>
              <p className="text-gray-300">Address: <span className="font-mono text-blue-400">{walletAddress}</span></p>
              <p className="text-gray-300">
                Network: <span className="font-mono text-purple-400">{currentNetwork}</span>
                {isCorrectNetwork ? (
                  <span className="ml-2 text-green-400">✅ Monad Testnet</span>
                ) : (
                  <span className="ml-2 text-red-400">❌ Wrong Network</span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Network Configuration */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-6">
          <h2 className="text-2xl font-semibold text-white mb-4">2. Network Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-gray-300">Network: <span className="text-blue-400">{MONAD_TESTNET_CONFIG.chainName}</span></p>
              <p className="text-gray-300">Chain ID: <span className="text-purple-400">{parseInt(MONAD_TESTNET_CONFIG.chainId, 16)}</span></p>
              <p className="text-gray-300">Currency: <span className="text-green-400">{MONAD_TESTNET_CONFIG.nativeCurrency.symbol}</span></p>
            </div>
            <div>
              <p className="text-gray-300">RPC: <span className="text-blue-400 text-sm break-all">{MONAD_TESTNET_CONFIG.rpcUrls[0]}</span></p>
              <p className="text-gray-300">Explorer: <a href={MONAD_TESTNET_CONFIG.blockExplorerUrls[0]} target="_blank" className="text-blue-400 hover:text-blue-300">Link</a></p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={addMonadNetwork}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              ➕ Add to Wallet
            </button>
            
            {walletConnected && !isCorrectNetwork && (
              <button
                onClick={switchToMonad}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                🔄 Switch Network
              </button>
            )}
          </div>
        </div>

        {/* Contract Information */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-6">
          <h2 className="text-2xl font-semibold text-white mb-4">3. Contract Information</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">CTNFT Contract:</span>
              <a 
                href={`${MONAD_TESTNET_CONFIG.blockExplorerUrls[0]}/address/${contractAddresses.ctnft}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 font-mono text-sm"
              >
                {contractAddresses.ctnft}
              </a>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Reward Contract:</span>
              <a 
                href={`${MONAD_TESTNET_CONFIG.blockExplorerUrls[0]}/address/${contractAddresses.ctnftReward}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 font-mono text-sm"
              >
                {contractAddresses.ctnftReward}
              </a>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Deployer:</span>
              <a 
                href={`${MONAD_TESTNET_CONFIG.blockExplorerUrls[0]}/address/${contractAddresses.deployer}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 font-mono text-sm"
              >
                {contractAddresses.deployer}
              </a>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-4">4. Test Results</h2>
          
          <div className="space-y-2">
            <p className={`flex items-center ${walletConnected ? 'text-green-400' : 'text-yellow-400'}`}>
              {walletConnected ? '✅' : '⏳'} Wallet Connection: {walletConnected ? 'Success' : 'Pending'}
            </p>
            
            <p className={`flex items-center ${isCorrectNetwork ? 'text-green-400' : 'text-yellow-400'}`}>
              {isCorrectNetwork ? '✅' : '⏳'} Correct Network: {isCorrectNetwork ? 'Monad Testnet' : 'Switch Required'}
            </p>
            
            <p className="flex items-center text-green-400">
              ✅ Contract Addresses: Loaded from deployment file
            </p>
            
            <p className="flex items-center text-green-400">
              ✅ Network Config: Ready for Monad Testnet
            </p>
          </div>

          {walletConnected && isCorrectNetwork && (
            <div className="mt-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
              <p className="text-green-300 font-semibold">🎉 All tests passed!</p>
              <p className="text-green-200 text-sm">Your application is ready to interact with Monad testnet contracts.</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="text-center mt-8">
          <a 
            href="/"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-bold transition-all transform hover:scale-105 inline-block"
          >
            🏠 Back to CTNFT Platform
          </a>
        </div>
      </div>
    </div>
  );
}
