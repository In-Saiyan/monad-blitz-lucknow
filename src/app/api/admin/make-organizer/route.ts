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

    const { email } = await request.json();
    const targetEmail = email || session.user.email;

    if (!targetEmail) {
      return NextResponse.json({
        success: false,
        error: 'Email is required'
      }, { status: 400 });
    }

    // For demo purposes, allow any authenticated user to make themselves an organizer
    // In production, this should require admin privileges
    const user = await prisma.user.findUnique({
      where: { email: targetEmail }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Update user role to ORGANIZER
    const updatedUser = await prisma.user.update({
      where: { email: targetEmail },
      data: { role: 'ORGANIZER' },
      select: {
        id: true,
        username: true,
        email: true,
        role: true
      }
    });

    return NextResponse.json({
      success: true,
      message: `User ${updatedUser.username} is now an ORGANIZER`,
      data: updatedUser
    });

  } catch (error) {
    console.error('Error making user organizer:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
