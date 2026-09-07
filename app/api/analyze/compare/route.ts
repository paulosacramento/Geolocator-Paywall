import { NextRequest, NextResponse } from 'next/server'
import { analyzeImage } from '@/lib/analyze-image'
import { isComparePreviewEnabled } from '@/lib/compare-preview'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  if (!isComparePreviewEnabled()) {
    return NextResponse.json({ error: 'Compare preview is disabled' }, { status: 403 })
  }

  try {
    const { image, mimeType, model } = await req.json()

    if (!image || !mimeType) {
      return NextResponse.json({ error: 'Missing image or mimeType' }, { status: 400 })
    }

    const modelId = typeof model === 'string' ? model.trim() : ''
    if (!modelId) {
      return NextResponse.json({ error: 'Missing model id' }, { status: 400 })
    }

    const result = await analyzeImage(image, mimeType, modelId)
    return NextResponse.json(result)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Analysis failed'
    console.error('[analyze/compare]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
