'use client'

import { useRef, useState, type CSSProperties } from 'react'
import { MapPin, ImageDown, FileJson, Copy, Check, Printer } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge, type BadgeProps } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

export interface Location {
  location: string
  confidence: 'Very High' | 'High' | 'Medium' | 'Low' | 'Very Low'
  clues: {
    numbered: string[]
    summary: string
  }
}

interface AnalysisResultsProps {
  locations: Location[]
  imagePreview: string | null
}

const CONFIDENCE_CONFIG: Record<
  Location['confidence'],
  { variant: BadgeProps['variant']; label: string; bar: string; color: string; width: string }
> = {
  'Very High': { variant: 'success', label: 'Very High', bar: 'w-full bg-emerald-500', color: '#10b981', width: '100%' },
  'High':      { variant: 'info',    label: 'High',      bar: 'w-4/5 bg-blue-500',     color: '#3b82f6', width: '80%' },
  'Medium':    { variant: 'warning', label: 'Medium',    bar: 'w-3/5 bg-amber-500',    color: '#f59e0b', width: '60%' },
  'Low':       { variant: 'danger',  label: 'Low',       bar: 'w-2/5 bg-orange-500',   color: '#f97316', width: '40%' },
  'Very Low':  { variant: 'muted',   label: 'Very Low',  bar: 'w-1/5 bg-red-500',      color: '#ef4444', width: '20%' },
}

const RANK_LABELS = ['#1 Most Likely', '#2', '#3']

const EXPORT_STYLES: Record<string, CSSProperties> = {
  root: {
    width: 720,
    boxSizing: 'border-box',
    background: '#ffffff',
    color: '#111827',
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    padding: 32,
  },
  photoFrame: {
    width: '100%',
    maxHeight: 280,
    marginBottom: 28,
    border: '1px solid #e5e7eb',
    borderRadius: 16,
    overflow: 'hidden',
    background: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    maxWidth: '100%',
    maxHeight: 280,
    objectFit: 'contain',
    display: 'block',
  },
  heading: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    margin: '0 0 18px',
    fontSize: 22,
    lineHeight: 1.2,
    fontWeight: 700,
  },
  card: {
    border: '1px solid #e5e7eb',
    borderRadius: 16,
    boxShadow: '0 1px 3px rgba(17, 24, 39, 0.1)',
    marginBottom: 16,
    overflow: 'hidden',
    background: '#ffffff',
  },
  topCard: {
    borderColor: '#d1d5db',
    boxShadow: '0 0 0 2px rgba(17, 24, 39, 0.12), 0 1px 3px rgba(17, 24, 39, 0.1)',
  },
  cardHeader: {
    padding: '20px 24px 16px',
  },
  cardTitleRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  rank: {
    margin: '0 0 6px',
    color: '#6b7280',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  location: {
    margin: 0,
    color: '#111827',
    fontSize: 18,
    lineHeight: 1.25,
    fontWeight: 700,
  },
  badge: {
    borderRadius: 6,
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1,
    padding: '7px 10px',
    whiteSpace: 'nowrap',
  },
  barTrack: {
    height: 6,
    width: '100%',
    borderRadius: 999,
    background: '#f3f4f6',
    marginTop: 16,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
  },
  cardContent: {
    borderTop: '1px solid #e5e7eb',
    padding: '18px 24px 22px',
  },
  clueList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  clue: {
    display: 'flex',
    gap: 8,
    marginBottom: 8,
    color: '#374151',
    fontSize: 14,
    lineHeight: 1.45,
  },
  bullet: {
    color: '#6b7280',
  },
  summary: {
    margin: '14px 0 0',
    borderLeft: '2px solid rgba(17, 24, 39, 0.25)',
    paddingLeft: 12,
    color: '#6b7280',
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 1.45,
  },
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
}

async function waitForImages(element: HTMLElement) {
  const images = Array.from(element.querySelectorAll('img'))
  await Promise.all(
    images.map(async (image) => {
      if (!image.complete) {
        await new Promise<void>((resolve, reject) => {
          image.addEventListener('load', () => resolve(), { once: true })
          image.addEventListener('error', () => reject(new Error('Unable to load image for export')), { once: true })
        })
      }

      if (image.decode && image.naturalWidth > 0) {
        await image.decode().catch(() => undefined)
      }
    })
  )
}

