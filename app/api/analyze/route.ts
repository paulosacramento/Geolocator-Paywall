import { NextRequest, NextResponse } from 'next/server'
import { analyzeImage } from '@/lib/analyze-image'
import { PRODUCTION_MODEL } from '@/lib/compare-preview'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { image, mimeType } = await req.json()

    if (!image || !mimeType) {
      return NextResponse.json({ error: 'Missing image or mimeType' }, { status: 400 })
    }

    const result = await analyzeImage(image, mimeType, PRODUCTION_MODEL)
    return NextResponse.json({ locations: result.locations })
  } catch (err: unknown) {
    console.error('[analyze]', err)
    const message = err instanceof Error ? err.message : 'Analysis failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
