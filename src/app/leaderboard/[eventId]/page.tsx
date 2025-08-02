"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import type { ApiResponse, LeaderboardEntry } from "@/types"
import MatrixBackground from "@/components/ui/effects/MatrixBackground"
import { FaTrophy, FaMedal, FaAward, FaCrown, FaUser, FaCalendarAlt, FaHashtag } from "react-icons/fa"
import { motion, AnimatePresence } from "framer-motion"

interface EventLeaderboardPageProps {
  params: {
    eventId: string
  }
}

export default function EventLeaderboardPage({ params }: EventLeaderboardPageProps) {
  const { eventId } = params
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // In a real app, you'd fetch event details
  const [eventName, setEventName] = useState(`Event #${eventId.slice(0, 6)}...`)

  useEffect(() => {
    if (!eventId) return

    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/events/${eventId}/leaderboard`)
        const data: ApiResponse<LeaderboardEntry[]> = await response.json()

        if (data.success && data.data) {
          setLeaderboard(data.data)
          // You might also fetch and set the event name here
        } else {
          setError(data.error || "Failed to fetch leaderboard for this event")
        }
      } catch (err) {
        setError("An error occurred while fetching the event leaderboard.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [eventId])

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <FaCrown className="w-5 h-5 text-yellow-400" />
    if (rank === 2) return <FaTrophy className="w-4 h-4 text-gray-300" />
    if (rank === 3) return <FaMedal className="w-4 h-4 text-amber-400" />
    return <FaAward className="w-4 h-4 text-primary/60" />
  }

  const getRankStyles = (rank: number) => {
    if (rank === 1)
      return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/50 text-yellow-300 shadow-lg shadow-yellow-500/20"
    if (rank === 2)
      return "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50 text-gray-300 shadow-lg shadow-gray-400/20"
    if (rank === 3)
      return "bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/50 text-amber-400 shadow-lg shadow-amber-600/20"
    return "bg-gradient-to-r from-primary/10 to-primary/20 border-primary/30 text-muted-foreground"
  }

  const getRowStyles = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-500/5 to-transparent border-l-4 border-l-yellow-500/50"
    if (rank === 2) return "bg-gradient-to-r from-gray-400/5 to-transparent border-l-4 border-l-gray-400/50"
    if (rank === 3) return "bg-gradient-to-r from-amber-600/5 to-transparent border-l-4 border-l-amber-600/50"
    return "hover:bg-primary/5 transition-colors duration-200"
  }

  if (loading) {
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
            <p className="text-xl mb-2">Loading Event Rankings...</p>
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
                {["Dashboard", "Events", "Profile"].map((item) => (
                  <Link
                    key={item}
                    href={`/${item.toLowerCase()}`}
                    className="text-muted-foreground hover:text-primary px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-primary/10 relative group"
                  >
                    {item}
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
            <div className="inline-flex items-center gap-4 mb-6 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
              <FaTrophy className="text-4xl text-yellow-400 animate-pulse" />
              <h1 className="text-5xl font-bold font-mono text-primary">{eventName} Leaderboard</h1>
              <FaTrophy className="text-4xl text-yellow-400 animate-pulse" />
            </div>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
              Top agents for this specific event.
              <Link href="/leaderboard" className="text-accent font-semibold hover:underline"> View Global Leaderboard.</Link>
            </p>
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
                  <p className="text-red-300 text-center font-medium">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-background/60 backdrop-blur-md rounded-2xl border border-primary/20 shadow-2xl shadow-primary/5 overflow-hidden"
          >
            {leaderboard.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-primary/20">
                    <tr>
                      <th
                        scope="col"
                        className="py-6 pl-8 pr-3 text-left text-sm font-bold text-primary uppercase tracking-wider"
                      >
                        <div className="flex items-center gap-2">
                          <FaHashtag className="w-4 h-4" />
                          Rank
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-6 text-left text-sm font-bold text-primary uppercase tracking-wider"
                      >
                        <div className="flex items-center gap-2">
                          <FaUser className="w-4 h-4" />
                          Agent
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-6 text-left text-sm font-bold text-primary uppercase tracking-wider"
                      >
                        Solves
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-6 text-left text-sm font-bold text-primary uppercase tracking-wider"
                      >
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="w-4 h-4" />
                          Last Activity
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="py-6 pl-3 pr-8 text-right text-sm font-bold text-primary uppercase tracking-wider"
                      >
                        Score
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary/10">
                    <AnimatePresence>
                      {leaderboard.map((entry, index) => (
                        <motion.tr
                          key={entry.userId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`${getRowStyles(entry.rank)} transition-all duration-300 hover:shadow-lg hover:shadow-primary/5`}
                        >
                          <td className="py-6 pl-8 pr-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex items-center justify-center w-12 h-12 rounded-xl border-2 font-bold text-sm ${getRankStyles(entry.rank)}`}
                              >
                                {entry.rank <= 3 ? getRankIcon(entry.rank) : entry.rank}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/30">
                                <FaUser className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <div className="text-lg font-bold text-foreground font-mono">{entry.username}</div>
                                <div className="text-xs text-muted-foreground">Agent #{entry.userId.slice(-6)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                                <span className="text-accent font-bold text-sm">{entry.solveCount}</span>
                              </div>
                              <span className="text-muted-foreground text-sm">missions</span>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <div className="text-sm text-muted-foreground">
                              {entry.lastSolveTime ? (
                                <div>
                                  <div className="font-medium">
                                    {new Date(entry.lastSolveTime).toLocaleDateString()}
                                  </div>
                                  <div className="text-xs opacity-75">
                                    {new Date(entry.lastSolveTime).toLocaleTimeString()}
                                  </div>
                                </div>
                              ) : (
                                <span className="italic opacity-60">No activity</span>
                              )}
                            </div>
                          </td>
                          <td className="py-6 pl-3 pr-8 text-right">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/30">
                              <span className="text-2xl font-mono font-bold text-accent">
                                {entry.totalScore.toLocaleString()}
                              </span>
                              <span className="text-xs text-accent/70 uppercase tracking-wider">pts</span>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                <div className="mb-6">
                  <FaTrophy className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-muted-foreground mb-2">No Rankings Yet for this Event</h3>
                  <p className="text-muted-foreground/70 text-lg max-w-md mx-auto">
                    Be the first to make your mark. Participate now!
                  </p>
                </div>
                <Link
                  href={`/events/${eventId}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-background font-bold rounded-lg hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:scale-105"
                >
                  <FaAward className="w-4 h-4" />
                  Go to Event
                </Link>
              </motion.div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  )
}