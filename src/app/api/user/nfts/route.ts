import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { initializeContract } from '@/lib/blockchain';
import { determineNFTTier } from '@/lib/scoring';
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
    
    // First, get NFTs from database (these are definitely distributed)
    const dbNFTRecords = await prisma.eventParticipant.findMany({
      where: {
        userId: session.user.id,
        hasReceivedNFT: true
      },
      include: {
        event: {
          select: {
            name: true,
            endTime: true
          }
        }
      },
      orderBy: {
        joinedAt: 'desc'
      }
    });

    // Transform database records to NFT format
    const dbNFTs = dbNFTRecords.map(record => ({
      tokenId: record.nftTokenId || `db-${record.id}`,
      eventId: record.eventId,
      tier: determineNFTTier(record.rank || 999, dbNFTRecords.length),
      rank: record.rank,
      score: record.totalScore,
      eventName: record.event.name,
      mintTimestamp: record.event.endTime,
      walletAddress: user.walletAddress,
      source: 'database'
    }));
    
    if (!contract) {
      // Return database NFTs + some mock data for demo when blockchain is not configured
      const mockNFTs = [
        {
          tokenId: 'demo-1',
          eventId: 'demo-event-1',
          tier: 'GOLD',
          rank: 2,
          score: 1250,
          eventName: 'Demo Web3 Security CTF',
          mintTimestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          walletAddress: user.walletAddress,
          source: 'demo'
        }
      ];

      const allNFTs = [...dbNFTs, ...mockNFTs];

      return NextResponse.json({
        success: true,
        data: {
          blockchainConnected: false,
          message: dbNFTs.length > 0 
            ? `Found ${dbNFTs.length} NFTs from database. Blockchain demo mode active.`
            : 'No NFTs found. Please participate in events to earn NFT rewards!',
          contractAddress: process.env.CTNFT_CONTRACT_ADDRESS || 'Not deployed',
          nftsEarned: allNFTs,
          totalNFTs: allNFTs.length,
          databaseNFTs: dbNFTs.length,
          configStatus: {
            providerUrl: process.env.MONAD_URL ? 'Configured' : 'Missing MONAD_URL',
            privateKey: process.env.PRIVATE_KEY ? 'Configured' : 'Missing PRIVATE_KEY',
            contractAddress: process.env.CTNFT_CONTRACT_ADDRESS ? 'Configured' : 'Missing CTNFT_CONTRACT_ADDRESS'
          }
        }
      });
    }

    try {
      // Get user's actual NFTs from the blockchain
      const blockchainNFTs = await contract.getUserNFTs(user.walletAddress);
      
      // Combine database and blockchain NFTs
      const allNFTs = [...dbNFTs, ...blockchainNFTs];
      
      return NextResponse.json({
        success: true,
        data: {
          blockchainConnected: true,
          contractAddress: process.env.CTNFT_CONTRACT_ADDRESS,
          nftsEarned: allNFTs,
          totalNFTs: allNFTs.length,
          databaseNFTs: dbNFTs.length,
          blockchainNFTs: blockchainNFTs.length,
          walletAddress: user.walletAddress
        }
      });
    } catch (blockchainError) {
      console.error('Blockchain query failed:', blockchainError);
      
      // Return only database NFTs if blockchain fails
      return NextResponse.json({
        success: true,
        data: {
          blockchainConnected: false,
          message: dbNFTs.length > 0 
            ? `Found ${dbNFTs.length} NFTs from database. Blockchain query failed.`
            : 'No NFTs found in database and blockchain query failed.',
          walletAddress: user.walletAddress,
          contractAddress: process.env.CTNFT_CONTRACT_ADDRESS,
          nftsEarned: dbNFTs,
          totalNFTs: dbNFTs.length,
          databaseNFTs: dbNFTs.length,
          blockchainError: String(blockchainError)
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
