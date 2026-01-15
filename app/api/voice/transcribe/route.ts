import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { transcribeAudio } from '@/lib/elevenlabs'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      )
    }

    // Check file size (max 2 minutes of audio, roughly 2-3MB for webm)
    if (audioFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Audio file too large. Maximum 2 minutes.' },
        { status: 400 }
      )
    }

    // Convert File to Blob
    const audioBlob = new Blob([await audioFile.arrayBuffer()], {
      type: audioFile.type,
    })

    // Transcribe using ElevenLabs
    const transcript = await transcribeAudio(audioBlob)

    return NextResponse.json({ transcript })
  } catch (error) {
    console.error('Error transcribing audio:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to transcribe audio' },
      { status: 500 }
    )
  }
}

