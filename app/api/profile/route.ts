import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clerkUser = await currentUser()
    if (!clerkUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get or create user in database
    let user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: {
        name: true,
        email: true,
        subjects: true,
      },
    })

    if (!user) {
      // Create user if doesn't exist
      const newUser = await db.user.create({
        data: {
          clerkUserId: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          name: clerkUser.firstName && clerkUser.lastName
            ? `${clerkUser.firstName} ${clerkUser.lastName}`
            : clerkUser.firstName || clerkUser.emailAddresses[0]?.emailAddress || 'User',
        },
      })
      user = {
        name: newUser.name,
        email: newUser.email,
        subjects: newUser.subjects,
      }
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clerkUser = await currentUser()
    if (!clerkUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await req.json()
    const { name, email, subjects } = body as {
      name?: string
      email?: string
      subjects?: string[]
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Get or create user in database
    let user = await db.user.findUnique({
      where: { clerkUserId: userId },
    })

    if (!user) {
      // Create user if doesn't exist
      user = await db.user.create({
        data: {
          clerkUserId: userId,
          email: email || clerkUser.emailAddresses[0]?.emailAddress || '',
          name: name || (clerkUser.firstName && clerkUser.lastName
            ? `${clerkUser.firstName} ${clerkUser.lastName}`
            : clerkUser.firstName || clerkUser.emailAddresses[0]?.emailAddress || 'User'),
          subjects: Array.isArray(subjects) ? subjects : [],
        },
      })
    }

    // Update user
    const updated = await db.user.update({
      where: { clerkUserId: userId },
      data: {
        name: name ?? user.name,
        email,
        subjects: Array.isArray(subjects) ? subjects : user.subjects,
      },
      select: {
        name: true,
        email: true,
        subjects: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

