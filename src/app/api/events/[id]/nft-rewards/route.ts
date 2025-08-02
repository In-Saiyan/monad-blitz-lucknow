import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { distributeNFTRewards, previewNFTRewards } from '@/lib/nft-rewards';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const eventId = params.id;

    // Check if user is organizer or admin
    const event = await prisma.cTFEvent.findUnique({
      where: { id: eventId },
      include: { organizer: true }
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const isOrganizer = event.organizerId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isOrganizer && !isAdmin) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Check if event has ended
    if (new Date() < event.endTime) {
      return NextResponse.json({ 
        error: 'Cannot distribute NFTs before event ends' 
      }, { status: 400 });
    }

    // Distribute NFT rewards
    const result = await distributeNFTRewards(eventId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully distributed NFTs to ${result.totalDistributed} participants`,
        totalDistributed: result.totalDistributed
      });
    } else {
      return NextResponse.json({
        success: false,
        message: `Partial distribution completed. ${result.totalDistributed} NFTs distributed.`,
        totalDistributed: result.totalDistributed,
        errors: result.errors
      }, { status: 207 }); // 207 Multi-Status
    }

  } catch (error) {
    console.error('Error distributing NFT rewards:', error);
    return NextResponse.json(
      { error: 'Failed to distribute NFT rewards', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const eventId = params.id;

    // Check if user is organizer or admin
    const event = await prisma.cTFEvent.findUnique({
      where: { id: eventId },
      include: { organizer: true }
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const isOrganizer = event.organizerId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isOrganizer && !isAdmin) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get NFT reward preview
    const preview = await previewNFTRewards(eventId);

    return NextResponse.json({
      success: true,
      preview
    });

  } catch (error) {
    console.error('Error previewing NFT rewards:', error);
    return NextResponse.json(
      { error: 'Failed to preview NFT rewards', details: String(error) },
      { status: 500 }
    );
  }
}
