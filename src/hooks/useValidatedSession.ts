'use client';

import { useSession as useNextAuthSession, signOut } from 'next-auth/react';
import { useEffect } from 'react';

export function useValidatedSession() {
  const { data: session, status } = useNextAuthSession();

  useEffect(() => {
    // Check if session is invalid (user doesn't exist in database)
    if (session && (
      !session.user?.id || 
      !session.user?.email || 
      !session.user?.username ||
      new Date(session.expires) <= new Date()
    )) {
      console.log('Invalid session detected, signing out...');
      
      // Show user-friendly message
      const message = 'Your session has expired or the database was reset. Please sign in again.';
      
      // Store message in sessionStorage so it can be shown on the login page
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('signout_reason', message);
      }
      
      signOut({ 
        callbackUrl: '/auth/signin?reason=session_expired',
        redirect: true 
      });
    }
  }, [session]);

  // Return null if session is invalid to prevent any usage
  if (session && (
    !session.user?.id || 
    !session.user?.email || 
    !session.user?.username ||
    new Date(session.expires) <= new Date()
  )) {
    return {
      data: null,
      status: 'loading' as const,
    };
  }

  return {
    data: session,
    status,
  };
}

// Re-export everything else from next-auth/react for convenience
export { signIn, signOut, getSession, SessionProvider } from 'next-auth/react';
