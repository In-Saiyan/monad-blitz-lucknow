import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/types';
import { validateSession } from '@/lib/session-validation';

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const validatedSession = await validateSession();
    
    if (!validatedSession) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required or session expired'
      }, { status: 401 });
    }

    // Check if user is organizer or admin
    if (validatedSession.user.role !== 'ORGANIZER' && validatedSession.user.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        error: 'Organizer or Admin access required'
      }, { status: 403 });
    }

    const { name, description, startTime, endTime, maxParticipants, joinDeadlineMinutes } = await request.json();

    if (!name || !description || !startTime || !endTime) {
      return NextResponse.json({
        success: false,
        error: 'Name, description, start time, and end time are required'
      }, { status: 400 });
    }

    // Validate participation limits
    const finalMaxParticipants = maxParticipants && maxParticipants > 0 ? Math.min(maxParticipants, 50000) : 10000;
    const finalJoinDeadlineMinutes = joinDeadlineMinutes !== undefined ? Math.max(0, Math.min(joinDeadlineMinutes, 60)) : 10;

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (startDate >= endDate) {
      return NextResponse.json({
        success: false,
        error: 'End time must be after start time'
      }, { status: 400 });
    }

    if (startDate < new Date()) {
      return NextResponse.json({
        success: false,
        error: 'Start time cannot be in the past'
      }, { status: 400 });
    }

    // Create the event
    const event = await prisma.cTFEvent.create({
      data: {
        name,
        description,
        startTime: startDate,
        endTime: endDate,
        organizerId: validatedSession.user.id,
        isActive: true,
        maxParticipants: finalMaxParticipants,
        joinDeadlineMinutes: finalJoinDeadlineMinutes
      },
      include: {
        organizer: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: event,
      message: 'Event created successfully'
    });

  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<any[]>>> {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'active', 'upcoming', 'ended'
    
    let whereClause: any = {};
    
    if (status === 'active') {
      whereClause = {
        isActive: true,
        startTime: { lte: new Date() },
        endTime: { gte: new Date() }
      };
    } else if (status === 'upcoming') {
      whereClause = {
        startTime: { gt: new Date() }
      };
    } else if (status === 'ended') {
      whereClause = {
        endTime: { lt: new Date() }
      };
    }

    const events = await prisma.cTFEvent.findMany({
      where: whereClause,
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
        startTime: 'desc'
      }
    });

    // Transform events to include participation info and participant count
    const transformedEvents = events.map((event: any) => {
      const now = new Date();
      const eventStartTime = new Date(event.startTime);
      const joinDeadlineMinutes = event.joinDeadlineMinutes || 10;
      const joinDeadline = new Date(eventStartTime.getTime() + (joinDeadlineMinutes * 60 * 1000));
      const participantCount = event._count.participants;
      const maxParticipants = event.maxParticipants || 10000;
      
      // Determine if user can join
      let canJoin = true;
      let joinRestrictionReason = '';
      
      if (participantCount >= maxParticipants) {
        canJoin = false;
        joinRestrictionReason = `Event is full (${maxParticipants} participants)`;
      } else if (now > joinDeadline && now > eventStartTime) {
        canJoin = false;
        joinRestrictionReason = `Join deadline passed (${joinDeadlineMinutes} min after start)`;
      } else if (session?.user?.id === event.organizerId) {
        canJoin = false;
        joinRestrictionReason = 'Event organizers cannot join their own events';
      } else if (session?.user?.id && event.participants.some((p: any) => p.userId === session.user.id)) {
        canJoin = false;
        joinRestrictionReason = 'Already participating';
      }

      return {
        id: event.id,
        name: event.name,
        description: event.description,
        startTime: event.startTime,
        endTime: event.endTime,
        isActive: event.isActive,
        maxParticipants: event.maxParticipants,
        joinDeadlineMinutes: event.joinDeadlineMinutes,
        organizer: event.organizer,
        participants: event.participants,
        challenges: event.challenges,
        participantCount,
        userParticipating: session?.user?.id ? 
          event.participants.some((p: any) => p.userId === session.user.id) : false,
        canJoin,
        joinRestrictionReason,
        spotsRemaining: maxParticipants - participantCount,
        joinDeadline: joinDeadline.toISOString()
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedEvents
    });

  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
