import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { uploadFile } from '@/lib/vercel-blob'
import { processDocument } from '@/lib/document-processor'
import { createDocumentChunks } from '@/lib/document-chunks'

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

    // Upload file to Vercel Blob Storage
    const fileUrl = await uploadFile(
      file,
      `lesson-plans/${dbUser.id}/${Date.now()}-${file.name}`
    )

    // Process document (extract text and chunk)
    const processed = await processDocument(file, docType)

    // Create lesson plan record
    const lessonPlan = await db.lessonPlan.create({
      data: {
        userId: dbUser.id,
        fileName: file.name,
        fileUrl,
        fileSize: file.size,
        tags,
        metadata: metadata as any,
        extractedText: processed.text,
      },
    })

    // Generate embeddings and create chunks using Prisma helper
    await createDocumentChunks(lessonPlan.id, 'lesson_plan', processed.chunks)

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

