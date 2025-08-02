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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        walletAddress: true,
        totalScore: true,
        createdAt: true
      }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
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

    const { walletAddress } = await request.json();

    // Validate wallet address format if provided
    if (walletAddress && !walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid wallet address format'
      }, { status: 400 });
    }

    // Check if wallet address is already in use by another user
    if (walletAddress) {
      const existingUser = await prisma.user.findUnique({
        where: { walletAddress },
        select: { id: true, username: true }
      });

      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json({
          success: false,
          error: `This wallet address is already connected to another account (${existingUser.username})`
        }, { status: 409 }); // 409 Conflict
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { walletAddress: walletAddress || null },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        walletAddress: true,
        totalScore: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating user profile:', error);
    
    // Handle Prisma unique constraint violation
    if (error.code === 'P2002' && error.meta?.target?.includes('walletAddress')) {
      return NextResponse.json({
        success: false,
        error: 'This wallet address is already connected to another account'
      }, { status: 409 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
