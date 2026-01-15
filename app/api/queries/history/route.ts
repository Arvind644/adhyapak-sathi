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

    const dbUser = await db.user.findUnique({
      where: { clerkUserId: userId },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Get queries from last 3 months
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

    const queries = await db.query.findMany({
      where: {
        userId: dbUser.id,
        createdAt: { gte: threeMonthsAgo },
        ...(search && {
          originalText: { contains: search, mode: 'insensitive' },
        }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        originalText: true,
        responseType: true,
        aiResponse: true,
        createdAt: true,
      },
    })

    return NextResponse.json(queries)
  } catch (error) {
    console.error('Error fetching query history:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

