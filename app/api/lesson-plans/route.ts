import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { uploadFile } from '@/lib/vercel-blob'
import { extractText } from '@/lib/document-processor'

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

    const formData = await req.formData()
    const file = formData.get('file') as File
    const tags = formData.get('tags')?.toString().split(',').map(t => t.trim()) || []
    const metadata = {
      subject: formData.get('subject')?.toString(),
      grade: formData.get('grade')?.toString(),
      topic: formData.get('topic')?.toString(),
    }

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      )
    }

    // Validate file type
    const fileType = file.type
    let docType: 'pdf' | 'word' = 'pdf'
    if (fileType.includes('pdf')) {
      docType = 'pdf'
    } else if (
      fileType.includes('word') ||
      fileType.includes('document') ||
      file.name.endsWith('.docx') ||
      file.name.endsWith('.doc')
    ) {
      docType = 'word'
    } else {
      return NextResponse.json(
        { error: 'Only PDF and Word documents are supported' },
        { status: 400 }
      )
    }

    // Get or create user
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

    console.log(`Processing file: ${file.name} (${file.size} bytes)`)
    
    // Upload file to Vercel Blob Storage
    const fileUrl = await uploadFile(
      file,
      `lesson-plans/${dbUser.id}/${Date.now()}-${file.name}`
    )
    console.log(`✓ File uploaded to blob storage`)

    // Extract text from document (no embeddings needed!)
    console.log(`Extracting text...`)
    const extractedText = await extractText(file, docType)
    console.log(`✓ Extracted ${extractedText.length} characters`)

    // Create lesson plan record with extracted text
    const lessonPlan = await db.lessonPlan.create({
      data: {
        userId: dbUser.id,
        fileName: file.name,
        fileUrl,
        fileSize: file.size,
        tags,
        metadata: metadata as any,
        extractedText, // Store full text for search
      },
    })
    console.log(`✓ Lesson plan saved to database`)

    return NextResponse.json({
      id: lessonPlan.id,
      fileName: lessonPlan.fileName,
      fileUrl: lessonPlan.fileUrl,
      tags: lessonPlan.tags,
      metadata: lessonPlan.metadata,
      createdAt: lessonPlan.createdAt,
    })
  } catch (error) {
    console.error('Error uploading lesson plan:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload lesson plan' },
      { status: 500 }
    )
  }
}

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
    const tag = searchParams.get('tag')

    const lessonPlans = await db.lessonPlan.findMany({
      where: {
        userId: dbUser.id,
        ...(tag && { tags: { has: tag } }),
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(lessonPlans)
  } catch (error) {
    console.error('Error fetching lesson plans:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

