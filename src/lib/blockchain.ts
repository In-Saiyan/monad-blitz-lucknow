import { ethers } from 'ethers';
import { NFTTier } from '@/types';
import deploymentAddresses from '../../deployment-addresses.json';

// Extend Window interface for MetaMask
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Contract ABI (simplified for key functions)
const CTNFT_ABI = [
  "function createEvent(string memory name, uint256 startTime, uint256 endTime) external returns (uint256)",
  "function mintReward(address recipient, uint256 eventId, uint256 rank, uint256 score, uint256 totalParticipants) external",
  "function batchMintRewards(address[] calldata recipients, uint256 eventId, uint256[] calldata ranks, uint256[] calldata scores, uint256 totalParticipants) external",
  "function setTierBaseURI(uint8 tier, string memory baseURI) external",
  "function endEvent(uint256 eventId) external",
  "function getNFTMetadata(uint256 tokenId) external view returns (tuple(uint256 eventId, uint8 tier, uint256 rank, uint256 score, string eventName, uint256 mintTimestamp))",
  "function hasReceivedNFT(uint256 eventId, address user) external view returns (bool)",
  "function tokenURI(uint256 tokenId) external view returns (string memory)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function balanceOf(address owner) external view returns (uint256)",
  "event EventCreated(uint256 indexed eventId, string name, uint256 startTime, uint256 endTime)",
  "event NFTMinted(address indexed recipient, uint256 indexed tokenId, uint256 indexed eventId, uint8 tier, uint256 rank, uint256 score)"
];

/**
 * Monad testnet network configuration
 */
export const MONAD_TESTNET_CONFIG = {
  chainId: '0x279F', // 10143 in hex
  chainName: 'Monad Testnet',
  nativeCurrency: {
    name: 'MON',
    symbol: 'MON',
    decimals: 18
  },
  rpcUrls: ['https://rpc.ankr.com/monad_testnet'],
  blockExplorerUrls: ['https://testnet.monadexplorer.com']
};

export class CTNFTContract {
  private contract: ethers.Contract;
  private signer: ethers.Signer;

  constructor(contractAddress: string, providerUrl: string, privateKey: string) {
    const provider = new ethers.JsonRpcProvider(providerUrl);
    this.signer = new ethers.Wallet(privateKey, provider);
    this.contract = new ethers.Contract(contractAddress, CTNFT_ABI, this.signer);
  }

