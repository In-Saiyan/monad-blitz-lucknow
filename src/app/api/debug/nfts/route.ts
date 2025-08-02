import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all NFT records (participants who received NFTs)
    const allNFTRecords = await prisma.eventParticipant.findMany({
      where: {
        hasReceivedNFT: true
      },
      include: {
        user: {
          select: {
            username: true,
            walletAddress: true
          }
        },
        event: {
          select: {
            name: true,
            endTime: true
          }
        }
      },
      orderBy: {
        joinedAt: 'desc'
      }
    });

    // Get user's specific NFT records
    const userNFTRecords = await prisma.eventParticipant.findMany({
      where: {
        userId: session.user.id,
        hasReceivedNFT: true
      },
      include: {
        event: {
          select: {
            name: true,
            endTime: true
          }
        }
      }
    });

    // Get user's participation data for context
    const userParticipations = await prisma.eventParticipant.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            endTime: true
          }
        }
      }
    });

    // Get solve data
    const userSolves = await prisma.solve.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        challenge: {
          select: {
            title: true,
            event: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        totalNFTsInDatabase: allNFTRecords.length,
        userNFTRecords: userNFTRecords,
        userParticipations: userParticipations,
        userSolves: userSolves,
        allNFTRecords: allNFTRecords // For admin debugging
      }
    });

  } catch (error) {
    console.error('Debug NFT API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: String(error)
    }, { status: 500 });
  }
}
