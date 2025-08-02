// app/api/events/[id]/route.ts

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
    const { id } = await params;
    
    // Find the user if session exists
    let user = null;
    if (session?.user?.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
    }

    const event = await prisma.cTFEvent.findUnique({
      where: { id },
      include: {
        organizer: {
          select: {
            username: true,
            email: true,
          },
        },
        challenges: {
          include: {
            solves: user ? {
              where: {
                userId: user.id,
              },
              select: {
                id: true,
                pointsAwarded: true,
              },
            } : false,
          },
        },
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

    // Transform challenges to include solved status
    const transformedChallenges = event.challenges.map((challenge: any) => ({
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      category: challenge.category,
      initialPoints: challenge.initialPoints,
      difficulty: challenge.difficulty,
      fileUrl: challenge.fileUrl,
      solved: user && challenge.solves ? challenge.solves.length > 0 : false,
      pointsAwarded: user && challenge.solves && challenge.solves.length > 0 ? challenge.solves[0].pointsAwarded : undefined,
    }));

    const eventData = {
      ...event,
      status,
      participantCount,
      challenges: transformedChallenges,
    };

    return NextResponse.json(eventData, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
