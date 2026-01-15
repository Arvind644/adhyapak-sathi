import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { searchDocuments, getRecentLessonPlanContext } from '@/lib/text-search'
import { generateResponse } from '@/lib/openai'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await req.json()
    const { query, responseType, voiceTranscript } = body

    if (!query || !responseType) {
      return NextResponse.json(
        { error: 'Query and response type are required' },
        { status: 400 }
      )
    }

    const startTime = Date.now()

    // Get or create user in database
    let dbUser = await db.user.findUnique({
      where: { clerkUserId: userId },
    })

    if (!dbUser) {
      dbUser = await db.user.create({
        data: {
          clerkUserId: userId,
          email: user.emailAddresses[0]?.emailAddress || '',
          name: user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.firstName || user.emailAddresses[0]?.emailAddress || 'User',
        },
      })
    }

    // Get user's lesson plan summary (for questions about their data)
    const allLessonPlans = await db.lessonPlan.findMany({
      where: { userId: dbUser.id },
      select: {
        id: true,
        fileName: true,
        tags: true,
        metadata: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Search for relevant content from user's lesson plans
    let searchResults = await searchDocuments(query, dbUser.id, 3)
    
    // Prepare context for AI - let the AI decide if it's relevant
    const contextChunks = searchResults.map((result) => ({
      text: result.text,
      source: result.fileName || 'Your Lesson Plan',
      metadata: { documentType: result.documentType },
    }))

    // Prepare lesson plan summary for AI
    const lessonPlanSummary = {
      totalCount: allLessonPlans.length,
      plans: allLessonPlans.map(lp => ({
        name: lp.fileName,
        tags: lp.tags,
        subject: (lp.metadata as any)?.subject,
        grade: (lp.metadata as any)?.grade,
        topic: (lp.metadata as any)?.topic,
        uploadedAt: lp.createdAt.toLocaleDateString(),
      }))
    }

    // Generate response using OpenAI - AI will decide when to use context
    let aiResponse: string
    try {
      aiResponse = await generateResponse(query, contextChunks, responseType, lessonPlanSummary)
    } catch (error) {
      console.error('OpenAI API error:', error)
      return NextResponse.json(
        { error: 'AI service is not available, please try later' },
        { status: 503 }
      )
    }

    // Store sources used
    const sourcesUsed = searchResults.map((result) => ({
      documentId: result.documentId,
      documentType: result.documentType,
      fileName: result.fileName,
      relevance: result.relevance,
    }))

    // Save query to database
    const savedQuery = await db.query.create({
      data: {
        userId: dbUser.id,
        originalText: query,
        voiceTranscript: voiceTranscript || null,
        responseType,
        aiResponse,
        sourcesUsed: sourcesUsed as any,
      },
    })

    // Calculate response time
    const responseTimeMs = Date.now() - startTime

    // Save analytics
    await db.analytics.create({
      data: {
        queryId: savedQuery.id,
        responseTimeMs,
        responseType,
        topics: [],
      },
    })

    return NextResponse.json({
      queryId: savedQuery.id,
      response: aiResponse,
      sources: sourcesUsed,
      responseTimeMs,
    })
  } catch (error) {
    console.error('Error processing query:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

