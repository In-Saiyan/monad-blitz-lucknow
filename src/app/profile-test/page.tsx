'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function ProfileTest() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    console.log('Profile page: session status:', status);
    console.log('Profile page: session data:', session);
    
    if (status === 'loading') return;
    
    if (!session) {
      console.log('No session, redirecting to signin');
      router.push('/auth/signin');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-red-500 flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-blue-500 flex items-center justify-center">
        <div className="text-white text-xl">Not authenticated</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-500">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-white">
              CTNFT
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Dashboard
              </Link>
              <span className="text-gray-300">Welcome, {session.user?.username}</span>
              <Link href="/api/auth/signout" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl p-8">
          <h1 className="text-3xl font-bold text-black mb-4">Profile Test Page</h1>
          <p>Session status: {status}</p>
          <p>User ID: {session.user?.id}</p>
          <p>Username: {session.user?.username}</p>
          <p>Email: {session.user?.email}</p>
          <p>Role: {session.user?.role}</p>
        </div>
      </div>
    </div>
  );
}
