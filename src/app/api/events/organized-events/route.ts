import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user's role to verify they are an organizer or admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user || (user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
      return NextResponse.json({
        success: false,
        error: 'Forbidden - Only organizers and admins can access organized events'
      }, { status: 403 });
    }

    // Fetch events organized by this user
    const organizedEvents = await prisma.cTFEvent.findMany({
      where: {
        organizerId: userId
      },
      include: {
        organizer: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        challenges: {
          include: {
            _count: {
              select: {
                solves: true
              }
            }
          }
        },
        participants: {
          select: {
            id: true,
            userId: true,
            totalScore: true,
            rank: true,
            hasReceivedNFT: true,
            nftTokenId: true,
            user: {
              select: {
                username: true,
                walletAddress: true
              }
            }
          },
          orderBy: {
            totalScore: 'desc'
          }
        },
        _count: {
          select: {
            participants: true,
            challenges: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to include computed fields
    const eventsWithStats = organizedEvents.map(event => ({
      ...event,
      totalParticipants: event._count.participants,
      totalChallenges: event._count.challenges,
      // Calculate total solves across all challenges
      totalSolves: event.challenges.reduce((sum: number, challenge: any) => sum + challenge._count.solves, 0),
      // Add status based on dates
      status: new Date() < event.startTime ? 'UPCOMING' : 
              new Date() > event.endTime ? 'ENDED' : 'ACTIVE'
    }));

    const response: ApiResponse<typeof eventsWithStats> = {
      success: true,
      data: eventsWithStats
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching organized events:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch organized events'
    }, { status: 500 });
  }
}
