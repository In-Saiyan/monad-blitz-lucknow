import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<any[]>>> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    // Check if user is organizer or admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'ORGANIZER' && user?.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        error: 'Organizer or Admin access required'
      }, { status: 403 });
    }

    // Fetch events organized by this user
    const events = await prisma.cTFEvent.findMany({
      where: { organizerId: session.user.id },
      include: {
        organizer: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        participants: {
          select: {
            id: true,
            userId: true,
            totalScore: true,
            rank: true
          }
        },
        challenges: {
          select: {
            id: true,
            title: true,
            category: true,
            difficulty: true
          }
        },
        _count: {
          select: {
            participants: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform events to include status and participant count
    const transformedEvents = events.map((event: any) => {
      const now = new Date();
      const startTime = new Date(event.startTime);
      const endTime = new Date(event.endTime);
      
      let status: 'UPCOMING' | 'ACTIVE' | 'ENDED';
      if (now < startTime) {
        status = 'UPCOMING';
      } else if (now <= endTime) {
        status = 'ACTIVE';
      } else {
        status = 'ENDED';
      }

      return {
        id: event.id,
        name: event.name,
        description: event.description,
        startTime: event.startTime,
        endTime: event.endTime,
        isActive: event.isActive,
        status,
        organizer: event.organizer,
        participants: event.participants,
        challenges: event.challenges,
        participantCount: event._count.participants,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedEvents
    });

  } catch (error) {
    console.error('Error fetching organizer events:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
