// Path: app/api/events/my-events/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/types';

// Helper to determine event status
const getEventStatus = (startTime: Date, endTime: Date): 'UPCOMING' | 'ACTIVE' | 'ENDED' => {
  const now = new Date();
  if (now < startTime) return 'UPCOMING';
  if (now <= endTime) return 'ACTIVE';
  return 'ENDED';
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // This route is specifically for a logged-in user's events, so a session is required.
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    // Fetch all events where the current user is a participant.
    const participatedEvents = await prisma.cTFEvent.findMany({
      where: {
        participants: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        // Include the user's specific participation record for this event to get score/rank.
        participants: {
          where: {
            userId: session.user.id,
          },
        },
        // Include a count of all challenges in the event for the progress bar.
        _count: {
          select: { challenges: true },
        },
      },
      orderBy: { startTime: 'desc' },
    });

    // Asynchronously transform the data to include the count of solved challenges for each event.
    const transformedData = await Promise.all(
      participatedEvents.map(async (event) => {
        const userParticipation = event.participants[0];
        const status = getEventStatus(event.startTime, event.endTime);

        // Count how many challenges in *this specific event* the user has solved.
        const solvedChallengesCount = await prisma.solve.count({
          where: {
            userId: session.user.id,
            challenge: {
              eventId: event.id,
            },
          },
        });

        return {
          id: event.id,
          name: event.name,
          description: event.description,
          startTime: event.startTime,
          endTime: event.endTime,
          isActive: status === 'ACTIVE',
          userScore: userParticipation?.totalScore || 0,
          userRank: userParticipation?.rank || 0,
          totalChallenges: event._count.challenges,
          solvedChallenges: solvedChallengesCount, // This now works correctly.
        };
      })
    );
    
    // Return the data under the 'events' key, which the frontend dashboard expects.
    return NextResponse.json({ success: true, events: transformedData });

  } catch (error) {
    console.error('Error fetching my-events:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}