import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidateTag } from 'next/cache';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; challengeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: eventId, challengeId } = await params;

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the flag from request body
    const { flag } = await request.json();

    if (!flag) {
      return NextResponse.json({ error: 'Flag is required' }, { status: 400 });
    }

    // Find the challenge and verify it belongs to the event
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        event: true,
        solves: {
          where: { userId: user.id }
        }
      },
    });

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    if (challenge.eventId !== eventId) {
      return NextResponse.json({ error: 'Challenge does not belong to this event' }, { status: 400 });
    }

    // Check if event is active
    const now = new Date();
    const startTime = new Date(challenge.event.startTime);
    const endTime = new Date(challenge.event.endTime);
    
    if (now < startTime) {
      return NextResponse.json({ error: 'Event has not started yet' }, { status: 400 });
    }
    
    if (now > endTime) {
      return NextResponse.json({ error: 'Event has ended' }, { status: 400 });
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
      return NextResponse.json({ error: 'You are not participating in this event' }, { status: 400 });
    }

    // Check if user has already solved this challenge
    if (challenge.solves.length > 0) {
      return NextResponse.json({ error: 'You have already solved this challenge' }, { status: 400 });
    }

    // Check if the flag is correct
    if (flag.trim() !== challenge.flag.trim()) {
      return NextResponse.json({ error: 'Incorrect flag' }, { status: 400 });
    }

    // Calculate points based on dynamic scoring
    const currentSolveCount = await prisma.solve.count({
      where: { challengeId },
    });

    // Dynamic scoring formula: points = max(min_points, initial_points - (decay_factor * solves))
    const pointsAwarded = Math.max(
      challenge.minPoints,
      challenge.initialPoints - (challenge.decayFactor * currentSolveCount)
    );

    // Create the solve record
    const solve = await prisma.solve.create({
      data: {
        userId: user.id,
        challengeId,
        pointsAwarded,
      },
    });

    console.log(`[DEBUG] Created solve record:`, {
      id: solve.id,
      userId: solve.userId,
      challengeId: solve.challengeId,
      pointsAwarded: solve.pointsAwarded,
      solvedAt: solve.solvedAt
    });

    // Update user's total score
    await prisma.user.update({
      where: { id: user.id },
      data: {
        totalScore: {
          increment: pointsAwarded,
        },
      },
    });

    // Update participant's total score for this event
    await prisma.eventParticipant.update({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId: eventId,
        },
      },
      data: {
        totalScore: {
          increment: pointsAwarded,
        },
      },
    });

    return NextResponse.json({
      message: 'Correct flag! Challenge solved!',
      pointsAwarded,
      solve,
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error submitting flag:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
