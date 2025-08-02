// Path: app/api/events/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/types';

// The POST function remains unchanged...
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<any>>> {
  // ... your existing, correct POST logic here
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) { return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 }); }
    if (session.user.role !== 'ORGANIZER' && session.user.role !== 'ADMIN') { return NextResponse.json({ success: false, error: 'Organizer or Admin access required' }, { status: 403 }); }
    const { name, description, startTime, endTime, maxParticipants, joinDeadlineMinutes } = await request.json();
    if (!name || !description || !startTime || !endTime) { return NextResponse.json({ success: false, error: 'Required fields are missing' }, { status: 400 }); }
    const event = await prisma.cTFEvent.create({ data: { name, description, startTime: new Date(startTime), endTime: new Date(endTime), organizerId: session.user.id, isActive: true, maxParticipants: maxParticipants || 10000, joinDeadlineMinutes: joinDeadlineMinutes || 10, } });
    return NextResponse.json({ success: true, data: event, message: 'Event created successfully' });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}


export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<any[]>>> {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    let whereClause: any = {};
    const now = new Date();

    // If a specific status is requested, use that.
    if (status) {
      if (status === 'active') whereClause = { startTime: { lte: now }, endTime: { gte: now } };
      else if (status === 'upcoming') whereClause = { startTime: { gt: now } };
      else if (status === 'ended') whereClause = { endTime: { lt: now } };
    } else {
      // ======================================================================================
      // --- FIX 1: If NO status is specified, default to showing only ACTIVE and UPCOMING ---
      // This ensures "Available Missions" doesn't get ended events.
      // ======================================================================================
      whereClause.endTime = { gte: now };
    }

    // --- FIX 2: Continue to exclude events the user has already joined ---
    if (session?.user?.id) {
      whereClause.participants = {
        none: {
          userId: session.user.id
        }
      };
    }

    const events = await prisma.cTFEvent.findMany({
      where: whereClause, // The where clause now contains both filters
      include: {
        organizer: { select: { id: true, username: true } },
        _count: { select: { participants: true, challenges: true } }
      },
      orderBy: { startTime: 'desc' }
    });

    // Transform events data for the frontend
     const transformedEvents = events.map((event: any) => ({
      id: event.id,
      title: event.name,
      description: event.description,
      status: getEventStatus(new Date(event.startTime), new Date(event.endTime)),
      startDate: event.startTime.toISOString(),
      endDate: event.endTime.toISOString(),
      _count: {
        participants: event._count.participants,
        challenges: event._count.challenges,
      },
      participantCount: event._count.participants,
    }));

    return NextResponse.json({
      success: true,
      data: transformedEvents,
      events: transformedEvents,
    });

  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function needed in this file
const getEventStatus = (startTime: Date, endTime: Date): 'UPCOMING' | 'ACTIVE' | 'ENDED' => {
  const now = new Date();
  if (now < startTime) return 'UPCOMING';
  if (now <= endTime) return 'ACTIVE';
  return 'ENDED';
};