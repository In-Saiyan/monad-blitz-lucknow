import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/types';

interface UserStats {
  totalEvents: number;
  totalSolves: number;
  totalPoints: number;
  rank: number;
  nftsEarned: number;
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

    // For now, NFTs earned is 0 since we haven't implemented the minting logic yet
    const nftsEarned = 0;

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
