import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For demo purposes, allow any authenticated user to view analytics
    // In production, you might want to restrict this to admins

    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') || '30')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Total queries
    const totalQueries = await db.query.count({
      where: { createdAt: { gte: startDate } },
    })

    // Queries per teacher
    const queriesPerTeacher = await db.query.groupBy({
      by: ['userId'],
      where: { createdAt: { gte: startDate } },
      _count: { id: true },
    })

    const teacherCounts = await Promise.all(
      queriesPerTeacher.map(async (item) => {
        const user = await db.user.findUnique({
          where: { id: item.userId },
          select: { name: true, email: true },
        })
        return {
          teacher: user?.name || user?.email || 'Unknown',
          queryCount: item._count.id,
        }
      })
    )

    // Average response time
    const avgResponseTime = await db.analytics.aggregate({
      where: { createdAt: { gte: startDate } },
      _avg: { responseTimeMs: true },
    })

    // Response type distribution
    const responseTypeDistribution = await db.query.groupBy({
      by: ['responseType'],
      where: { createdAt: { gte: startDate } },
      _count: { id: true },
    })

    // Most common topics (simplified - could be enhanced with NLP)
    // For now, we'll extract common words from queries
    const recentQueries = await db.query.findMany({
      where: { createdAt: { gte: startDate } },
      select: { originalText: true },
      take: 100,
    })

    // Simple word frequency analysis
    const wordFreq: Record<string, number> = {}
    recentQueries.forEach((query) => {
      const words = query.originalText
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 4) // Filter short words
      words.forEach((word) => {
        wordFreq[word] = (wordFreq[word] || 0) + 1
      })
    })

    const mostCommonTopics = Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([topic, count]) => ({ topic, count }))

    return NextResponse.json({
      totalQueries,
      queriesPerTeacher: teacherCounts,
      averageResponseTime: avgResponseTime._avg.responseTimeMs || 0,
      responseTypeDistribution: responseTypeDistribution.map((item) => ({
        type: item.responseType || 'unknown',
        count: item._count.id,
      })),
      mostCommonTopics,
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

