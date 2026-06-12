'use client'

import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { IconBookmark, IconGoogle } from '@/app/components/icons'

export default function Home() {
  const { status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="login-stage">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="login-stage">
      <div className="login-glow" />
      <div className="login-card fade-in">
        <div className="login-mark">
          <IconBookmark size={22} />
        </div>
        <h1 className="login-title">Welcome back</h1>
        <p className="login-sub">Sign in to open your library.</p>
        <button
          className="google-btn"
          onClick={() => { setLoading(true); signIn('google') }}
          disabled={loading}
        >
          {loading ? <span className="spinner spinner-sm" /> : <IconGoogle size={18} />}
          {loading ? 'Signing in…' : 'Continue with Google'}
        </button>
        <p className="login-foot">Your bookmarks are stored privately.</p>
      </div>
    </div>
  )
}
