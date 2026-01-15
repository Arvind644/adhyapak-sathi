'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  MessageCircle,
  FileText,
  BarChart3,
  Clock,
  BookOpen,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalQueries: number
  lessonPlansCount: number
  recentQueries: Array<{
    id: string
    originalText: string
    createdAt: string
  }>
}

export default function DashboardPage() {
  const { isSignedIn, isLoaded, user } = useUser()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
    }
  }, [isLoaded, isSignedIn, router])

  useEffect(() => {
    if (isSignedIn) {
      fetchDashboardStats()
    }
  }, [isSignedIn])

  const fetchDashboardStats = async () => {
    try {
      const [queriesRes, plansRes] = await Promise.all([
        fetch('/api/queries/history?limit=3'),
        fetch('/api/lesson-plans'),
      ])

      let queries = []
      let plans = []

      if (queriesRes.ok) {
        const queriesData = await queriesRes.json()
        queries = Array.isArray(queriesData) ? queriesData : []
      }

      if (plansRes.ok) {
        const plansData = await plansRes.json()
        plans = Array.isArray(plansData) ? plansData : []
      }

      setStats({
        totalQueries: queries.length,
        lessonPlansCount: plans.length,
        recentQueries: Array.isArray(queries) ? queries.slice(0, 3) : [],
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      setStats({
        totalQueries: 0,
        lessonPlansCount: 0,
        recentQueries: [],
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded || loading) {
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
    return null
  }

  const quickActions = [
    {
      title: 'Ask a Question',
      description: 'Get instant classroom support',
      icon: MessageCircle,
      href: '/chat',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Upload Lesson Plan',
      description: 'Add to your collection',
      icon: FileText,
      href: '/profile',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'View Analytics',
      description: 'Track your usage',
      icon: BarChart3,
      href: '/analytics',
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName || 'Teacher'}! 👋
          </h1>
          <p className="text-lg text-gray-600">
            Here's what's happening with your teaching assistant
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <MessageCircle className="h-6 w-6" />
              </div>
              <TrendingUp className="h-5 w-5 text-white/80" />
            </div>
            <p className="text-3xl font-bold mb-1">
              {stats?.totalQueries || 0}
            </p>
            <p className="text-white/90">Total Queries</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6" />
              </div>
              <Sparkles className="h-5 w-5 text-white/80" />
            </div>
            <p className="text-3xl font-bold mb-1">
              {stats?.lessonPlansCount || 0}
            </p>
            <p className="text-white/90">Lesson Plans</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6" />
              </div>
              <BarChart3 className="h-5 w-5 text-white/80" />
            </div>
            <p className="text-3xl font-bold mb-1">Active</p>
            <p className="text-white/90">Status</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <Link key={index} href={action.href}>
                  <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-blue-200 group">
                    <div
                      className={`w-14 h-14 ${action.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className={`h-7 w-7 ${action.textColor}`} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{action.description}</p>
                    <div className="flex items-center text-blue-600 font-medium group-hover:gap-2 transition-all">
                      Get Started
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Recent Queries
            </h2>
            <Link href="/chat">
              <Button variant="outline" size="sm" className="gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {stats?.recentQueries && stats.recentQueries.length > 0 ? (
            <div className="space-y-3">
              {stats.recentQueries.map((query) => (
                <Card
                  key={query.id}
                  className="p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-gray-900 line-clamp-2">
                        {query.originalText}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(query.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <Link href="/chat">
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">No queries yet</p>
              <Link href="/chat">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                  Ask Your First Question
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
