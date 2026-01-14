'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart3, TrendingUp, Clock, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Analytics {
  totalQueries: number
  queriesPerTeacher: Array<{ teacher: string; queryCount: number }>
  averageResponseTime: number
  responseTypeDistribution: Array<{ type: string; count: number }>
  mostCommonTopics: Array<{ topic: string; count: number }>
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [days, setDays] = useState(30)

  useEffect(() => {
    fetchAnalytics()
  }, [days])

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/analytics?days=${days}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h1>
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          Back to Chat
        </Button>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Time Range Selector */}
        <div className="mb-6 flex gap-2">
          <Button
            variant={days === 7 ? 'default' : 'outline'}
            onClick={() => setDays(7)}
          >
            Last 7 days
          </Button>
          <Button
            variant={days === 30 ? 'default' : 'outline'}
            onClick={() => setDays(30)}
          >
            Last 30 days
          </Button>
          <Button
            variant={days === 90 ? 'default' : 'outline'}
            onClick={() => setDays(90)}
          >
            Last 90 days
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading analytics...</div>
        ) : !analytics ? (
          <div className="text-center py-12 text-gray-500">No data available</div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <h3 className="text-sm font-medium text-gray-500">
                    Total Queries
                  </h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics.totalQueries}
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="h-8 w-8 text-green-600" />
                  <h3 className="text-sm font-medium text-gray-500">
                    Avg Response Time
                  </h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {(analytics.averageResponseTime / 1000).toFixed(1)}s
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                  <h3 className="text-sm font-medium text-gray-500">
                    Active Teachers
                  </h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics.queriesPerTeacher.length}
                </p>
              </Card>
            </div>

            {/* Queries Per Teacher */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Queries Per Teacher
              </h2>
              <div className="space-y-2">
                {analytics.queriesPerTeacher
                  .sort((a, b) => b.queryCount - a.queryCount)
                  .slice(0, 10)
                  .map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-gray-700">{item.teacher}</span>
                      <span className="font-semibold text-gray-900">
                        {item.queryCount}
                      </span>
                    </div>
                  ))}
              </div>
            </Card>

            {/* Response Type Distribution */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Response Type Distribution
              </h2>
              <div className="space-y-2">
                {analytics.responseTypeDistribution.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {item.type || 'Unknown'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {item.count}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${
                              (item.count / analytics.totalQueries) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Most Common Topics */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Most Common Topics
              </h2>
              <div className="flex flex-wrap gap-2">
                {analytics.mostCommonTopics.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {item.topic} ({item.count})
                  </span>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

