'use client'

import { useValidatedSession } from '@/hooks/useValidatedSession'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import UserNFTCollection from '@/components/UserNFTCollection'
import MonadNetworkInfo from '@/components/MonadNetworkInfo'

interface Event {
  id: string
  title: string
  description: string
  status: 'UPCOMING' | 'ACTIVE' | 'ENDED'
  startDate: string
  endDate: string
  _count: {
    participants: number
    challenges: number
  }
}

interface UserStats {
  totalScore: number
  eventsParticipated: number
  challengesSolved: number
  rank: number
}

interface ParticipatedEvent {
  id: string
  name: string
  description: string
  startTime: Date
  endTime: Date
  isActive: boolean
  userScore: number
  userRank: number
  totalChallenges: number
  solvedChallenges: number
}

export default function Dashboard() {
  const { data: session, status } = useValidatedSession()
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [participatedEvents, setParticipatedEvents] = useState<ParticipatedEvent[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchEvents()
    fetchUserData()
  }, [session, status, router])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      } else {
        setEvents([])
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      setEvents([])
    }
  }

  const fetchUserData = async () => {
    try {
      // Fetch user's participated events
      const participatedResponse = await fetch('/api/events?participated=true')
      if (participatedResponse.ok) {
        const participatedData = await participatedResponse.json()
        setParticipatedEvents(participatedData.events || [])
      }

      // Fetch user stats (we can calculate this from the participated events for now)
      // In a real app, you might have a dedicated endpoint for user stats
      const statsResponse = await fetch('/api/user/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setUserStats(statsData.stats)
      } else {
        // Calculate basic stats from session data
        setUserStats({
          totalScore: 0, // We'll get this from the API
          eventsParticipated: 0,
          challengesSolved: 0,
          rank: 0
        })
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      setParticipatedEvents([])
      setUserStats({
        totalScore: 0,
        eventsParticipated: 0,
        challengesSolved: 0,
        rank: 0
      })
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              CTNFT
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/events" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Events
              </Link>
              <Link href="/leaderboard" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Leaderboard
              </Link>
              {session.user?.role === 'ADMIN' && (
                <Link href="/admin" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Admin
                </Link>
              )}
              {(session.user?.role === 'ORGANIZER' || session.user?.role === 'ADMIN') && (
                <Link href="/organizer" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Organizer
                </Link>
              )}
              <Link href="/profile" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Profile
              </Link>
              <span className="text-gray-300">Welcome, {session.user?.username}</span>
              <Link href="/api/auth/signout" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                Welcome back, {session.user.username}!
              </h1>
              <p className="text-gray-300">Ready to capture some flags? Let's see your progress.</p>
            </div>
            <div className="hidden md:block">
              <div className="text-right">
                <p className="text-sm text-gray-400">Your Role</p>
                <p className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {session.user.role}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg mr-4">
                <span className="text-2xl">🏆</span>
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Score</p>
                <p className="text-2xl font-bold text-blue-400">{userStats?.totalScore || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg mr-4">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <p className="text-sm text-gray-400">Events Joined</p>
                <p className="text-2xl font-bold text-green-400">{participatedEvents.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mr-4">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <p className="text-sm text-gray-400">Challenges Solved</p>
                <p className="text-2xl font-bold text-purple-400">{userStats?.challengesSolved || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg mr-4">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <p className="text-sm text-gray-400">Active Events</p>
                <p className="text-2xl font-bold text-orange-400">
                  {events && events.filter ? events.filter(e => e.status === 'ACTIVE').length : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            href="/events"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 p-4 rounded-xl text-center font-medium transition-all transform hover:scale-105 text-white"
          >
            🎯 Browse Events
          </Link>
          
          <Link
            href="/leaderboard"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 p-4 rounded-xl text-center font-medium transition-all transform hover:scale-105 text-white"
          >
            🏆 Leaderboard
          </Link>
          
          <Link
            href="/profile"
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 p-4 rounded-xl text-center font-medium transition-all transform hover:scale-105 text-white"
          >
            👤 View Profile
          </Link>

          {(session.user.role === 'ORGANIZER' || session.user.role === 'ADMIN') && (
            <Link
              href="/organizer"
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 p-4 rounded-xl text-center font-medium transition-all transform hover:scale-105 text-white"
            >
              ⚙️ Organizer Panel
            </Link>
          )}

          {session.user.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 p-4 rounded-xl text-center font-medium transition-all transform hover:scale-105 text-white"
            >
              🔧 Admin Panel
            </Link>
          )}
        </div>

        {/* Two Column Layout for Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Participated CTFs */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">My CTF Events</h2>
              <span className="text-sm text-gray-400 bg-white/10 px-3 py-1 rounded-full">
                {participatedEvents.length} Joined
              </span>
            </div>
            
            {participatedEvents.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <p className="text-gray-300 text-lg mb-2">No CTF events joined yet</p>
                <p className="text-gray-400 text-sm mb-4">Join your first CTF to start competing!</p>
                <Link
                  href="/events"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 text-white inline-block"
                >
                  Browse Events
                </Link>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {participatedEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-white">{event.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        event.isActive 
                          ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                          : 'bg-gray-500/20 text-gray-300 border border-gray-500/50'
                      }`}>
                        {event.isActive ? 'Active' : 'Ended'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Your Score</p>
                        <p className="text-blue-400 font-bold">{event.userScore} pts</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Your Rank</p>
                        <p className="text-purple-400 font-bold">#{event.userRank}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Progress</p>
                        <p className="text-green-400 font-bold">{event.solvedChallenges}/{event.totalChallenges}</p>
                      </div>
                      <div className="flex justify-end items-end">
                        {event.isActive && (
                          <Link
                            href={`/events/${event.id}`}
                            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                          >
                            Continue →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available Events */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Available Events</h2>
              <span className="text-sm text-gray-400 bg-white/10 px-3 py-1 rounded-full">
                {events ? events.length : 0} Total
              </span>
            </div>
            
            {!events || events.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎪</div>
                <p className="text-gray-300 text-lg mb-2">No events available</p>
                <p className="text-gray-400 text-sm">Check back later for new challenges!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {events.slice(0, 6).map((event) => (
                  <div
                    key={event.id}
                    className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          event.status === 'ACTIVE'
                            ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                            : event.status === 'UPCOMING'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                            : 'bg-gray-500/20 text-gray-300 border border-gray-500/50'
                        }`}
                      >
                        {event.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-3 line-clamp-2">{event.description}</p>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-400">
                        <span className="mr-3">👥 {event._count.participants}</span>
                        <span>🎯 {event._count.challenges}</span>
                      </div>
                      
                      {event.status === 'ACTIVE' && (
                        <Link
                          href={`/events/${event.id}`}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 text-white"
                        >
                          Join Event
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
                
                {events.length > 6 && (
                  <div className="text-center pt-4">
                    <Link
                      href="/events"
                      className="text-blue-400 hover:text-blue-300 font-medium"
                    >
                      View All Events →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* NFT Collection Preview */}
          <div className="lg:col-span-2">
            <UserNFTCollection compact={true} maxDisplay={3} />
          </div>
        </div>

        {/* Monad Network Information */}
        <div className="mb-8">
          <MonadNetworkInfo />
        </div>
      </div>
    </div>
  )
}
