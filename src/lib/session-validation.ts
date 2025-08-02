import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types';

export interface ValidatedSession {
  user: {
    id: string;
    email: string;
    username: string;
    role: UserRole;
    walletAddress?: string;
  };
  isValid: boolean;
}

/**
 * Validates a session by checking if the user still exists in the database
 * This should be called in API routes and server-side functions
 */
export async function validateSession(): Promise<ValidatedSession | null> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return null;
    }

    // Check if user still exists in database
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        walletAddress: true,
      },
    });

    if (!dbUser) {
      console.log(`Session validation failed: User ${session.user.id} not found in database`);
      return null;
    }

    return {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        username: dbUser.username,
        role: dbUser.role,
        walletAddress: dbUser.walletAddress || undefined,
      },
      isValid: true,
    };
  } catch (error) {
    console.error('Error validating session:', error);
    return null;
  }
}

/**
 * Client-side session validation
 * Checks if session contains valid user data
 */
export function isValidClientSession(session: any): boolean {
  return !!(
    session?.user?.id &&
    session?.user?.email &&
    session?.user?.username &&
    new Date(session.expires) > new Date()
  );
}
