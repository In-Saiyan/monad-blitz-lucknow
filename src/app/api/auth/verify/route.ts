import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/session-validation';

export async function GET(request: NextRequest) {
  try {
    const validatedSession = await validateSession();
    
    if (!validatedSession) {
      return NextResponse.json({
        valid: false,
        error: 'Session expired or user not found'
      }, { status: 401 });
    }

    return NextResponse.json({
      valid: true,
      user: validatedSession.user
    });
  } catch (error) {
    console.error('Error verifying session:', error);
    return NextResponse.json({
      valid: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
