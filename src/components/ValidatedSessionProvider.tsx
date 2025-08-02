'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { useValidatedSession } from '@/hooks/useValidatedSession';
import { useEffect, ReactNode } from 'react';

interface ValidatedSessionProviderProps {
  children: ReactNode;
  session?: any;
}

function SessionValidator({ children }: { children: ReactNode }) {
  const { data: session, status } = useValidatedSession();

  // The useValidatedSession hook handles automatic logout for invalid sessions
  // We just need to render children normally
  return <>{children}</>;
}

export function ValidatedSessionProvider({ children, session }: ValidatedSessionProviderProps) {
  return (
    <NextAuthSessionProvider session={session}>
      <SessionValidator>
        {children}
      </SessionValidator>
    </NextAuthSessionProvider>
  );
}
