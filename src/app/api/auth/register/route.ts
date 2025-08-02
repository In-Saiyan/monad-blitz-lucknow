import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const { username, email, password, walletAddress } = await request.json();

    // Validate required fields
    if (!username || !email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Username, email, and password are required'
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'A user with this email or username already exists'
      }, { status: 400 });
    }

    // Validate wallet address format if provided
    if (walletAddress && !walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid wallet address format'
      }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        walletAddress: walletAddress || null,
        role: 'USER'
      },
      select: {
        id: true,
        username: true,
        email: true,
        walletAddress: true,
        role: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
