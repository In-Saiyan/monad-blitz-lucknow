'use client';

import { useState, useEffect } from 'react';

interface MonadNetworkInfoProps {
  className?: string;
}

export default function MonadNetworkInfo({ className = '' }: MonadNetworkInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentNetwork, setCurrentNetwork] = useState<string>('');
  const [isConnectedToMonad, setIsConnectedToMonad] = useState(false);

  // Check current network on component mount
  useEffect(() => {
    checkCurrentNetwork();
  }, []);

  const checkCurrentNetwork = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const monadChainId = '0x279F'; // 10143 in hex
        
        setIsConnectedToMonad(chainId === monadChainId);
        
        // Convert chainId to decimal for display
        const chainDecimal = parseInt(chainId, 16);
        setCurrentNetwork(`Chain ID: ${chainDecimal}`);
      }
    } catch (error) {
      console.error('Error checking network:', error);
    }
  };

  const addMonadToWallet = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        alert('Please install MetaMask first');
        return;
      }

      // First try to switch to the network if it already exists
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x279F' }],
        });
        alert('Switched to Monad testnet successfully!');
        return;
      } catch (switchError: any) {
        // If the network doesn't exist (error code 4902), add it
        if (switchError.code === 4902) {
          console.log('Network not found, adding Monad testnet...');
        } else {
          throw switchError;
        }
      }

      // Add the network
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
    } catch (error: any) {
      console.error('Error adding Monad testnet:', error);
      
      let errorMessage = 'Failed to add Monad testnet to wallet';
      
      if (error.code === 4001) {
        errorMessage = 'User rejected the request to add Monad testnet';
      } else if (error.code === -32602) {
        errorMessage = 'Invalid parameters for adding network';
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      alert(errorMessage);
    }
  };

  return (
    <div className={`bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isConnectedToMonad ? 'bg-green-600' : 'bg-purple-600'
          }`}>
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Monad Testnet</h3>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-600">Chain ID: 10143</p>
              {isConnectedToMonad ? (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Connected</span>
              ) : (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{currentNetwork || 'Not connected'}</span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-purple-600 hover:text-purple-800 text-sm font-medium"
        >
          {isExpanded ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded border">
              <h4 className="font-medium text-gray-800 mb-1">RPC URL</h4>
              <code className="text-xs text-gray-600 break-all">
                https://rpc.ankr.com/monad_testnet
              </code>
            </div>
            <div className="bg-white p-3 rounded border">
              <h4 className="font-medium text-gray-800 mb-1">Explorer</h4>
              <a 
                href="https://testnet.monadexplorer.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline break-all"
              >
                https://testnet.monadexplorer.com/
              </a>
            </div>
          </div>
          
          <div className="bg-white p-3 rounded border">
            <h4 className="font-medium text-gray-800 mb-1">CTNFT Contract</h4>
            <a 
              href="https://testnet.monadexplorer.com/address/0xFC923f174c476c8900C634dDCB8cE2e955D9701f" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline break-all"
            >
              0xFC923f174c476c8900C634dDCB8cE2e955D9701f
            </a>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={addMonadToWallet}
              className={`flex-1 px-4 py-2 rounded transition-colors text-sm font-medium ${
                isConnectedToMonad 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {isConnectedToMonad ? 'Switch to Monad' : 'Add to MetaMask'}
            </button>
            <button
              onClick={checkCurrentNetwork}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              Check Network
            </button>
            <a
              href="https://testnet.monadexplorer.com/faucet"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-sm font-medium text-center"
            >
              Get Test MON
            </a>
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            <strong>Note:</strong> Make sure you're connected to Monad testnet to participate in events and receive NFT rewards.
          </div>
        </div>
      )}
    </div>
  );
}
