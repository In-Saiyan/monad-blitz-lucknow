import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const event = await prisma.cTFEvent.findUnique({
      where: { id },
      include: {
        organizer: {
          select: {
            username: true,
            email: true,
          },
        },
        challenges: true,
        participants: {
          include: {
            user: {
              select: {
                username: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Calculate participant count
    const participantCount = event.participants.length;

    // Determine event status
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

    const eventData = {
      ...event,
      status,
      participantCount,
    };

    return NextResponse.json(eventData);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
