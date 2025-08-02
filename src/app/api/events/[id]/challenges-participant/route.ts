import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: eventId } = await params;

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is participating in the event
    const participation = await prisma.eventParticipant.findUnique({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId: eventId,
        },
      },
    });

    if (!participation) {
      return NextResponse.json({ error: 'You are not participating in this event' }, { status: 403 });
    }

    // Fetch the event with challenges
    const event = await prisma.cTFEvent.findUnique({
      where: { id: eventId },
      include: {
        challenges: {
          include: {
            _count: {
              select: {
                solves: true,
              },
            },
            solves: {
              where: {
                userId: user.id,
              },
              select: {
                id: true,
                pointsAwarded: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    console.log(`[DEBUG] User ${user.id} fetching challenges for event ${eventId}`);
    console.log(`[DEBUG] Found ${event.challenges.length} challenges`);
    event.challenges.forEach(challenge => {
      console.log(`[DEBUG] Challenge ${challenge.id}: ${challenge.solves.length} solves by user`);
    });

    // Transform the data to include only information participants should see
    const transformedEvent = {
      id: event.id,
      title: event.name, // Using 'name' field from CTFEvent model
      description: event.description,
      startTime: event.startTime,
      endTime: event.endTime,
      status: event.isActive ? 'active' : 'inactive', // Derive status from isActive
      challenges: event.challenges.map((challenge: any) => ({
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        category: challenge.category,
        difficulty: challenge.difficulty,
        fileUrl: challenge.fileUrl,
        _count: challenge._count,
        solved: challenge.solves.length > 0,
        pointsAwarded: challenge.solves.length > 0 ? challenge.solves[0].pointsAwarded : undefined,
      })),
    };

    return NextResponse.json(transformedEvent, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error fetching event challenges for participant:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
