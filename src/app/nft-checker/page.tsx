'use client';

import { useState } from 'react';
import { ethers } from 'ethers';

// Extend window interface for MetaMask
declare global {
  interface Window {
    ethereum?: any;
  }
}

const NFTChecker = () => {
  const [address, setAddress] = useState('');
  const [nfts, setNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const contractAddress = '0x18ee5C7a2e7339705Eff8f96717C1085A4B69D27';
  const abi = [
    "function balanceOf(address owner) external view returns (uint256)",
    "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)",
    "function tokenURI(uint256 tokenId) external view returns (string memory)",
    "function ownerOf(uint256 tokenId) external view returns (address)",
    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
  ];

  const checkNFTs = async () => {
    if (!address) {
      setError('Please enter a wallet address');
      return;
    }

    setLoading(true);
    setError('');
    setNfts([]);

    try {
      const provider = new ethers.JsonRpcProvider('https://rpc.ankr.com/monad_testnet');
      const contract = new ethers.Contract(contractAddress, abi, provider);

      // Get balance
      const balance = await contract.balanceOf(address);
      console.log('Balance:', balance.toString());

      if (balance === BigInt(0)) {
        setError('No NFTs found for this address');
        setLoading(false);
        return;
      }

      // Get all token IDs for this address
      const tokenIds = [];
      for (let i = 0; i < Number(balance); i++) {
        try {
          const tokenId = await contract.tokenOfOwnerByIndex(address, i);
          tokenIds.push(tokenId.toString());
        } catch (err) {
          console.error(`Error getting token at index ${i}:`, err);
        }
      }

      // Get token URIs
      const nftData = [];
      for (const tokenId of tokenIds) {
        try {
          const tokenURI = await contract.tokenURI(tokenId);
          nftData.push({
            tokenId,
            tokenURI,
            contractAddress
          });
        } catch (err) {
          console.error(`Error getting URI for token ${tokenId}:`, err);
          nftData.push({
            tokenId,
            tokenURI: 'Error loading metadata',
            contractAddress
          });
        }
      }

      setNfts(nftData);
    } catch (err) {
      console.error('Error checking NFTs:', err);
      setError('Error checking NFTs: ' + (err as Error).message);
    }

    setLoading(false);
  };

  const addToMetaMask = async (tokenId: string) => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC721',
            options: {
              address: contractAddress,
              tokenId: tokenId,
            },
          },
        });
      } catch (error) {
        console.error('Error adding NFT to MetaMask:', error);
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">CTNFT Checker</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wallet Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="0x..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={checkNFTs}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Checking...' : 'Check NFTs'}
          </button>
          
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          {nfts.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Your NFTs</h2>
              <div className="space-y-4">
                {nfts.map((nft, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Token ID: {nft.tokenId}</p>
                        <p className="text-sm text-gray-600">Contract: {nft.contractAddress}</p>
                        <p className="text-sm text-gray-600 break-all">URI: {nft.tokenURI}</p>
                      </div>
                      <button
                        onClick={() => addToMetaMask(nft.tokenId)}
                        className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600"
                      >
                        Add to MetaMask
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-6 bg-gray-100 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Manual Import Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Open MetaMask and go to the NFTs tab</li>
            <li>Click "Import NFT"</li>
            <li>Enter Contract Address: <code className="bg-gray-200 px-1 rounded">{contractAddress}</code></li>
            <li>Enter the Token ID from above</li>
            <li>Click "Add"</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default NFTChecker;
