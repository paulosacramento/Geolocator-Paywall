'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Beaker, Loader2, Play, ScanSearch } from 'lucide-react'
import { PhotoUpload } from '@/components/PhotoUpload'
import { AnalysisResults, type Location } from '@/components/AnalysisResults'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DEFAULT_COMPARE_MODELS } from '@/lib/compare-preview'
import { cn } from '@/lib/utils'

type ModelResult =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; locations: Location[]; durationMs: number }
  | { status: 'error'; error: string; durationMs?: number }

export function ComparePreview() {
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedModels, setSelectedModels] = useState<Set<string>>(
    () => new Set([DEFAULT_COMPARE_MODELS[0], DEFAULT_COMPARE_MODELS[1]])
  )
  const [customModel, setCustomModel] = useState('')
  const [results, setResults] = useState<Record<string, ModelResult>>({})
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImageReady = (base64: string, mimeType: string, preview: string) => {
    setImageBase64(base64)
    setImageMimeType(mimeType)
    setImagePreview(preview)
    setError(null)
    setResults({})
  }

  const handleClear = () => {
    setImageBase64(null)
    setImageMimeType('image/jpeg')
    setImagePreview(null)
    setError(null)
    setResults({})
  }

  const toggleModel = (modelId: string) => {
    setSelectedModels((prev) => {
      const next = new Set(prev)
      if (next.has(modelId)) next.delete(modelId)
      else next.add(modelId)
      return next
    })
  }

  const addCustomModel = () => {
    const trimmed = customModel.trim()
    if (!trimmed) return
    setSelectedModels((prev) => new Set(prev).add(trimmed))
    setCustomModel('')
  }

  const runComparison = async () => {
    if (!imageBase64) {
      setError('Please upload a photo first.')
      return
    }

    const models = Array.from(selectedModels)
    if (models.length < 1) {
      setError('Select at least one model to compare.')
      return
    }

    setError(null)
    setIsRunning(true)

    const initial: Record<string, ModelResult> = {}
    for (const modelId of models) {
      initial[modelId] = { status: 'loading' }
    }
    setResults(initial)

    await Promise.all(
      models.map(async (modelId) => {
        const started = Date.now()
        try {
          const res = await fetch('/api/analyze/compare', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image: imageBase64,
              mimeType: imageMimeType,
              model: modelId,
            }),
          })
          const data = await res.json()
          if (!res.ok) {
            throw new Error(data.error ?? 'Analysis failed')
          }
          setResults((prev) => ({
            ...prev,
            [modelId]: {
              status: 'done',
              locations: data.locations,
              durationMs: data.durationMs ?? Date.now() - started,
            },
          }))
        } catch (err) {
          setResults((prev) => ({
            ...prev,
            [modelId]: {
              status: 'error',
              error: err instanceof Error ? err.message : 'Analysis failed',
              durationMs: Date.now() - started,
            },
          }))
        }
      })
    )

    setIsRunning(false)
  }

  const activeModels = Array.from(selectedModels)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ScanSearch className="h-5 w-5 text-primary" />
            <span className="font-semibold text-base">GeoLocator</span>
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs gap-1">
              <Beaker className="h-3 w-3" />
              Developer preview
            </Badge>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-600 dark:text-amber-400">
            <Beaker className="h-4 w-4" />
            Model bake-off (not the paid product)
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Compare Gemini models
          </h1>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto">
            Upload one photo and run the same geolocation prompt across multiple Gemini models
            side by side. Use this to pick which model to ship — no Lightning payment on this
            route.
          </p>
        </div>

        <PhotoUpload
          onImageReady={handleImageReady}
          onClear={handleClear}
          preview={imagePreview}
          disabled={isRunning}
        />

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Models to run</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {DEFAULT_COMPARE_MODELS.map((modelId) => (
                <label
                  key={modelId}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-colors',
                    selectedModels.has(modelId)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  )}
                >
                  <input
                    type="checkbox"
                    className="rounded border-input"
                    checked={selectedModels.has(modelId)}
                    onChange={() => toggleModel(modelId)}
                    disabled={isRunning}
                  />
                  <span className="font-mono text-xs sm:text-sm">{modelId}</span>
                </label>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomModel()}
                placeholder="Custom model id (e.g. gemini-3.1-pro-preview)"
                disabled={isRunning}
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCustomModel}
                disabled={isRunning || !customModel.trim()}
                className="shrink-0"
              >
                Add model
              </Button>
            </div>

            {activeModels.some((m) => !DEFAULT_COMPARE_MODELS.includes(m as typeof DEFAULT_COMPARE_MODELS[number])) && (
              <div className="flex flex-wrap gap-2">
                {activeModels
                  .filter((m) => !DEFAULT_COMPARE_MODELS.includes(m as typeof DEFAULT_COMPARE_MODELS[number]))
                  .map((modelId) => (
                    <label
                      key={modelId}
                      className="inline-flex items-center gap-2 rounded-lg border border-primary bg-primary/5 px-3 py-2 text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="rounded border-input"
                        checked={selectedModels.has(modelId)}
                        onChange={() => toggleModel(modelId)}
                        disabled={isRunning}
                      />
                      <span className="font-mono text-xs sm:text-sm">{modelId}</span>
                    </label>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button
          onClick={runComparison}
          disabled={!imageBase64 || isRunning || activeModels.length === 0}
          size="lg"
          className="w-full gap-2 text-base"
        >
          {isRunning ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Running {activeModels.length} model{activeModels.length !== 1 ? 's' : ''}…
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              Run comparison ({activeModels.length} model{activeModels.length !== 1 ? 's' : ''})
            </>
          )}
        </Button>

        {activeModels.length > 0 && Object.keys(results).length > 0 && (
          <div className="overflow-x-auto -mx-4 px-4 pb-4">
            <div
              className="grid gap-4 min-w-0"
              style={{ gridTemplateColumns: `repeat(${activeModels.length}, minmax(280px, 1fr))` }}
            >
              {activeModels.map((modelId) => {
                const result = results[modelId] ?? { status: 'idle' }
                return (
                  <Card key={modelId} className="min-w-[280px]">
                    <CardHeader className="pb-2 space-y-1">
                      <p className="font-mono text-xs text-muted-foreground break-all">{modelId}</p>
                      {result.status === 'loading' && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Running…
                        </div>
                      )}
                      {result.status === 'done' && (
                        <p className="text-sm text-emerald-600 dark:text-emerald-400">
                          {result.durationMs} ms
                        </p>
                      )}
                      {result.status === 'error' && (
                        <div className="space-y-1">
                          {result.durationMs !== undefined && (
                            <p className="text-sm text-muted-foreground">{result.durationMs} ms</p>
                          )}
                          <p className="text-sm text-destructive">{result.error}</p>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      {result.status === 'done' && (
                        <AnalysisResults
                          locations={result.locations}
                          imagePreview={null}
                          showImage={false}
                          showExport={false}
                          compact
                        />
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
