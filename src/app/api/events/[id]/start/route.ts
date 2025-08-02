import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const { id: eventId } = await params;

    // Find the event and check if user is the organizer
    const event = await prisma.cTFEvent.findUnique({
      where: { id: eventId },
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

    if (!event) {
      return NextResponse.json({
        success: false,
        error: 'Event not found'
      }, { status: 404 });
    }

    // Check if user is the organizer or admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (event.organizerId !== session.user.id && user?.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        error: 'Only the event organizer or admin can start this event'
      }, { status: 403 });
    }

    // Check if event has already ended
    const now = new Date();
    if (now > new Date(event.endTime)) {
      return NextResponse.json({
        success: false,
        error: 'Cannot start an event that has already ended'
      }, { status: 400 });
    }

    // Check if event is already active (started)
    if (now >= new Date(event.startTime) && now <= new Date(event.endTime)) {
      return NextResponse.json({
        success: false,
        error: 'Event is already active'
      }, { status: 400 });
    }

    // Update the event to start now
    const updatedEvent = await prisma.cTFEvent.update({
      where: { id: eventId },
      data: {
        startTime: now,
        // Ensure end time is still in the future
        endTime: new Date(event.endTime).getTime() < now.getTime() + (60 * 60 * 1000) 
          ? new Date(now.getTime() + (2 * 60 * 60 * 1000)) // Default to 2 hours from now if end time is too close
          : new Date(event.endTime)
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
      data: updatedEvent,
      message: 'Event started successfully'
    });

  } catch (error) {
    console.error('Error starting event:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
