import Link from 'next/link'
import { ScanSearch } from 'lucide-react'
import { ComparePreview } from '@/components/ComparePreview'
import { ThemeToggle } from '@/components/ThemeToggle'
import { isComparePreviewEnabled } from '@/lib/compare-preview'

export default function ComparePage() {
  if (!isComparePreviewEnabled()) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/50 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <ScanSearch className="h-5 w-5 text-primary" />
              <span className="font-semibold text-base">GeoLocator</span>
            </Link>
            <ThemeToggle />
          </div>
        </header>
        <main className="max-w-lg mx-auto px-4 py-24 text-center space-y-4">
          <h1 className="text-2xl font-bold">Model compare preview disabled</h1>
          <p className="text-muted-foreground">
            This developer bake-off route is not available in production unless explicitly
            enabled. Set <code className="text-sm bg-muted px-1.5 py-0.5 rounded">COMPARE_PREVIEW_ENABLED=true</code>{' '}
            in your environment, or run locally with <code className="text-sm bg-muted px-1.5 py-0.5 rounded">npm run dev</code>.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
          >
            Back to GeoLocator
          </Link>
        </main>
      </div>
    )
  }

  return <ComparePreview />
}
