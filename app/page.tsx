'use client'

import { SignInButton, SignUpButton } from '@clerk/nextjs'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard')
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (isSignedIn) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <h1 className="text-5xl font-bold text-gray-900">
            Adhyapak Shathi
          </h1>
          <p className="text-2xl text-gray-700 max-w-2xl mx-auto">
            Just-in-Time Classroom Support for Teachers
          </p>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Get instant, context-aware pedagogical guidance right when you need
            it. Ask questions via text or voice and receive personalized
            responses based on official teaching manuals and your lesson plans.
          </p>
          <div className="flex gap-4 justify-center">
            <SignInButton mode="modal">
              <Button size="lg">Sign In</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button variant="outline" size="lg">
                Get Started
              </Button>
            </SignUpButton>
          </div>
        </div>
      </div>
    </div>
  )
}
