import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { determineNFTTier } from '@/lib/scoring';
import { ApiResponse, NFTMetadata, NFTTier } from '@/types';

interface UserStats {
  totalEvents: number;
  totalSolves: number;
  totalPoints: number;
  rank: number;
  nftsEarned: NFTMetadata[];
}

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<UserStats>>> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const userId = session.user.id;

    // Get total events user participated in
    const totalEvents = await prisma.eventParticipant.count({
      where: { userId }
    });

    // Get total solves and points
    const solves = await prisma.solve.findMany({
      where: { userId },
      include: {
        challenge: true
      }
    });

    const totalSolves = solves.length;
    const totalPoints = solves.reduce((sum: number, solve: any) => sum + solve.points, 0);

    // Calculate user rank based on total points
    const usersWithHigherPoints = await prisma.user.count({
      where: {
        solves: {
          some: {}
        }
      },
      orderBy: {
        solves: {
          _count: 'desc'
        }
      }
    });

    // This is a simplified rank calculation
    // In a real implementation, you'd want to aggregate points properly
    const rank = usersWithHigherPoints + 1;

    // Get user's NFTs from EventParticipant records
    const userNFTs = await prisma.eventParticipant.findMany({
      where: { 
        userId: userId,
        hasReceivedNFT: true,
        nftTokenId: {
          not: null
        }
      },
      include: {
        event: true
      },
      orderBy: { joinedAt: 'desc' }
    });

    // Transform NFT data to match NFTMetadata interface
    const nftsEarned: NFTMetadata[] = userNFTs.map((participant) => {
      // Count participants in this event to determine tier
      const participantCount = userNFTs.filter(p => p.eventId === participant.eventId).length;
      const tier = determineNFTTier(participant.rank || 1, participantCount) as NFTTier;
      return {
        tokenId: participant.nftTokenId!,
        eventId: participant.eventId,
        tier: tier,
        rank: participant.rank || 1,
        score: participant.totalScore,
        eventName: participant.event.name,
        mintTimestamp: participant.joinedAt,
        walletAddress: userId // We'd need actual wallet address from user
      };
    });

    const stats: UserStats = {
      totalEvents,
      totalSolves,
      totalPoints,
      rank,
      nftsEarned
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
