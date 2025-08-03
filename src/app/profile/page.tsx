"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import type { ApiResponse, UserRole, NFTMetadata } from "@/types"
import OrganizerRequestForm from "@/components/OrganizerRequestForm"
import { useValidatedSession } from "@/hooks/useValidatedSession"
import MatrixBackground from "@/components/ui/effects/MatrixBackground"
import {
  FaUserShield,
  FaUserCog,
  FaTrophy,
  FaCalendarCheck,
  FaTasks,
  FaChartBar,
  FaWallet,
  FaEdit,
  FaSave,
  FaTimes,
  FaUserSecret,
  FaUserCircle,
  FaEnvelope,
  FaCrown,
  FaCoins,
  FaCube,
  FaStar,
  FaGem,
  FaFire,
} from "react-icons/fa"
import { motion, AnimatePresence } from "framer-motion"

// --- Type definitions ---
interface UserProfile {
  id: string
  username: string
  email: string
  role: UserRole
  walletAddress?: string | null
  totalScore: number
  createdAt: Date
}

interface UserStats {
  totalEvents: number
  totalSolves: number
  averageRank: number
  nftsEarned: NFTMetadata[]
}

export default function Profile() {
  const { data: session, status } = useValidatedSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [editedWallet, setEditedWallet] = useState("")

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }
    fetchProfileData()
  }, [session, status, router])

  const fetchProfileData = async () => {
    try {
      const profileResponse = await fetch("/api/user/profile")
      const profileData: ApiResponse<UserProfile> = await profileResponse.json()
      if (profileData.success && profileData.data) {
        setProfile(profileData.data)
        setEditedWallet(profileData.data.walletAddress || "")
      }

      const statsResponse = await fetch("/api/user/stats")
      const statsData: ApiResponse<UserStats> = await statsResponse.json()
      if (statsData.success && statsData.data) {
        setStats(statsData.data)
      }
    } catch (error) {
      console.error("Error fetching profile data:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateWalletAddress = async () => {
    // Validate wallet address format
    if (editedWallet && !editedWallet.match(/^0x[a-fA-F0-9]{40}$/)) {
      alert('Please enter a valid Ethereum wallet address (0x followed by 40 hexadecimal characters)');
      return;
    }

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: editedWallet || null,
        }),
      })
      const data: ApiResponse<any> = await response.json()
      if (data.success) {
        setProfile((prev) => (prev ? { ...prev, walletAddress: editedWallet || null } : null))
        setEditMode(false)
      } else {
        alert(data.error || "Failed to update wallet address")
      }
    } catch (error) {
      console.error("Error updating wallet:", error)
      alert("An error occurred while updating wallet address")
    }
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
            <p className="text-xl mb-2">Accessing Agent Profile...</p>
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

  if (!session || !profile) {
    return null
  }

  const getRoleBadge = (role: UserRole) => {
    const roleConfig = {
      ADMIN: {
        colors: "bg-red-500/20 text-red-300 border-red-500/30",
        icon: <FaUserShield className="w-3 h-3" />,
      },
      ORGANIZER: {
        colors: "bg-purple-500/20 text-purple-300 border-purple-500/30",
        icon: <FaUserCog className="w-3 h-3" />,
      },
      USER: {
        colors: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        icon: <FaUserCircle className="w-3 h-3" />,
      },
    }
    const config = roleConfig[role]
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.colors}`}
      >
        {config.icon}
        {role}
      </span>
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
                CT<span className="text-accent">NFT</span>
              </Link>
              <div className="flex items-center space-x-1 md:space-x-2">
                {["Dashboard", "Events", "Leaderboard"].map((item) => (
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
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-md rounded-2xl p-8 border border-primary/20 mb-12 shadow-xl shadow-primary/5"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
              <div className="text-center sm:text-left">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-2 border-primary/30 mx-auto sm:mx-0 mb-4 animate-pulse-slow">
                  <FaUserCircle className="w-12 h-12 text-accent" />
                </div>
                <h1 className="text-4xl font-bold font-mono text-primary mb-2">
                  {profile.username}
                  <span className="text-accent text-opacity-70 text-sm ml-2">#{profile.id.slice(-6)}</span>
                </h1>
                <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-2">
                  <FaEnvelope className="w-4 h-4" /> {profile.email}
                </p>
                <div className="flex items-center justify-center sm:justify-start mt-4">
                  {getRoleBadge(profile.role)}
                </div>
                {(profile.role === "ORGANIZER" || profile.role === "ADMIN") && (
                  <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-6">
                    <Link
                      href="/organizer"
                      className="inline-flex items-center px-4 py-2 bg-purple-600/20 border border-purple-500/30 text-purple-300 rounded-lg text-sm font-medium hover:bg-purple-600/30 transition-colors hover:shadow-md hover:shadow-purple-500/10"
                    >
                      <FaUserCog className="w-4 h-4 mr-2" /> Organizer Panel
                    </Link>
                    {profile.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        className="inline-flex items-center px-4 py-2 bg-red-600/20 border border-red-500/30 text-red-300 rounded-lg text-sm font-medium hover:bg-red-600/30 transition-colors hover:shadow-md hover:shadow-red-500/10"
                      >
                        <FaUserShield className="w-4 h-4 mr-2" /> Admin Control
                      </Link>
                    )}
                  </div>
                )}
              </div>
              <div className="text-center sm:text-right mt-6 sm:mt-0">
                <div className="text-5xl font-bold font-mono text-accent mb-2 animate-pulse-fast">
                  {profile.totalScore.toLocaleString()}
                </div>
                <div className="text-muted-foreground text-lg">Total Points</div>
                <p className="text-muted-foreground/70 text-xs mt-2">
                  Agent since: {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Wallet Address Section */}
            <div className="border-t border-primary/10 pt-6 mt-6">
              <h3 className="text-xl font-bold font-mono text-primary mb-4 flex items-center gap-3">
                <FaWallet className="text-accent" /> Wallet Address
              </h3>
              {editMode ? (
                <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
                  <input
                    type="text"
                    value={editedWallet}
                    onChange={(e) => setEditedWallet(e.target.value)}
                    placeholder="0x... (for NFT rewards)"
                    className="flex-1 px-4 py-2.5 bg-background/70 border border-primary/20 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 shadow-inner shadow-primary/5"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={updateWalletAddress}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground p-3 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 hover:scale-105 shadow-md shadow-primary/10"
                    >
                      <FaSave /> <span className="hidden sm:inline">Save</span>
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="bg-muted hover:bg-muted/80 text-muted-foreground p-3 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 hover:scale-105 shadow-md shadow-primary/10"
                    >
                      <FaTimes /> <span className="hidden sm:inline">Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-muted-foreground font-mono text-sm break-all p-2 rounded-md bg-primary/5 border border-primary/10">
                    {profile.walletAddress || "No wallet address set"}
                  </span>
                  <button
                    onClick={() => setEditMode(true)}
                    className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 hover:scale-105 shadow-md shadow-primary/10"
                  >
                    <FaEdit /> Edit Address
                  </button>
                </div>
              )}
              <p className="text-muted-foreground/70 text-xs mt-3">
                Connect your wallet to receive exclusive NFT rewards automatically.
              </p>
            </div>

            {profile.role === "USER" && (
              <div className="border-t border-primary/10 pt-6 mt-6">
                <h3 className="text-xl font-bold font-mono text-primary mb-4 flex items-center gap-3">
                  <FaUserSecret className="text-accent" /> Request Organizer Access
                </h3>
                <div className="bg-background/70 rounded-xl p-6 border border-primary/10 shadow-inner shadow-primary/5">
                  <OrganizerRequestForm
                    onSuccess={() => {
                      alert("Request submitted successfully!")
                    }}
                  />
                </div>
              </div>
            )}
          </motion.div>

          {/* User Stats */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            >
              <StatCard
                icon={<FaCalendarCheck />}
                title="Events Participated"
                value={stats.totalEvents}
                color="text-accent"
                bgColor="from-accent/20 to-accent/10 border-accent/30"
                delay={0}
              />
              <StatCard
                icon={<FaTasks />}
                title="Total Solves"
                value={stats.totalSolves}
                color="text-green-400"
                bgColor="from-green-500/20 to-green-600/10 border-green-500/30"
                delay={0.05}
              />
              <StatCard
                icon={<FaChartBar />}
                title="Average Rank"
                value={stats.averageRank ? `#${stats.averageRank.toFixed(1)}` : "N/A"}
                color="text-yellow-400"
                bgColor="from-yellow-500/20 to-yellow-600/10 border-yellow-500/30"
                delay={0.1}
              />
            </motion.div>
          )}

          {/* NFT Collection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-background/60 backdrop-blur-md rounded-2xl p-8 border border-primary/20 shadow-xl shadow-primary/5"
          >
            <h2 className="text-2xl font-bold font-mono text-primary mb-6 flex items-center gap-3">
              <FaTrophy className="text-accent" /> NFT Collection
            </h2>
            {stats?.nftsEarned && stats.nftsEarned.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {stats.nftsEarned.map((nft, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <NftCard nft={nft} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <EmptyState
                icon={<FaCube className="w-12 h-12" />}
                message="No NFTs collected yet."
                description="Participate in events and achieve top ranks to earn exclusive NFT rewards!"
                action={{ href: "/events", text: "Find an Event" }}
              />
            )}
          </motion.div>
        </main>
      </div>

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.02);
            opacity: 0.9;
          }
        }

        @keyframes pulse-fast {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.01);
            opacity: 0.95;
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s infinite ease-in-out;
        }

        .animate-pulse-fast {
          animation: pulse-fast 2s infinite ease-in-out;
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
    className={`bg-gradient-to-br ${bgColor} backdrop-blur-sm rounded-xl p-6 border hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:scale-105`}
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

const NftCard = ({ nft }: { nft: NFTMetadata }) => {
  const tierStyles = {
    DIAMOND: {
      gradient: "from-yellow-500 to-orange-500",
      text: "text-yellow-200",
      border: "border-yellow-400",
      icon: <FaCrown className="w-10 h-10" />,
      glow: "shadow-yellow-500/30",
    },
    PLATINUM: {
      gradient: "from-purple-500 to-pink-500",
      text: "text-purple-200",
      border: "border-purple-400",
      icon: <FaGem className="w-10 h-10" />,
      glow: "shadow-purple-500/30",
    },
    GOLD: {
      gradient: "from-blue-500 to-cyan-500",
      text: "text-blue-200",
      border: "border-blue-400",
      icon: <FaStar className="w-10 h-10" />,
      glow: "shadow-blue-500/30",
    },
    SILVER: {
      gradient: "from-gray-400 to-gray-500",
      text: "text-gray-200",
      border: "border-gray-400",
      icon: <FaCoins className="w-10 h-10" />,
      glow: "shadow-gray-500/30",
    },
    BRONZE: {
      gradient: "from-amber-600 to-amber-700",
      text: "text-amber-200",
      border: "border-amber-500",
      icon: <FaCube className="w-10 h-10" />,
      glow: "shadow-amber-500/30",
    },
  }
  const tier = nft.tier as keyof typeof tierStyles
  const currentTierStyle = tierStyles[tier] || tierStyles.BRONZE

  // NFT Contract address from deployment
  const NFT_CONTRACT_ADDRESS = "0x18ee5C7a2e7339705Eff8f96717C1085A4B69D27"
  const explorerUrl = nft.tokenId 
    ? `https://testnet.monadexplorer.com/nft/${NFT_CONTRACT_ADDRESS}/${nft.tokenId}`
    : null

  const handleNftClick = () => {
    if (explorerUrl) {
      window.open(explorerUrl, '_blank')
    }
  }

  return (
    <div
      onClick={handleNftClick}
      className={`bg-background/70 rounded-xl p-6 border border-primary/10 overflow-hidden shadow-lg shadow-primary/5 hover:shadow-xl ${currentTierStyle.glow} transition-all duration-300 hover:scale-[1.02] relative group ${explorerUrl ? 'cursor-pointer' : ''}`}
    >
      <div
        className={`w-full h-32 rounded-lg mb-4 flex items-center justify-center text-5xl bg-gradient-to-br ${currentTierStyle.gradient} ${currentTierStyle.text} relative overflow-hidden`}
      >
        {currentTierStyle.icon}
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300 mix-blend-overlay"></div>
        {explorerUrl && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-background/80 backdrop-blur-sm rounded-lg p-2">
              <FaFire className="w-4 h-4 text-accent" />
            </div>
          </div>
        )}
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2 truncate">{nft.eventName}</h3>
      <div
        className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${currentTierStyle.border} ${currentTierStyle.text} bg-gradient-to-r ${currentTierStyle.gradient}/20`}
      >
        {nft.tier}
      </div>
      <div className="space-y-2 text-sm mt-4">
        <p className="text-muted-foreground flex items-center gap-2">
          <FaTrophy className="w-4 h-4 text-accent" /> Rank:{" "}
          <span className="text-accent font-mono font-bold">#{nft.rank}</span>
        </p>
        <p className="text-muted-foreground flex items-center gap-2">
          <FaCoins className="w-4 h-4 text-primary" /> Score:{" "}
          <span className="text-primary font-mono font-bold">{nft.score} pts</span>
        </p>
        <p className="text-muted-foreground text-xs flex items-center gap-2">
          <FaCalendarCheck className="w-3 h-3 text-muted-foreground/70" /> Minted:{" "}
          <span className="text-foreground/80 font-mono">{new Date(nft.mintTimestamp).toLocaleDateString()}</span>
        </p>
        {nft.tokenId && (
          <p className="text-muted-foreground text-xs flex items-center gap-2">
            <FaCube className="w-3 h-3 text-accent" /> Token ID:{" "}
            <span className="text-accent font-mono font-bold">#{nft.tokenId}</span>
          </p>
        )}
        {explorerUrl && (
          <p className="text-muted-foreground text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Click to view on Monad Explorer →
          </p>
        )}
      </div>
    </div>
  )
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
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-background font-bold rounded-lg hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:scale-105"
      >
        <FaFire className="w-4 h-4" />
        {action.text}
      </Link>
    )}
  </motion.div>
)
