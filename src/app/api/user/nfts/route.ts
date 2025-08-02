import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { initializeContract } from '@/lib/blockchain';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    // Get user's wallet address from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { walletAddress: true }
    });

    if (!user?.walletAddress) {
      return NextResponse.json({
        success: true,
        data: {
          blockchainConnected: false,
          message: 'Please set your wallet address in your profile to view NFTs',
          nftsEarned: [],
          totalNFTs: 0
        }
      });
    }

    // Check blockchain connection
    const contract = initializeContract();
    
    if (!contract) {
      // Return mock data for demo when blockchain is not configured
      const mockNFTs = [
        {
          tokenId: 'demo-1',
          eventId: 'demo-event-1',
          tier: 'RARE',
          rank: 2,
          score: 1250,
          eventName: 'Demo Web3 Security CTF',
          mintTimestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          walletAddress: user.walletAddress
        },
        {
          tokenId: 'demo-2',
          eventId: 'demo-event-2',
          tier: 'COMMON',
          rank: 5,
          score: 800,
          eventName: 'Blockchain Basics Challenge',
          mintTimestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          walletAddress: user.walletAddress
        }
      ];

      return NextResponse.json({
        success: true,
        data: {
          blockchainConnected: false,
          message: 'Demo mode: blockchain not configured. These are sample NFTs.',
          contractAddress: process.env.CTNFT_CONTRACT_ADDRESS || 'Not deployed',
          nftsEarned: mockNFTs,
          totalNFTs: mockNFTs.length,
          configStatus: {
            providerUrl: process.env.SEPOLIA_URL ? 'Configured' : 'Missing SEPOLIA_URL',
            privateKey: process.env.PRIVATE_KEY ? 'Configured' : 'Missing PRIVATE_KEY',
            contractAddress: process.env.CTNFT_CONTRACT_ADDRESS ? 'Configured' : 'Missing CTNFT_CONTRACT_ADDRESS'
          }
        }
      });
    }

    try {
      // Get user's actual NFTs from the blockchain
      const userNFTs = await contract.getUserNFTs(user.walletAddress);
      
      return NextResponse.json({
        success: true,
        data: {
          blockchainConnected: true,
          contractAddress: process.env.CTNFT_CONTRACT_ADDRESS,
          nftsEarned: userNFTs,
          totalNFTs: userNFTs.length,
          walletAddress: user.walletAddress
        }
      });
    } catch (blockchainError) {
      console.error('Blockchain query failed:', blockchainError);
      
      return NextResponse.json({
        success: false,
        error: 'Failed to query blockchain for NFTs',
        data: {
          blockchainConnected: false,
          walletAddress: user.walletAddress,
          contractAddress: process.env.CTNFT_CONTRACT_ADDRESS
        }
      });
    }

  } catch (error) {
    console.error('Error checking NFT status:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
