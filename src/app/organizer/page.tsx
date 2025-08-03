"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import EventCreateForm from "@/components/EventCreateForm"
import MatrixBackground from "@/components/ui/effects/MatrixBackground"
import {
  FaCalendarPlus,
  FaCalendarAlt,
  FaPlay,
  FaStop,
  FaEdit,
  FaEye,
  FaUsers,
  FaClipboardList,
  FaUserCog,
  FaUserShield,
  FaRocket,
  FaClock,
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
  challenges?: any[] // Assuming challenges might be present for count
  _count?: {
    challenges: number
  }
  organizer: {
    username: string
  }
}

export default function OrganizerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [events, setEvents] = useState<CTFEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [startingEvent, setStartingEvent] = useState<string | null>(null)
  const [endingEvent, setEndingEvent] = useState<string | null>(null)

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }
    if (session.user?.role !== "ORGANIZER" && session.user?.role !== "ADMIN") {
      router.push("/dashboard")
      return
    }
    fetchMyEvents()
  }, [session, status, router])

  const fetchMyEvents = async () => {
    try {
      const response = await fetch("/api/events/organized-events")
      if (response.ok) {
        const data = await response.json()
        setEvents(data.data || [])
      } else {
        console.error("Failed to fetch organized events:", response.status)
      }
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartEvent = async (eventId: string) => {
    if (
      !confirm(
        "Are you sure you want to start this event now? This will make it immediately available to participants.",
      )
    ) {
      return
    }
    setStartingEvent(eventId)
    try {
      const response = await fetch(`/api/events/${eventId}/start`, {
        method: "POST",
      })
      const data = await response.json()
      if (response.ok) {
        alert("Event started successfully!")
        // Refresh the events list
        fetchMyEvents()
      } else {
        alert(data.error || "Failed to start event")
      }
    } catch (error) {
      console.error("Error starting event:", error)
      alert("An error occurred while starting the event")
    } finally {
      setStartingEvent(null)
    }
  }

  const handleEndEvent = async (eventId: string) => {
    if (
      !confirm(
        "Are you sure you want to end this event now? This action cannot be undone and will immediately stop the event.",
      )
    ) {
      return
    }
    setEndingEvent(eventId)
    try {
      const response = await fetch(`/api/events/${eventId}/end`, {
        method: "POST",
      })
      const data = await response.json()
      if (response.ok) {
        alert("Event ended successfully!")
        // Refresh the events list
        fetchMyEvents()
      } else {
        alert(data.error || "Failed to end event")
      }
    } catch (error) {
      console.error("Error ending event:", error)
      alert("An error occurred while ending the event")
    } finally {
      setEndingEvent(null)
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
            <p className="text-xl mb-2">Accessing Organizer Console...</p>
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

  if (!session || (session.user?.role !== "ORGANIZER" && session.user?.role !== "ADMIN")) {
    return null
  }

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
                CT<span className="text-accent">NFT</span>
              </Link>
              <div className="flex items-center space-x-1 md:space-x-2">
                {["Events", "Profile"].map((item) => (
                  <Link
                    key={item}
                    href={`/${item.toLowerCase()}`}
                    className="text-muted-foreground hover:text-primary px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-primary/10 relative group"
                  >
                    {item}
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
                  </Link>
                ))}
                {session.user?.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="text-muted-foreground hover:text-primary px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-primary/10 relative group"
                  >
                    Admin Panel
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
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
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30">
                {session.user?.role === "ADMIN" ? (
                  <FaUserShield className="w-8 h-8 text-accent" />
                ) : (
                  <FaUserCog className="w-8 h-8 text-accent" />
                )}
              </div>
              <div>
                <h1 className="text-5xl font-bold font-mono text-primary">
                  {session.user?.role === "ADMIN" ? "Admin" : "Organizer"} Console
                </h1>
                <p className="text-muted-foreground text-xl mt-2">
                  Manage your CTF events and challenges with precision.
                </p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Create Event Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-background/60 backdrop-blur-md rounded-2xl p-8 border border-primary/20 shadow-xl shadow-primary/5"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-accent/20">
                  <FaCalendarPlus className="w-6 h-6 text-accent" />
                </div>
                <h2 className="text-2xl font-bold font-mono text-primary">Deploy New Mission</h2>
              </div>
              <EventCreateForm onSuccess={fetchMyEvents} />
            </motion.div>

            {/* My Events */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-background/60 backdrop-blur-md rounded-2xl p-8 border border-primary/20 shadow-xl shadow-primary/5"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-primary/20">
                  <FaCalendarAlt className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold font-mono text-primary">My Deployed Missions</h2>
              </div>
              <AnimatePresence mode="wait">
                {events.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-center py-12"
                  >
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center border border-primary/20">
                      <FaRocket className="w-12 h-12 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">No Missions Created Yet</h3>
                    <p className="text-muted-foreground text-lg max-w-md mx-auto">
                      Start by deploying your first CTF mission using the form on the left.
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-6 max-h-[32rem] overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar">
                    <AnimatePresence>
                      {events.map((event, index) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-background/70 rounded-xl p-6 border border-primary/10 hover:border-accent/50 transition-all duration-300 group hover:shadow-lg hover:shadow-primary/5"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-foreground group-hover:text-accent transition-colors line-clamp-1">
                              {event.name}
                            </h3>
                            {getStatusBadge(event.status)}
                          </div>
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">
                            {event.description}
                          </p>
                          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground border-t border-primary/10 pt-4 mt-4">
                            <div className="flex items-center gap-2">
                              <FaUsers className="w-4 h-4 text-accent" /> Participants:{" "}
                              <span className="text-foreground font-bold">{event.participantCount || 0}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaClipboardList className="w-4 h-4 text-accent" /> Challenges:{" "}
                              <span className="text-foreground font-bold">
                                {event.challenges?.length || event._count?.challenges || 0}
                              </span>
                            </div>
                            <div className="col-span-2 text-xs text-muted-foreground/70 mt-2">
                              <div className="flex items-center gap-2">
                                <FaClock className="w-3 h-3" />
                                Starts: {new Date(event.startTime).toLocaleString()}
                              </div>
                              <div className="flex items-center gap-2">
                                <FaClock className="w-3 h-3" />
                                Ends: {new Date(event.endTime).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap justify-end gap-3 mt-6">
                            {event.status === "UPCOMING" && (
                              <button
                                onClick={() => handleStartEvent(event.id)}
                                disabled={startingEvent === event.id}
                                className="inline-flex items-center gap-2 bg-green-600/20 hover:bg-green-600/30 disabled:bg-green-800/20 disabled:cursor-not-allowed text-green-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-green-500/30 shadow-md shadow-green-500/10"
                              >
                                <FaPlay /> {startingEvent === event.id ? "Starting..." : "Start Now"}
                              </button>
                            )}
                            {event.status === "ACTIVE" && (
                              <button
                                onClick={() => handleEndEvent(event.id)}
                                disabled={endingEvent === event.id}
                                className="inline-flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 disabled:bg-red-800/20 disabled:cursor-not-allowed text-red-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-red-500/30 shadow-md shadow-red-500/10"
                              >
                                <FaStop /> {endingEvent === event.id ? "Ending..." : "End Now"}
                              </button>
                            )}
                            <Link
                              href={`/events/${event.id}/challenges`}
                              className="inline-flex items-center gap-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-purple-500/30 shadow-md shadow-purple-500/10"
                            >
                              <FaEdit /> Manage Challenges
                            </Link>
                            <Link
                              href={`/events/${event.id}`}
                              className="inline-flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-blue-500/30 shadow-md shadow-blue-500/10"
                            >
                              <FaEye /> View Event
                            </Link>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </AnimatePresence>
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
