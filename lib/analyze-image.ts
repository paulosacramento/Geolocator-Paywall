import { getGeminiClient, SYSTEM_PROMPT } from '@/lib/gemini'
import type { Location } from '@/components/AnalysisResults'

export interface AnalyzeImageResult {
  locations: Location[]
  model: string
  durationMs: number
}

export async function analyzeImage(
  image: string,
  mimeType: string,
  modelId: string
): Promise<AnalyzeImageResult> {
  const started = Date.now()
  const genAI = getGeminiClient()
  const model = genAI.getGenerativeModel({
    model: modelId,
    systemInstruction: SYSTEM_PROMPT,
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
  const clean = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  const parsed = JSON.parse(clean) as { locations: Location[] }

  return {
    locations: parsed.locations,
    model: modelId,
    durationMs: Date.now() - started,
  }
}
