import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const events = await prisma.cTFEvent.findMany({
      select: {
        id: true,
        name: true,
        isActive: true,
        endTime: true
      },
      orderBy: { createdAt: 'desc' },
      take: 3
    });
    
    // Get participants separately
    const eventsWithParticipants = await Promise.all(
      events.map(async (event) => {
        const participants = await prisma.eventParticipant.findMany({
          where: { eventId: event.id },
          select: {
            user: {
              select: {
                username: true,
                walletAddress: true
              }
            },
            totalScore: true
          }
        });
        
        return {
          id: event.id,
          name: event.name,
          isActive: event.isActive,
          endTime: event.endTime,
          participantsWithWallets: participants.filter(p => p.user.walletAddress).length,
          totalParticipants: participants.length,
          isEnded: new Date() > event.endTime
        };
      })
    );
    
    return NextResponse.json({ events: eventsWithParticipants });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
