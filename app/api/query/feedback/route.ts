import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { queryId, isRelevant } = body

    if (!queryId || typeof isRelevant !== 'boolean') {
      return NextResponse.json(
        { error: 'Query ID and relevance flag are required' },
        { status: 400 }
      )
    }

    // Get user
    const dbUser = await db.user.findUnique({
      where: { clerkUserId: userId },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update query feedback
    await db.query.update({
      where: { id: queryId },
      data: { isRelevant },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating feedback:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

