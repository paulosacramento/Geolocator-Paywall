export const PRODUCTION_MODEL = 'gemini-3.1-flash-lite-preview'

/** Default models for the developer bake-off (same @google/generative-ai API). */
export const DEFAULT_COMPARE_MODELS = [
  PRODUCTION_MODEL,
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
] as const

export function isComparePreviewEnabled(): boolean {
  if (process.env.NODE_ENV === 'development') return true
  return process.env.COMPARE_PREVIEW_ENABLED === 'true'
}
