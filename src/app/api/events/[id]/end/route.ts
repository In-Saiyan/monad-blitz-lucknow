import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { distributeNFTRewards } from '@/lib/nft-rewards';

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
        error: 'Only the event organizer or admin can end this event'
      }, { status: 403 });
    }

    // Check if event has already ended
    const now = new Date();
    if (now > new Date(event.endTime)) {
      return NextResponse.json({
        success: false,
        error: 'Event has already ended'
      }, { status: 400 });
    }

    // Check if event is not active
    if (now < new Date(event.startTime)) {
      return NextResponse.json({
        success: false,
        error: 'Cannot end an event that has not started yet'
      }, { status: 400 });
    }

    // Update the event to end now
    const updatedEvent = await prisma.cTFEvent.update({
      where: { id: eventId },
      data: {
        endTime: now
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

    // Automatically distribute NFT rewards after ending the event
    let nftDistributionResult = null;
    try {
      console.log(`Attempting to distribute NFTs for event ${eventId}...`);
      nftDistributionResult = await distributeNFTRewards(eventId);
      console.log(`NFT distribution result:`, nftDistributionResult);
    } catch (nftError) {
      console.error('Error distributing NFTs:', nftError);
      // Don't fail the event ending if NFT distribution fails
    }

    return NextResponse.json({
      success: true,
      data: updatedEvent,
      message: 'Event ended successfully',
      nftDistribution: nftDistributionResult || { 
        success: false, 
        error: 'NFT distribution failed or was skipped',
        totalDistributed: 0 
      }
    });

  } catch (error) {
    console.error('Error ending event:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
