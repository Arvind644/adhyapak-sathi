'use client'

import { SignInButton, SignUpButton } from '@clerk/nextjs'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Image from 'next/image'
import {
  MessageCircle,
  Mic,
  BookOpen,
  Brain,
  Clock,
  Search,
  FileText,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
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

  const features = [
    {
      icon: MessageCircle,
      title: 'Ask Anytime',
      description: 'Get instant answers to your classroom questions via text or voice input',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Brain,
      title: 'AI-Powered',
      description: 'Context-aware responses using official teaching manuals and your lesson plans',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Clock,
      title: 'Just-in-Time',
      description: 'Get support exactly when you need it, right in the middle of your lesson',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: BookOpen,
      title: 'Personalized',
      description: 'Responses tailored to your teaching context and past lesson plans',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      icon: Search,
      title: 'Search History',
      description: 'Access your past queries and responses anytime, search through your history',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      icon: FileText,
      title: 'Lesson Plans',
      description: 'Upload and manage your lesson plans to enhance response quality',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
  ]

  const benefits = [
    'Instant pedagogical guidance',
    'Voice and text input support',
    'Context-aware responses',
    'Access to official teaching manuals',
    'Personalized based on your lesson plans',
    'Search through past queries',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center">
          <Image
            src="/logo.svg"
            alt="Adhyapak Shathi"
            width={300}
            height={75}
            className="h-20 w-auto"
            priority
          />
        </div>
        <div className="flex items-center gap-3">
          <SignInButton mode="modal">
            <Button variant="ghost" className="hidden sm:flex">
              Sign In
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Get Started
            </Button>
          </SignUpButton>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200 text-sm text-blue-700 mb-4">
            <Sparkles className="h-4 w-4" />
            <span>Just-in-Time Classroom Support</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
            Your AI Teaching
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Assistant
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Get instant, context-aware pedagogical guidance right when you need it.
            Ask questions via text or voice and receive personalized responses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <SignUpButton mode="modal">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg group"
              >
                Start Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </SignUpButton>
            <SignInButton mode="modal">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-2 border-gray-300 hover:border-gray-400 px-8 py-6 text-lg"
              >
                Sign In
              </Button>
            </SignInButton>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to support teachers in the classroom
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <Icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get instant support in three simple steps
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Ask Your Question
                </h3>
                <p className="text-gray-600">
                  Type or speak your classroom question in English or Hindi
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  AI Analyzes Context
                </h3>
                <p className="text-gray-600">
                  Our AI searches through teaching manuals and your lesson plans
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Get Instant Guidance
                </h3>
                <p className="text-gray-600">
                  Receive personalized, actionable advice in your preferred format
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Teachers Love Adhyapak Shathi
              </h2>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-lg text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Mic className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Voice Input</p>
                      <p className="text-sm text-white/80">Ask questions naturally</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Brain className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">AI-Powered</p>
                      <p className="text-sm text-white/80">Context-aware responses</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Analytics</p>
                      <p className="text-sm text-white/80">Track your progress</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Teaching?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join teachers who are getting instant support in their classrooms
            </p>
            <SignUpButton mode="modal">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </SignUpButton>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <Image
                src="/logo.svg"
                alt="Adhyapak Shathi"
                width={240}
                height={60}
                className="h-16 w-auto opacity-80 saturate-90 hover:opacity-100 hover:saturate-100 transition-all duration-300 drop-shadow-[0_0_8px_rgba(121,71,191,0.2)]"
              />
            </div>
            <p className="text-sm">
              © 2024 Adhyapak Shathi. Built for ShikshaLokam Hackathon.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
