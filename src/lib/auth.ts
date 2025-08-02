import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { UserRole } from '@/types';

declare module 'next-auth' {
  interface User {
    id: string;
    username: string;
    role: UserRole;
    walletAddress?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      username: string;
      role: UserRole;
      walletAddress?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    username: string;
    role: UserRole;
    walletAddress?: string;
    invalid?: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error('No user found with this email');
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValidPassword) {
          throw new Error('Invalid password');
        }

        return {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          walletAddress: user.walletAddress || undefined,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.username = user.username;
        token.role = user.role;
        token.walletAddress = user.walletAddress;
      }
      
      // Verify user still exists in database on each token refresh
      if (token.sub) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: {
              id: true,
              email: true,
              username: true,
              role: true,
              walletAddress: true,
            },
          });
          
          if (!dbUser) {
            // User no longer exists in database, mark token as invalid
            token.invalid = true;
            return token;
          }
          
          // Update token with latest user data
          token.username = dbUser.username;
          token.role = dbUser.role;
          token.walletAddress = dbUser.walletAddress || undefined;
          token.invalid = false;
        } catch (error) {
          console.error('Error verifying user session:', error);
          // On database error, mark token as invalid to be safe
          token.invalid = true;
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      // If token is marked as invalid, return empty session
      if (token.invalid) {
        return {
          ...session,
          user: {
            id: '',
            email: '',
            username: '',
            role: 'USER' as UserRole,
            walletAddress: undefined,
          },
          expires: new Date(0).toISOString(), // Expired session
        };
      }
      
      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.username = token.username;
        session.user.role = token.role;
        session.user.walletAddress = token.walletAddress;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;
