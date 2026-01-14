'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)

  const handleNext = async () => {
    if (step === 2) {
      // Mark onboarding as complete (you can store this in localStorage or database)
      localStorage.setItem('onboarding_complete', 'true')
      router.push('/dashboard')
    } else {
      setStep(2)
    }
  }

  const handleSkip = () => {
    localStorage.setItem('onboarding_complete', 'true')
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl p-8 md:p-12">
        {step === 1 ? (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-gray-900">
                Welcome to Adhyapak Shathi
              </h1>
              <p className="text-xl text-gray-600">
                Your Just-in-Time Classroom Support Companion
              </p>
            </div>
            <div className="space-y-4 pt-8">
              <p className="text-lg text-gray-700 leading-relaxed">
                Adhyapak Shathi is designed to provide teachers with real-time,
                context-aware pedagogical support right when you need it most.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Whether you're in the middle of a lesson or preparing for class,
                get instant guidance based on official teaching manuals and
                best practices.
              </p>
            </div>
            <div className="flex gap-4 pt-6">
              <Button
                onClick={handleSkip}
                variant="outline"
                className="flex-1"
              >
                Skip
              </Button>
              <Button onClick={handleNext} className="flex-1">
                Next
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-gray-900">
                Key Features
              </h2>
            </div>
            <div className="space-y-6 pt-8">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">
                  💬 Ask Questions Anytime
                </h3>
                <p className="text-gray-700">
                  Get instant answers to your classroom questions via text or
                  voice. Choose your preferred response format.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">
                  📚 Context-Aware Responses
                </h3>
                <p className="text-gray-700">
                  Our AI considers your past lesson plans to provide
                  personalized, relevant guidance.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">
                  📝 Upload Your Lesson Plans
                </h3>
                <p className="text-gray-700">
                  Upload your lesson plans to help the system understand your
                  teaching context and provide better responses.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">
                  🔍 Search Your History
                </h3>
                <p className="text-gray-700">
                  Access your past queries and responses anytime. Search through
                  your conversation history.
                </p>
              </div>
            </div>
            <div className="flex gap-4 pt-6">
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button onClick={handleNext} className="flex-1">
                Get Started
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

