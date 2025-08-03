"use client"

import type React from "react"

import { useValidatedSession } from "@/hooks/useValidatedSession"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import {
  FaTrophy,
  FaCalendarCheck,
  FaLaptopCode,
  FaChartLine,
  FaRocket,
  FaFire,
  FaUsers,
  FaThLarge,
  FaArrowRight,
  FaCrown,
  FaMedal,
  FaPlay,
  FaClock,
  FaCheckCircle,
  FaEye,
  FaTh,
  FaUserShield,
  FaUserCog,
  FaUser,
} from "react-icons/fa"
import { motion, AnimatePresence } from "framer-motion"

// Import the themed components for a consistent look
import MatrixBackground from "@/components/ui/effects/MatrixBackground"
import TerminalPrompt from "@/components/ui/effects/TerminalPrompt"

// --- Type definitions ---
interface AvailableEvent {
  id: string
  title: string
  description: string
  status: "UPCOMING" | "ACTIVE" | "ENDED"
  participantCount: number
  _count: {
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
  isActive: boolean
  userScore: number
  userRank: number
  totalChallenges: number
  solvedChallenges: number
}

export default function Dashboard() {
  const { data: session, status } = useValidatedSession()
  const router = useRouter()
  const [availableEvents, setAvailableEvents] = useState<AvailableEvent[]>([])
  const [participatedEvents, setParticipatedEvents] = useState<ParticipatedEvent[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }

    const fetchData = async () => {
      try {
        const [availableRes, participatedRes, statsRes] = await Promise.all([
          fetch("/api/events/my-events"), // Fetches events I'm participating in (active ones only)
          fetch("/api/events/my-events"), // Fetches participated events
          fetch("/api/user/stats"),
        ])

        const availableData = await availableRes.json()
        // Filter for only active events (events that are currently running)
        const activeEvents = (availableData.events || []).filter((event: any) => {
          return event.status === "ACTIVE"
        })
        setAvailableEvents(activeEvents)

        const participatedData = await participatedRes.json()
        setParticipatedEvents(participatedData.events || [])

        const statsData = await statsRes.json()
        setUserStats(statsData.stats || null)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setAvailableEvents([])
        setParticipatedEvents([])
        setUserStats(null)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session, status, router])

  if (status === "loading" || loading) {
    return (
      <div className="relative min-h-screen bg-background flex items-center justify-center">
        <MatrixBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex flex-col items-center gap-6 text-primary font-mono"
        >
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-primary/20 border-t-accent"></div>
            <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-transparent border-t-primary animate-pulse"></div>
          </div>
          <div className="text-center">
            <p className="text-xl mb-2">Initializing Command Center...</p>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
              <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <FaCrown className="w-5 h-5 text-yellow-400" />
    if (rank <= 3) return <FaMedal className="w-5 h-5 text-accent" />
    if (rank <= 10) return <FaTrophy className="w-5 h-5 text-primary" />
    return null
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      <MatrixBackground />
      <TerminalPrompt />
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="bg-background/90 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50 shadow-lg shadow-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link
                href="/"
                className="text-2xl font-bold font-mono text-primary hover:text-accent transition-all duration-300"
              >
                CT<span className="text-accent">NFT</span>
              </Link>
              <div className="flex items-center space-x-1 md:space-x-2">
                {["Events", "Leaderboard", "Profile"].map((item) => (
                  <Link
                    key={item}
                    href={`/${item.toLowerCase()}`}
                    className="text-muted-foreground hover:text-primary px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-primary/10 relative group"
                  >
                    {item}
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
                  </Link>
                ))}
                
                {/* Role-based admin/organizer buttons */}
                {session?.user?.role === "ADMIN" && (
                  <>
                    <Link
                      href="/admin"
                      className="text-red-300 hover:text-red-400 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-red-500/10 flex items-center gap-2"
                    >
                      <FaUserShield className="w-4 h-4" />
                      <span className="hidden sm:inline">Admin</span>
                    </Link>
                    <Link
                      href="/organizer"
                      className="text-purple-300 hover:text-purple-400 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-purple-500/10 flex items-center gap-2"
                    >
                      <FaUserCog className="w-4 h-4" />
                      <span className="hidden sm:inline">Organizer</span>
                    </Link>
                  </>
                )}
                
                {session?.user?.role === "ORGANIZER" && (
                  <Link
                    href="/organizer"
                    className="text-purple-300 hover:text-purple-400 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-purple-500/10 flex items-center gap-2"
                  >
                    <FaUserCog className="w-4 h-4" />
                    <span className="hidden sm:inline">Organizer</span>
                  </Link>
                )}

                <Link
                  href="/api/auth/signout"
                  className="text-muted-foreground hover:text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-red-500/10"
                >
                  Sign Out
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-md rounded-2xl p-8 border border-primary/20 mb-12 shadow-xl shadow-primary/5"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-2 border-primary/30">
                <FaRocket className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h1 className="text-4xl font-bold font-mono text-primary mb-2">
                  Welcome back, <span className="text-accent">{session.user.username}</span>!
                </h1>
                <p className="text-muted-foreground text-lg">
                  Your command center is ready. Time to dominate the cyber battlefield.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            <StatCard
              icon={<FaTrophy />}
              title="Total Score"
              value={userStats?.totalScore?.toLocaleString() || "0"}
              color="text-primary"
              bgColor="from-primary/20 to-primary/10 border-primary/30"
              delay={0}
            />
            <StatCard
              icon={<FaCalendarCheck />}
              title="Events Joined"
              value={participatedEvents.length}
              color="text-accent"
              bgColor="from-accent/20 to-accent/10 border-accent/30"
              delay={0.05}
            />
            <StatCard
              icon={<FaLaptopCode />}
              title="Challenges Solved"
              value={userStats?.challengesSolved || 0}
              color="text-green-400"
              bgColor="from-green-500/20 to-green-600/10 border-green-500/30"
              delay={0.1}
            />
            <StatCard
              icon={<FaChartLine />}
              title="Global Rank"
              value={userStats?.rank ? `#${userStats.rank}` : "N/A"}
              color="text-yellow-400"
              bgColor="from-yellow-500/20 to-yellow-600/10 border-yellow-500/30"
              delay={0.15}
              rankIcon={userStats?.rank ? getRankIcon(userStats.rank) : null}
            />
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* My Missions */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-background/60 backdrop-blur-md rounded-2xl p-8 border border-primary/20 shadow-xl shadow-primary/5"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-accent/20">
                  <FaFire className="w-6 h-6 text-accent" />
                </div>
                <h2 className="text-2xl font-bold font-mono text-primary">My Active Missions</h2>
              </div>
              <div className="space-y-4 max-h-[32rem] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence>
                  {participatedEvents.length > 0 ? (
                    participatedEvents.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <EventCard event={event} type="participated" />
                      </motion.div>
                    ))
                  ) : (
                    <EmptyState
                      icon={<FaRocket className="w-12 h-12" />}
                      message="No active missions yet."
                      description="Join your first mission to start earning points and climbing the ranks."
                      action={{ href: "/events", text: "Browse Missions" }}
                    />
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Active Missions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-background/60 backdrop-blur-md rounded-2xl p-8 border border-primary/20 shadow-xl shadow-primary/5"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <FaThLarge className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold font-mono text-primary">Active Missions</h2>
                </div>
                <Link
                  href="/events"
                  className="text-accent hover:text-accent/80 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all duration-200"
                >
                  View All <FaArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-4 max-h-[32rem] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence>
                  {availableEvents.length > 0 ? (
                    availableEvents.slice(0, 6).map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <EventCard event={event} type="available" />
                      </motion.div>
                    ))
                  ) : (
                    <EmptyState
                      icon={<FaEye className="w-12 h-12" />}
                      message="No active missions."
                      description="Join an event to start your cyber warfare operations."
                    />
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </main>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(var(--primary), 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(var(--accent), 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(var(--accent), 0.7);
        }
      `}</style>
    </div>
  )
}

// --- Enhanced Reusable Components ---
const StatCard = ({
  icon,
  title,
  value,
  color,
  bgColor,
  delay,
  rankIcon,
}: {
  icon: React.ReactNode
  title: string
  value: string | number
  color: string
  bgColor: string
  delay: number
  rankIcon?: React.ReactNode
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    className={`bg-gradient-to-br ${bgColor} backdrop-blur-sm rounded-xl p-6 border hover:shadow-lg hover:shadow-primary/10 transition-all duration-300`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-background/20 rounded-lg text-2xl">{icon}</div>
      {rankIcon && <div className="animate-pulse">{rankIcon}</div>}
    </div>
    <div>
      <p className="text-sm text-muted-foreground font-medium mb-1">{title}</p>
      <p className={`text-3xl font-bold font-mono ${color}`}>{value}</p>
    </div>
  </motion.div>
)

const EventCard = ({ event, type }: { event: any; type: "participated" | "available" }) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: {
        colors: "bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300 border-green-500/50",
        icon: <FaPlay className="w-3 h-3" />,
        pulse: true,
      },
      UPCOMING: {
        colors: "bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 border-blue-500/50",
        icon: <FaClock className="w-3 h-3" />,
        pulse: false,
      },
      ENDED: {
        colors: "bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-300 border-gray-500/50",
        icon: <FaCheckCircle className="w-3 h-3" />,
        pulse: false,
      },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ENDED

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.colors} ${
          config.pulse ? "animate-pulse" : ""
        }`}
      >
        {config.icon}
        {status}
      </span>
    )
  }

  const statusKey = (event.status ?? (event.isActive ? "ACTIVE" : "ENDED")) as string

  // --- Card for "My Missions" (Participated Events) ---
  if (type === "participated") {
    const progress = event.totalChallenges > 0 ? (event.solvedChallenges / event.totalChallenges) * 100 : 0

    return (
      <div className="bg-background/80 backdrop-blur-sm rounded-xl p-6 border border-primary/10 hover:border-accent/50 transition-all duration-300 group hover:shadow-lg hover:shadow-primary/5">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold text-foreground group-hover:text-accent transition-colors line-clamp-1">
            {event.name}
          </h3>
          {getStatusBadge(statusKey)}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Progress</span>
            <span>
              {event.solvedChallenges}/{event.totalChallenges} challenges
            </span>
          </div>
          <div className="w-full bg-primary/10 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-accent to-accent/80 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="text-muted-foreground text-xs">Score</p>
            <p className="font-bold text-primary text-lg">{event.userScore}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground text-xs">Rank</p>
            <p className="font-bold text-accent text-lg">#{event.userRank || "N/A"}</p>
          </div>
          <div className="text-center">
            {(event.isActive || statusKey === "ACTIVE") && (
              <Link
                href={`/events/${event.id}`}
                className="inline-flex items-center gap-1 text-accent hover:text-accent/80 font-bold text-sm hover:gap-2 transition-all duration-200"
              >
                Continue <FaArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  // --- Card for "Available Missions" ---
  if (type === "available") {
    return (
      <Link href={`/events/${event.id}`} className="block group">
        <div className="bg-background/80 backdrop-blur-sm rounded-xl p-6 border border-primary/10 group-hover:border-accent/50 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/5">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-foreground group-hover:text-accent transition-colors line-clamp-1">
              {event.title}
            </h3>
            {getStatusBadge(statusKey)}
          </div>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">{event.description}</p>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <FaUsers className="w-4 h-4 text-accent" />
                <span className="text-accent font-bold">{event.participantCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <FaThLarge className="w-4 h-4 text-accent" />
                <span className="text-accent font-bold">{event._count.challenges}</span>
              </div>
            </div>
            <FaArrowRight className="w-4 h-4 text-accent group-hover:translate-x-1 transition-transform duration-200" />
          </div>
        </div>
      </Link>
    )
  }

  return null
}

const EmptyState = ({
  icon,
  message,
  description,
  action,
}: {
  icon: React.ReactNode
  message: string
  description?: string
  action?: { href: string; text: string }
}) => (
  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center border border-primary/20">
      <div className="text-muted-foreground/50">{icon}</div>
    </div>
    <h3 className="text-xl font-bold text-foreground mb-2">{message}</h3>
    {description && <p className="text-muted-foreground mb-6 max-w-sm mx-auto">{description}</p>}
    {action && (
      <Link
        href={action.href}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-background font-bold rounded-lg hover:shadow-lg hover:shadow-primary/25 transition-all duration-300"
      >
        <FaRocket className="w-4 h-4" />
        {action.text}
      </Link>
    )}
  </motion.div>
)
