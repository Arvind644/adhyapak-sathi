'use client'

import { ChatInterface } from '@/components/chat/chat-interface'
import { UserButton, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileText, BarChart3 } from 'lucide-react'
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
    <div className="h-screen flex flex-col">
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
        <Link href="/profile">
          <Button variant="ghost" size="icon" className="h-9 w-9" title="Profile">
            <FileText className="h-4 w-4" />
          </Button>
        </Link>
        <Link href="/analytics">
          <Button variant="ghost" size="icon" className="h-9 w-9" title="Analytics">
            <BarChart3 className="h-4 w-4" />
          </Button>
        </Link>
        <div className="ml-1">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
      <ChatInterface />
    </div>
  )
}

