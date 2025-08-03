"use client"

import type React from "react"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { FaPlusSquare, FaSpinner, FaExclamationTriangle, FaInfoCircle, FaCalendarPlus } from "react-icons/fa"
import { motion } from "framer-motion"

interface EventCreateFormProps {
  onSuccess?: () => void
}

export default function EventCreateForm({ onSuccess }: EventCreateFormProps) {
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startTime: "",
    endTime: "",
    maxParticipants: 10000,
    joinDeadlineMinutes: 10,
  })

  const isAuthorized = session?.user?.role === "ORGANIZER" || session?.user?.role === "ADMIN"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      const result = await response.json()

      if (result.success) {
        setFormData({
          name: "",
          description: "",
          startTime: "",
          endTime: "",
          maxParticipants: 10000,
          joinDeadlineMinutes: 10,
        })
        onSuccess?.()
      } else {
        setError(result.error || "Failed to create event")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const getMinStartTime = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 30) // Minimum 30 minutes from now
    return formatDateTimeLocal(now)
  }

  if (!isAuthorized) {
    return (
      <div className="bg-yellow-900/50 border border-yellow-500/50 rounded-xl p-6 text-yellow-300 flex items-center gap-4 shadow-lg shadow-yellow-500/10">
        <FaExclamationTriangle className="w-6 h-6 text-yellow-400" />
        <p className="text-lg">
          You need organizer or admin privileges to create events.{" "}
          {session?.user?.role === "USER" && " You can request organizer access from your profile."}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-background/70 backdrop-blur-sm rounded-xl p-6 border border-primary/10 shadow-inner shadow-primary/5">
      <h3 className="text-2xl font-bold font-mono text-primary mb-6 flex items-center gap-3">
        <FaCalendarPlus className="text-accent" /> Create New Mission
      </h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-2">
            Mission Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-2.5 bg-background/50 border border-primary/20 rounded-lg shadow-sm text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
            placeholder="e.g., Quantum Cipher Challenge"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-muted-foreground mb-2">
            Description <span className="text-red-400">*</span>
          </label>
          <textarea
            id="description"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            className="w-full px-4 py-2.5 bg-background/50 border border-primary/20 rounded-lg shadow-sm text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
            placeholder="Describe the mission objectives, rules, and what agents can expect..."
            required
          />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="maxParticipants" className="block text-sm font-medium text-muted-foreground mb-2">
              Max Agents
            </label>
            <input
              type="number"
              id="maxParticipants"
              min="1"
              max="50000"
              value={formData.maxParticipants}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, maxParticipants: Number.parseInt(e.target.value) || 10000 }))
              }
              className="w-full px-4 py-2.5 bg-background/50 border border-primary/20 rounded-lg shadow-sm text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
              placeholder="10000 (platform default)"
            />
            <p className="text-xs text-muted-foreground/70 mt-2">Leave blank for platform default (10,000)</p>
          </div>
          <div>
            <label htmlFor="joinDeadlineMinutes" className="block text-sm font-medium text-muted-foreground mb-2">
              Join Deadline (minutes after start) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              id="joinDeadlineMinutes"
              min="0"
              max="120"
              value={formData.joinDeadlineMinutes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, joinDeadlineMinutes: Number.parseInt(e.target.value) || 10 }))
              }
              className="w-full px-4 py-2.5 bg-background/50 border border-primary/20 rounded-lg shadow-sm text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
              placeholder="10"
            />
            <p className="text-xs text-muted-foreground/70 mt-2">
              Participants can join 1 day before start until this many minutes after event begins
            </p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-muted-foreground mb-2">
              Start Time <span className="text-red-400">*</span>
            </label>
            <input
              type="datetime-local"
              id="startTime"
              value={formData.startTime}
              onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
              min={getMinStartTime()}
              className="w-full px-4 py-2.5 bg-background/50 border border-primary/20 rounded-lg shadow-sm text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
              required
            />
          </div>
          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-muted-foreground mb-2">
              End Time <span className="text-red-400">*</span>
            </label>
            <input
              type="datetime-local"
              id="endTime"
              value={formData.endTime}
              onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
              min={formData.startTime || getMinStartTime()}
              className="w-full px-4 py-2.5 bg-background/50 border border-primary/20 rounded-lg shadow-sm text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
              required
            />
          </div>
        </div>
        <div className="bg-blue-900/50 border border-blue-500/50 rounded-xl p-4 text-blue-300 flex items-center gap-3 shadow-lg shadow-blue-500/10">
          <FaInfoCircle className="w-5 h-5 text-blue-400" />
          <p className="text-sm">
            <strong className="font-semibold">Note:</strong> After creating the mission, you'll be able to add targets
            (challenges) and manage agents (participants) from the mission dashboard.
          </p>
        </div>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/50 border border-red-500/50 rounded-xl p-4 text-red-300 flex items-center gap-3 shadow-lg shadow-red-500/10"
          >
            <FaExclamationTriangle className="w-5 h-5 text-red-400" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}
        <div className="flex justify-end">
          <motion.button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-background font-bold rounded-lg hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="animate-spin" /> Creating...
              </>
            ) : (
              <>
                <FaPlusSquare /> Create Mission
              </>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  )
}
