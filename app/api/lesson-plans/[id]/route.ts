import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { deleteFile } from '@/lib/vercel-blob'
import { deleteDocumentChunks } from '@/lib/document-chunks'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const lessonPlan = await db.lessonPlan.findUnique({
      where: { id: params.id },
    })

    if (!lessonPlan) {
      return NextResponse.json(
        { error: 'Lesson plan not found' },
        { status: 404 }
      )
    }

    if (lessonPlan.userId !== dbUser.id) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this lesson plan' },
        { status: 403 }
      )
    }

    // Delete file from Vercel Blob Storage
    try {
      await deleteFile(lessonPlan.fileUrl)
    } catch (error) {
      console.error('Error deleting file from blob storage:', error)
      // Continue with database deletion even if blob deletion fails
    }

    // Delete associated chunks using Prisma helper
    await deleteDocumentChunks(lessonPlan.id, 'lesson_plan')

    // Delete lesson plan using Prisma
    await db.lessonPlan.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting lesson plan:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

