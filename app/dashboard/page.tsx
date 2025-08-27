'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p>Loading...</p>
      </div>
    )
  }

  // The session object is available when the status is "authenticated"
  if (!session) {
    return null; // Don't render anything if not authenticated yet
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#242424' }}>
      {/* Header section */}
      <header className="fixed top-0 left-0 w-full flex items-center justify-between h-[85px] p-4 z-10" style={{ backgroundColor: '#1a1a1a', borderBottom: '1px solid #E8000A' }}>
        <button className="flex items-center gap-2 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2" style={{ backgroundColor: '#E8000A', transition: 'background-color 0.3s ease-in-out', textShadow: '1px 1px 2px black' }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5" style={{ textShadow: '1px 1px 2px black' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New
        </button>
        {session.user?.image && (
          <img
            src={session.user.image}
            alt="User profile"
            className="w-12 h-12 rounded-full border-2 border-[#E8000A]"
          />
        )}
      </header>
      
      {/* Main content section */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 mt-[85px]">
        <div className="p-8 rounded-lg shadow-2xl text-center max-w-lg w-full" style={{ backgroundColor: '#1a1a1a' }}>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-500">
            Welcome Back, {session.user?.name}!
          </h1>
          <p className="text-lg text-gray-400 mb-6">
            You are now signed in with your Google account.
          </p>
          <div className="text-left p-4 rounded-lg mb-6" style={{ backgroundColor: '#36453F' }}>
            <p className="font-bold">Session Details:</p>
            <ul className="list-disc list-inside mt-2 text-gray-300">
              <li>Name: {session.user?.name}</li>
              <li>Email: {session.user?.email}</li>
            </ul>
          </div>
          <button
            onClick={() => signOut()}
            className="text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2" style={{ backgroundColor: '#E8000A' }}>
            Sign Out
          </button>
        </div>
      </main>
    </div>
  )
}
