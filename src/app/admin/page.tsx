'use client';

import { useValidatedSession } from '@/hooks/useValidatedSession';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminOrganizerRequests from '@/components/AdminOrganizerRequests';
import EventCreateForm from '@/components/EventCreateForm';
import MatrixBackground from '@/components/ui/effects/MatrixBackground';

export default function AdminDashboard() {
  const { data: session, status } = useValidatedSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'requests' | 'create-event'>('requests');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (session.user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading' || !session || session.user?.role !== 'ADMIN') {
    return (
      <div className="relative min-h-screen bg-background flex items-center justify-center">
        <MatrixBackground />
        <div className="relative z-10 flex flex-col items-center gap-4 text-primary font-mono">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-accent"></div>
          <p>Verifying Access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <MatrixBackground />
      <div className="relative z-10">
        <nav className="bg-background/80 backdrop-blur-sm border-b border-primary/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-2xl font-bold font-mono text-primary hover:text-primary-focus transition-colors">
                CTF<span className='text-accent'>NFT</span>
              </Link>
              <div className="flex items-center space-x-2 md:space-x-4">
                <Link href="/dashboard" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Dashboard
                </Link>
                <Link href="/profile" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Profile
                </Link>
                <span className="text-red-400 text-sm font-mono">Admin: {session.user?.username}</span>
                <Link href="/api/auth/signout" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Sign Out
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold font-mono text-primary mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage organizer requests and platform settings.</p>
          </div>

          <div className="mb-8">
            <div className="border-b border-primary/20">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('requests')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'requests'
                      ? 'border-accent text-accent'
                      : 'border-transparent text-muted-foreground hover:text-primary hover:border-primary/50'
                  }`}
                >
                  Organizer Requests
                </button>
                <button
                  onClick={() => setActiveTab('create-event')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'create-event'
                      ? 'border-accent text-accent'
                      : 'border-transparent text-muted-foreground hover:text-primary hover:border-primary/50'
                  }`}
                >
                  Create Event
                </button>
              </nav>
            </div>
          </div>

          <div className="bg-background/50 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-primary/20">
            {activeTab === 'requests' && <AdminOrganizerRequests />}
            {activeTab === 'create-event' && (
              <EventCreateForm onSuccess={() => {
                alert('Event created successfully!');
              }} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
