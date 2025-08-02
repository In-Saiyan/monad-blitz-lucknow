import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const { subject, body } = await request.json();

    if (!subject || !body) {
      return NextResponse.json({
        success: false,
        error: 'Subject and body are required'
      }, { status: 400 });
    }

    // Check if user already has a pending request
    const existingRequest = await prisma.organizerRequest.findFirst({
      where: {
        userId: session.user.id,
        status: 'PENDING'
      }
    });

    if (existingRequest) {
      return NextResponse.json({
        success: false,
        error: 'You already have a pending organizer request'
      }, { status: 400 });
    }

    // Check if user is already an organizer or admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role === 'ORGANIZER' || user?.role === 'ADMIN') {
      return NextResponse.json({
        success: false,
        error: 'You are already an organizer or admin'
      }, { status: 400 });
    }

    // Create the organizer request
    const organizerRequest = await prisma.organizerRequest.create({
      data: {
        userId: session.user.id,
        subject,
        body,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            username: true,
            email: true,
            walletAddress: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: organizerRequest,
      message: 'Organizer request submitted successfully'
    });

  } catch (error) {
    console.error('Error creating organizer request:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    // Get user's organizer requests
    const requests = await prisma.organizerRequest.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        reviewer: {
          select: {
            username: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error('Error fetching organizer requests:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
