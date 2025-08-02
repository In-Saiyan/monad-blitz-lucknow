"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import type { ApiResponse } from "@/types"
import MatrixBackground from "@/components/ui/effects/MatrixBackground"
import {
  FaUsers,
  FaCalendarAlt,
  FaClock,
  FaClipboardList,
  FaUserCog,
  FaUserShield,
  FaRocket,
  FaFire,
  FaHistory,
  FaEye,
  FaTrophy,
  FaPlay,
  FaCheckCircle,
} from "react-icons/fa"
import { motion, AnimatePresence } from "framer-motion"

interface CTFEvent {
  id: string
  name: string
  description: string
  startTime: string
  endTime: string
  status: "UPCOMING" | "ACTIVE" | "ENDED"
  participantCount: number
  _count: {
    challenges: number
  }
  organizer: {
    username: string
  }
}

export default function AllEventsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [events, setEvents] = useState<CTFEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "active" | "upcoming" | "ended">("all")

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }
    fetchEvents()
  }, [session, status, router, filter])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const url = `/api/events?status=${filter}`
      const response = await fetch(url)
      const data: ApiResponse<CTFEvent[]> = await response.json()

      if (data.success && data.data) {
        setEvents(data.data)
      } else {
        setError(data.error || "Failed to fetch events")
      }
    } catch (error) {
      console.error("Error fetching events:", error)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: "UPCOMING" | "ACTIVE" | "ENDED") => {
    const statusConfig = {
      ACTIVE: {
        colors:
          "bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300 border-green-500/50 shadow-lg shadow-green-500/20",
        icon: <FaPlay className="w-3 h-3" />,
        pulse: true,
      },
      UPCOMING: {
        colors:
          "bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 border-blue-500/50 shadow-lg shadow-blue-500/20",
        icon: <FaClock className="w-3 h-3" />,
        pulse: false,
      },
      ENDED: {
        colors: "bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-300 border-gray-500/50",
        icon: <FaCheckCircle className="w-3 h-3" />,
        pulse: false,
      },
    }

    const config = statusConfig[status]

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${config.colors} ${
          config.pulse ? "animate-pulse" : ""
        }`}
      >
        {config.icon}
        {status}
      </span>
    )
  }

  const getFilterIcon = (key: string) => {
    const icons = {
      all: <FaEye className="w-4 h-4" />,
      active: <FaFire className="w-4 h-4" />,
      upcoming: <FaRocket className="w-4 h-4" />,
      ended: <FaHistory className="w-4 h-4" />,
    }
    return icons[key as keyof typeof icons]
  }

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
            <p className="text-xl mb-2">Loading Mission Database...</p>
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

  const activeEvents = events.filter((e) => e.status === "ACTIVE").length
  const upcomingEvents = events.filter((e) => e.status === "UPCOMING").length
  const endedEvents = events.filter((e) => e.status === "ENDED").length

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <MatrixBackground />
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="bg-background/90 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50 shadow-lg shadow-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link
                href="/"
                className="text-2xl font-bold font-mono text-primary hover:text-accent transition-all duration-300 hover:scale-105"
              >
                CTF<span className="text-accent">NFT</span>
              </Link>
              <div className="flex items-center space-x-1 md:space-x-2">
                {["Dashboard", "Profile"].map((item) => (
                  <Link
                    key={item}
                    href={`/${item.toLowerCase()}`}
                    className="text-muted-foreground hover:text-primary px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-primary/10 relative group"
                  >
                    {item}
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
                  </Link>
                ))}
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
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30">
                <FaTrophy className="w-8 h-8 text-accent" />
              </div>
              <div>
                <h1 className="text-5xl font-bold font-mono text-primary">Mission Control</h1>
                <p className="text-muted-foreground text-xl mt-2">
                  Elite cyber warfare operations await your expertise.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
          >
            {[
              {
                value: events.length,
                label: "Total Missions",
                icon: <FaClipboardList className="w-6 h-6" />,
                color: "from-primary/20 to-primary/10 border-primary/30",
                textColor: "text-primary",
              },
              {
                value: activeEvents,
                label: "Active",
                icon: <FaFire className="w-6 h-6" />,
                color: "from-green-500/20 to-green-600/10 border-green-500/30",
                textColor: "text-green-400",
                pulse: true,
              },
              {
                value: upcomingEvents,
                label: "Upcoming",
                icon: <FaRocket className="w-6 h-6" />,
                color: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
                textColor: "text-blue-400",
              },
              {
                value: endedEvents,
                label: "Completed",
                icon: <FaHistory className="w-6 h-6" />,
                color: "from-gray-500/20 to-gray-600/10 border-gray-500/30",
                textColor: "text-gray-400",
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className={`bg-gradient-to-br ${stat.color} backdrop-blur-sm rounded-xl p-6 border ${
                  stat.pulse ? "animate-pulse" : ""
                } hover:shadow-lg hover:shadow-primary/10 transition-all duration-300`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.textColor}`}>{stat.icon}</div>
                  <div className={`text-3xl font-bold font-mono ${stat.textColor}`}>{stat.value}</div>
                </div>
                <div className="text-muted-foreground text-sm font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Filter and Admin Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-6"
          >
            {/* Filter Buttons */}
            <div className="flex space-x-1 bg-background/60 backdrop-blur-sm rounded-xl p-1.5 border border-primary/20 shadow-lg">
              {[
                { key: "all", label: "All Missions" },
                { key: "active", label: "Active" },
                { key: "upcoming", label: "Upcoming" },
                { key: "ended", label: "Completed" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    filter === key
                      ? "bg-gradient-to-r from-primary to-accent text-background shadow-lg shadow-primary/25"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                  }`}
                >
                  {getFilterIcon(key)}
                  {label}
                </button>
              ))}
            </div>

            {/* Admin/Organizer Panel */}
            {(session.user?.role === "ORGANIZER" || session.user?.role === "ADMIN") && (
              <Link
                href={session.user?.role === "ADMIN" ? "/admin" : "/organizer"}
                className="bg-gradient-to-r from-accent to-accent/80 text-background hover:from-accent/90 hover:to-accent/70 px-6 py-3 rounded-xl font-bold inline-flex items-center gap-3 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent/25"
              >
                {session.user?.role === "ADMIN" ? (
                  <FaUserShield className="w-5 h-5" />
                ) : (
                  <FaUserCog className="w-5 h-5" />
                )}
                {session.user?.role === "ADMIN" ? "Admin Control" : "Organizer Panel"}
              </Link>
            )}
          </motion.div>

          {/* Error State */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gradient-to-r from-red-900/50 to-red-800/30 border border-red-500/50 rounded-xl p-6 mb-8 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  <p className="text-red-300 font-medium">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Events Grid */}
          <AnimatePresence mode="wait">
            {events.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-background/60 backdrop-blur-sm rounded-2xl p-12 border border-primary/20 text-center"
              >
                <div className="mb-8">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/30">
                    <FaClipboardList className="w-12 h-12 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">No Missions Available</h3>
                  <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    {filter === "all"
                      ? "The mission database is currently empty. New operations will be deployed soon."
                      : `No ${filter} missions are currently available. Check other categories or return later.`}
                  </p>
                </div>
                <button
                  onClick={() => setFilter("all")}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-background font-bold rounded-lg hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:scale-105"
                >
                  <FaEye className="w-4 h-4" />
                  View All Missions
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link href={`/events/${event.id}`} className="block group h-full">
                      <div className="bg-background/60 backdrop-blur-sm rounded-2xl p-6 border border-primary/20 h-full flex flex-col justify-between group-hover:border-accent/50 group-hover:shadow-xl group-hover:shadow-primary/10 transition-all duration-300 group-hover:scale-[1.02]">
                        {/* Header */}
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-foreground group-hover:text-accent transition-colors duration-200 line-clamp-2">
                              {event.name}
                            </h3>
                            {getStatusBadge(event.status)}
                          </div>
                          <p className="text-muted-foreground text-sm mb-6 line-clamp-3 leading-relaxed">
                            {event.description}
                          </p>
                        </div>

                        {/* Stats */}
                        <div className="space-y-3 text-sm border-t border-primary/10 pt-6">
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <FaUserCog className="w-4 h-4 text-primary" />
                            </div>
                            <span>
                              <span className="text-foreground font-medium">
                                {event.organizer?.username || "Unknown"}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                              <FaCalendarAlt className="w-4 h-4 text-green-400" />
                            </div>
                            <span className="text-xs">
                              Starts:{" "}
                              <span className="text-foreground">{new Date(event.startTime).toLocaleString()}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                              <FaClock className="w-4 h-4 text-red-400" />
                            </div>
                            <span className="text-xs">
                              Ends: <span className="text-foreground">{new Date(event.endTime).toLocaleString()}</span>
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 pt-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <FaUsers className="w-4 h-4 text-accent" />
                              <span className="text-accent font-bold">{event.participantCount}</span>
                              <span className="text-xs">agents</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <FaClipboardList className="w-4 h-4 text-accent" />
                              <span className="text-accent font-bold">{event._count.challenges}</span>
                              <span className="text-xs">targets</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