  /**
   * Create a new CTF event on the blockchain
   */
  async createEvent(name: string, startTime: Date, endTime: Date): Promise<number> {
    try {
      const startTimestamp = Math.floor(startTime.getTime() / 1000);
      const endTimestamp = Math.floor(endTime.getTime() / 1000);
      
      const tx = await this.contract.createEvent(name, startTimestamp, endTimestamp);
      const receipt = await tx.wait();
      
      // Extract event ID from the emitted event
      const eventCreatedLog = receipt.logs.find((log: any) => 
        log.topics[0] === ethers.id("EventCreated(uint256,string,uint256,uint256)")
      );
      
      if (eventCreatedLog) {
        const eventId = parseInt(eventCreatedLog.topics[1], 16);
        return eventId;
      }
      
      throw new Error('Failed to extract event ID');
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  /**
   * Mint a single NFT reward
   */
  async mintReward(
    recipient: string,
    eventId: number,
    rank: number,
    score: number,
    totalParticipants: number
  ): Promise<string> {
    try {
      const tx = await this.contract.mintReward(
        recipient,
        eventId,
        rank,
        score,
        totalParticipants
      );
      const receipt = await tx.wait();
      
      // Extract token ID from the emitted event
      const nftMintedLog = receipt.logs.find((log: any) => 
        log.topics[0] === ethers.id("NFTMinted(address,uint256,uint256,uint8,uint256,uint256)")
      );
      
      if (nftMintedLog) {
        const tokenId = parseInt(nftMintedLog.topics[2], 16);
        return tokenId.toString();
      }
      
      throw new Error('Failed to extract token ID');
    } catch (error) {
      console.error('Error minting NFT:', error);
      throw error;
    }
  }

  /**
   * Batch mint NFT rewards for multiple participants
   */
  async batchMintRewards(
    recipients: string[],
    eventId: number,
    ranks: number[],
    scores: number[],
    totalParticipants: number
  ): Promise<void> {
    try {
      const tx = await this.contract.batchMintRewards(
        recipients,
        eventId,
        ranks,
        scores,
        totalParticipants
      );
      await tx.wait();
    } catch (error) {
      console.error('Error batch minting NFTs:', error);
      throw error;
    }
  }

  /**
   * Set base URI for NFT tier metadata
   */
  async setTierBaseURI(tier: NFTTier, baseURI: string): Promise<void> {
    try {
      const tierIndex = this.getTierIndex(tier);
      const tx = await this.contract.setTierBaseURI(tierIndex, baseURI);
      await tx.wait();
    } catch (error) {
      console.error('Error setting tier base URI:', error);
      throw error;
    }
  }

  /**
   * End a CTF event
   */
  async endEvent(eventId: number): Promise<void> {
    try {
      const tx = await this.contract.endEvent(eventId);
      await tx.wait();
    } catch (error) {
      console.error('Error ending event:', error);
      throw error;
    }
  }

  /**
   * Check if user has received NFT for an event
   */
  async hasReceivedNFT(eventId: number, userAddress: string): Promise<boolean> {
    try {
      return await this.contract.hasReceivedNFT(eventId, userAddress);
    } catch (error) {
      console.error('Error checking NFT status:', error);
      return false;
    }
  }

  /**
   * Get NFT metadata for a token
   */
  async getNFTMetadata(tokenId: string): Promise<any> {
    try {
      const metadata = await this.contract.getNFTMetadata(tokenId);
      return {
        eventId: metadata.eventId.toString(),
        tier: this.getTierFromIndex(metadata.tier),
        rank: metadata.rank.toString(),
        score: metadata.score.toString(),
        eventName: metadata.eventName,
        mintTimestamp: new Date(Number(metadata.mintTimestamp.toString()) * 1000)
      };
    } catch (error) {
      console.error('Error getting NFT metadata:', error);
      throw error;
    }
  }

  /**
   * Get token URI for an NFT
   */
  async getTokenURI(tokenId: string): Promise<string> {
    try {
      return await this.contract.tokenURI(tokenId);
    } catch (error) {
      console.error('Error getting token URI:', error);
      throw error;
    }
  }

  /**
   * Get owner of an NFT
   */
  async getOwner(tokenId: string): Promise<string> {
    try {
      return await this.contract.ownerOf(tokenId);
    } catch (error) {
      console.error('Error getting NFT owner:', error);
      throw error;
    }
  }

  /**
   * Get NFT balance for an address
   */
  async getBalance(address: string): Promise<number> {
    try {
      const balance = await this.contract.balanceOf(address);
      // Convert BigNumber to number - compatible with ethers v5 and v6
      return Number(balance.toString());
    } catch (error) {
      console.error('Error getting NFT balance:', error);
      return 0;
    }
  }

  /**
   * Get all NFTs owned by a user
   */
  async getUserNFTs(userAddress: string): Promise<any[]> {
    try {
      console.log(`Fetching NFTs for address: ${userAddress}`);
      const balance = await this.getBalance(userAddress);
      console.log(`NFT balance for ${userAddress}: ${balance}`);
      
      const nfts = [];

      // Note: This is a simple implementation
      // In production, you might want to use events or maintain a mapping
      for (let i = 0; i < balance; i++) {
        try {
          // You would need to implement tokenOfOwnerByIndex in your contract
          // For now, we'll return mock data structure
          const tokenId = i.toString();
          const metadata = await this.getNFTMetadata(tokenId);
          const tokenURI = await this.getTokenURI(tokenId);

          nfts.push({
            tokenId,
            eventId: metadata.eventId.toString(),
            tier: this.getTierName(metadata.tier),
            rank: metadata.rank.toString(),
            score: metadata.score.toString(),
            eventName: metadata.eventName,
            mintTimestamp: new Date(Number(metadata.mintTimestamp) * 1000),
            tokenURI,
            source: 'blockchain'
          });
        } catch (error) {
          console.warn(`Error fetching NFT ${i} for ${userAddress}:`, error);
          // Continue with other tokens
        }
      }

      console.log(`Found ${nfts.length} NFTs for ${userAddress}`);
      return nfts;
    } catch (error) {
      console.error('Error fetching user NFTs:', error);
      throw error; // Re-throw so the API can handle it properly
    }
  }

  /**
   * Convert tier index to tier name
   */
  private getTierName(tierIndex: number): string {
    switch (tierIndex) {
      case 0: return 'DIAMOND';
      case 1: return 'PLATINUM';
      case 2: return 'GOLD';
      case 3: return 'SILVER';
      case 4: return 'BRONZE';
      default: return 'BRONZE';
    }
  }

  /**
   * Convert NFT tier to contract index
   */
  private getTierIndex(tier: NFTTier): number {
    switch (tier) {
      case NFTTier.DIAMOND: return 0;
      case NFTTier.PLATINUM: return 1;
      case NFTTier.GOLD: return 2;
      case NFTTier.SILVER: return 3;
      case NFTTier.BRONZE: return 4;
      default: return 4;
    }
  }

  /**
   * Convert contract index to NFT tier
   */
  private getTierFromIndex(index: number): NFTTier {
    switch (index) {
      case 0: return NFTTier.DIAMOND;
      case 1: return NFTTier.PLATINUM;
      case 2: return NFTTier.GOLD;
      case 3: return NFTTier.SILVER;
      case 4: return NFTTier.BRONZE;
      default: return NFTTier.BRONZE;
    }
  }
}

/**
 * Add Monad testnet to MetaMask
 */
export async function addMonadTestnetToWallet() {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [MONAD_TESTNET_CONFIG],
      });
      return true;
    } catch (error) {
      console.error('Failed to add Monad testnet to wallet:', error);
      return false;
    }
  }
  return false;
}

/**
 * Get contract addresses from deployment file
 */
export function getContractAddresses() {
  return {
    ctnft: deploymentAddresses.ctnft,
    ctnftReward: deploymentAddresses.ctnftReward,
    deployer: deploymentAddresses.deployer,
    network: deploymentAddresses.network
  };
}

/**
 * Initialize contract instance
 */
export function initializeContract(): CTNFTContract | null {
  // Use deployment addresses from JSON file, fallback to env var
  const contractAddress = process.env.CTNFT_CONTRACT_ADDRESS || deploymentAddresses.ctnft;
  const providerUrl = process.env.MONAD_URL || "https://rpc.ankr.com/monad_testnet";
  const privateKey = process.env.PRIVATE_KEY;

  if (!contractAddress || !providerUrl || !privateKey) {
    console.warn('Missing contract configuration', {
      contractAddress: !!contractAddress,
      providerUrl: !!providerUrl,
      privateKey: !!privateKey
    });
    return null;
  }

  console.log(`Connecting to Monad Testnet with contract: ${contractAddress}`);
  return new CTNFTContract(contractAddress, providerUrl, privateKey);
}

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return ethers.isAddress(address);
}

/**
 * Format address for display (show first 6 and last 4 characters)
 */
export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
