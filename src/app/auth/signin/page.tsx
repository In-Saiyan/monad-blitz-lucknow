'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import MatrixBackground from '@/components/ui/effects/MatrixBackground'

function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [signoutMessage, setSignoutMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check for signout reason in URL params or sessionStorage
    const reason = searchParams.get('reason')
    if (reason === 'session_expired') {
      const message = sessionStorage.getItem('signout_reason')
      if (message) {
        setSignoutMessage(message)
        sessionStorage.removeItem('signout_reason')
      } else {
        setSignoutMessage('Your session has expired. Please sign in again.')
      }
    }

    // Clear any existing session when visiting signin page
    getSession().then(session => {
      if (session) {
        router.push('/dashboard')
      }
    })
  }, [router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <MatrixBackground />
      <div className="relative z-10 max-w-md w-full bg-background/50 backdrop-blur-sm rounded-xl p-8 border border-primary/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-mono text-primary mb-2">
            Sign In
          </h1>
          <p className="text-muted-foreground">Welcome back, agent.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {signoutMessage && (
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 text-yellow-300 text-sm">
              {signoutMessage}
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-background/70 border border-primary/20 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-muted-foreground mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-background/70 border border-primary/20 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-bold py-3 rounded-lg transition-all transform hover:scale-105 disabled:transform-none"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-accent hover:text-accent/80 font-medium">
              Sign up
            </Link>
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link 
            href="/"
            className="text-muted-foreground hover:text-primary text-sm"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="relative min-h-screen bg-background flex items-center justify-center">
        <MatrixBackground />
        <div className="relative z-10 flex flex-col items-center gap-4 text-primary font-mono">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-accent"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
}
