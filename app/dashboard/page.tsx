'use client'

import { ChatInterface } from '@/components/chat/chat-interface'
import { UserButton, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileText, BarChart3, Home, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      <header className="sticky top-0 z-30 w-full">
        <div className="backdrop-blur-md bg-white/80 border-b border-indigo-100 shadow-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-indigo-500 font-semibold">
                  Adhyapak Shathi
                </p>
                <p className="text-sm text-slate-600 font-medium">
                  Just-in-Time Classroom Support
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 rounded-full px-4 hover:bg-indigo-50"
                >
                  <Home className="h-4 w-4 text-indigo-600" />
                  <span className="text-slate-700">Home</span>
                </Button>
              </Link>
              <Link href="/profile">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 rounded-full px-4 hover:bg-indigo-50"
                >
                  <FileText className="h-4 w-4 text-indigo-600" />
                  <span className="text-slate-700">Profile</span>
                </Button>
              </Link>
              <Link href="/analytics">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 rounded-full px-4 hover:bg-indigo-50"
                >
                  <BarChart3 className="h-4 w-4 text-indigo-600" />
                  <span className="text-slate-700">Analytics</span>
                </Button>
              </Link>
              <div className="ml-1">
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1">
        <ChatInterface />
      </div>
    </div>
  )
}
