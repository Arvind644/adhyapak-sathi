import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hybridSearch } from '@/lib/vector-search'
import { generateResponse, generateEmbedding } from '@/lib/openai'

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

    // Perform hybrid search
    const searchResults = await hybridSearch(query, dbUser.id, 3)

    // Prepare context chunks for response generation
    const contextChunks = searchResults.map((result) => ({
      text: result.chunkText,
      source: result.documentType === 'knowledge_base'
        ? 'Official Teaching Manual'
        : 'Your Lesson Plan',
      metadata: result.metadata,
    }))

    // Generate response using OpenAI
    let aiResponse: string
    try {
      aiResponse = await generateResponse(query, contextChunks, responseType)
    } catch (error) {
      console.error('OpenAI API error:', error)
      return NextResponse.json(
        { error: 'AI service is not available, please try later' },
        { status: 503 }
      )
    }

    // Store sources used
    const sourcesUsed = searchResults.map((result) => ({
      chunkId: result.chunkId,
      documentId: result.documentId,
      documentType: result.documentType,
      similarity: result.similarity,
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
        topics: [], // Could extract topics using NLP in the future
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

