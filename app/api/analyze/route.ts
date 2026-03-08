import { NextRequest, NextResponse } from 'next/server'
import { getGeminiClient, SYSTEM_PROMPT } from '@/lib/gemini'

export const maxDuration = 120

export async function POST(req: NextRequest) {
  try {
    const { image, mimeType } = await req.json()

    if (!image || !mimeType) {
      return NextResponse.json({ error: 'Missing image or mimeType' }, { status: 400 })
    }

    const genAI = getGeminiClient()
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        temperature: 0,
        responseMimeType: 'application/json',
        mediaResolution: 'high',
        thinkingConfig: {
          thinkingBudget: 24576,
        },
      },
    })

    const result = await model.generateContent([
      {
        inlineData: {
          data: image,
          mimeType,
        },
      },
      'Analyze this photograph and return the JSON as instructed.',
    ])

    const text = result.response.text().trim()
    const parsed = JSON.parse(text)

    return NextResponse.json(parsed)
  } catch (err: unknown) {
    console.error('[analyze]', err)
    const message = err instanceof Error ? err.message : 'Analysis failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
