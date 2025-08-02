import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        error: 'Admin access required'
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PENDING';

    // Get organizer requests
    const requests = await prisma.organizerRequest.findMany({
      where: {
        status: status as any
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            walletAddress: true,
            createdAt: true
          }
        },
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

export async function PUT(request: NextRequest): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        error: 'Admin access required'
      }, { status: 403 });
    }

    const { requestId, action } = await request.json();

    if (!requestId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({
        success: false,
        error: 'Valid requestId and action (approve/reject) are required'
      }, { status: 400 });
    }

    // Get the request
    const organizerRequest = await prisma.organizerRequest.findUnique({
      where: { id: requestId },
      include: {
        user: true
      }
    });

    if (!organizerRequest) {
      return NextResponse.json({
        success: false,
        error: 'Request not found'
      }, { status: 404 });
    }

    if (organizerRequest.status !== 'PENDING') {
      return NextResponse.json({
        success: false,
        error: 'Request has already been processed'
      }, { status: 400 });
    }

    const status = action === 'approve' ? 'APPROVED' : 'REJECTED';

    // Update the request
    const updatedRequest = await prisma.organizerRequest.update({
      where: { id: requestId },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedBy: session.user.id
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            walletAddress: true
          }
        }
      }
    });

    // If approved, update user role to ORGANIZER
    if (action === 'approve') {
      await prisma.user.update({
        where: { id: organizerRequest.userId },
        data: {
          role: 'ORGANIZER'
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedRequest,
      message: `Request ${action}d successfully`
    });

  } catch (error) {
    console.error('Error processing organizer request:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
