// app/api/events/join/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const resolvedParams = await params;
    const eventId = resolvedParams.id;
    const userId = session.user.id;

    // Check if event exists and is active
    const event = await prisma.cTFEvent.findUnique({
      where: { id: eventId },
      include: {
        participants: true
      }
    });

    if (!event) {
      return NextResponse.json({
        success: false,
        error: 'Event not found'
      }, { status: 404 });
    }

    if (!event.isActive) {
      return NextResponse.json({
        success: false,
        error: 'Event is not active'
      }, { status: 400 });
    }

    // Check participation limits
    const currentParticipants = event.participants.length;
    const maxParticipants = event.maxParticipants || 10000;
    
    if (currentParticipants >= maxParticipants) {
      return NextResponse.json({
        success: false,
        error: `Event is full. Maximum ${maxParticipants} participants allowed.`
      }, { status: 400 });
    }

    // Check time restrictions
    const now = new Date();
    const eventStartTime = new Date(event.startTime);
    const joinDeadlineMinutes = event.joinDeadlineMinutes || 10;
    const joinDeadline = new Date(eventStartTime.getTime() + (joinDeadlineMinutes * 60 * 1000));

    // Allow joining before the event starts
    if (now < eventStartTime) {
      // Event hasn't started yet, joining is allowed
    } else if (now > joinDeadline) {
      // Event has started and join deadline has passed
      return NextResponse.json({
        success: false,
        error: `Join deadline has passed. You can only join within ${joinDeadlineMinutes} minutes of the event start time.`
      }, { status: 400 });
    }
    // If now is between start time and deadline, joining is still allowed

    // Check if user is the organizer of this event
    if (event.organizerId === userId) {
      return NextResponse.json({
        success: false,
        error: 'Event organizers cannot join their own events'
      }, { status: 400 });
    }

    // Check if user is already participating
    const existingParticipation = await prisma.eventParticipant.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId
        }
      }
    });

    if (existingParticipation) {
      return NextResponse.json({
        success: false,
        error: 'You are already participating in this event'
      }, { status: 400 });
    }

    // Create participation record
    await prisma.eventParticipant.create({
      data: {
        userId,
        eventId
      }
    });

    return NextResponse.json({
      success: true,
      data: { message: 'Successfully joined the event' }
    });

  } catch (error) {
    console.error('Error joining event:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