export function AnalysisResults({ locations, imagePreview }: AnalysisResultsProps) {
  const exportRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  async function handleDownloadPNG() {
    if (!exportRef.current) return

    try {
      await waitForImages(exportRef.current)
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: '#ffffff',
        logging: false,
        scale: 2,
        useCORS: true,
      })
      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = `geolocator-${timestamp()}.png`
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Failed to save results as an image', error)
      window.alert('Sorry, the image export failed. Please try Print / PDF instead.')
    }
  }

  function handleDownloadJSON() {
    const data = {
      exportedAt: new Date().toISOString(),
      locations: locations.map((loc, i) => ({
        rank: i + 1,
        location: loc.location,
        confidence: loc.confidence,
        clues: loc.clues.numbered.map(c => c.replace(/^\d+\.\s*/, '')),
        summary: loc.clues.summary,
      })),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `geolocator-${timestamp()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  async function handleCopyText() {
    const lines: string[] = ['GeoLocator Analysis Results', '===========================', '']
    locations.forEach((loc, i) => {
      lines.push(`${RANK_LABELS[i]}: ${loc.location} (${loc.confidence} confidence)`)
      loc.clues.numbered.forEach(c => lines.push(`  • ${c.replace(/^\d+\.\s*/, '')}`))
      if (loc.clues.summary) lines.push(`  → ${loc.clues.summary}`)
      lines.push('')
    })
    await navigator.clipboard.writeText(lines.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Capture zone: photo + cards */}
      <div className="space-y-6">
        {imagePreview && (
          <div className="rounded-xl overflow-hidden border max-h-64 flex items-center justify-center bg-black/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="Analyzed photo" className="max-h-64 object-contain" />
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-primary" />
            Location Analysis
          </h2>

          <div className="grid gap-4">
            {locations.map((loc, i) => {
              const conf = CONFIDENCE_CONFIG[loc.confidence] ?? CONFIDENCE_CONFIG['Very Low']
              return (
                <Card key={i} className={i === 0 ? 'ring-2 ring-primary/20' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                          {RANK_LABELS[i]}
                        </p>
                        <CardTitle className="text-lg">{loc.location}</CardTitle>
                      </div>
                      <Badge variant={conf.variant} className="shrink-0 mt-1">
                        {conf.label}
                      </Badge>
                    </div>

                    {/* Confidence bar */}
                    <div className="mt-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${conf.bar}`} />
                    </div>
                  </CardHeader>

                  <Separator />

                  <CardContent className="pt-4 space-y-3">
                    <ul className="space-y-1.5">
                      {loc.clues.numbered.map((clue, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm">
                          <span className="text-muted-foreground">•</span>
                          <span>{clue.replace(/^\d+\.\s*/, '')}</span>
                        </li>
                      ))}
                    </ul>
                    {loc.clues.summary && (
                      <p className="text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-3">
                        {loc.clues.summary}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      {/* Plain export snapshot: avoids html2canvas parsing Tailwind v4 color functions. */}
      <div
        aria-hidden="true"
        style={{ position: 'fixed', left: -10000, top: 0, pointerEvents: 'none' }}
      >
        <div ref={exportRef} style={EXPORT_STYLES.root}>
          {imagePreview && (
            <div style={EXPORT_STYLES.photoFrame}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="" style={EXPORT_STYLES.photo} />
            </div>
          )}

          <h2 style={EXPORT_STYLES.heading}>
            <MapPin size={22} color="#111827" />
            Location Analysis
          </h2>

          <div>
            {locations.map((loc, i) => {
              const conf = CONFIDENCE_CONFIG[loc.confidence] ?? CONFIDENCE_CONFIG['Very Low']
              return (
                <div
                  key={i}
                  style={{
                    ...EXPORT_STYLES.card,
                    ...(i === 0 ? EXPORT_STYLES.topCard : undefined),
                  }}
                >
                  <div style={EXPORT_STYLES.cardHeader}>
                    <div style={EXPORT_STYLES.cardTitleRow}>
                      <div>
                        <p style={EXPORT_STYLES.rank}>{RANK_LABELS[i]}</p>
                        <p style={EXPORT_STYLES.location}>{loc.location}</p>
                      </div>
                      <span style={{ ...EXPORT_STYLES.badge, background: conf.color }}>
                        {conf.label}
                      </span>
                    </div>

                    <div style={EXPORT_STYLES.barTrack}>
                      <div
                        style={{
                          ...EXPORT_STYLES.barFill,
                          width: conf.width,
                          background: conf.color,
                        }}
                      />
                    </div>
                  </div>

                  <div style={EXPORT_STYLES.cardContent}>
                    <ul style={EXPORT_STYLES.clueList}>
                      {loc.clues.numbered.map((clue, j) => (
                        <li key={j} style={EXPORT_STYLES.clue}>
                          <span style={EXPORT_STYLES.bullet}>•</span>
                          <span>{clue.replace(/^\d+\.\s*/, '')}</span>
                        </li>
                      ))}
                    </ul>
                    {loc.clues.summary && (
                      <p style={EXPORT_STYLES.summary}>
                        {loc.clues.summary}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Export bar — excluded from PNG capture */}
      <div data-html2canvas-ignore className="no-print">
        <Separator className="mb-4" />
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Save results
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadPNG}>
            <ImageDown className="h-4 w-4 mr-1.5" />
            Save as image
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadJSON}>
            <FileJson className="h-4 w-4 mr-1.5" />
            Save as JSON
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyText}>
            {copied ? (
              <Check className="h-4 w-4 mr-1.5 text-emerald-500" />
            ) : (
              <Copy className="h-4 w-4 mr-1.5" />
            )}
            {copied ? 'Copied!' : 'Copy text'}
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1.5" />
            Print / PDF
          </Button>
        </div>
      </div>
    </div>
  )
}
