import type { Metadata } from 'next'
import '@moneydevkit/nextjs/mdk-styles.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'GeoLocator — AI Photo Geolocation',
  description:
    'Upload a photo and AI identifies the top 3 most likely locations it was taken. Powered by Google Gemini 3.1 Flash Lite Preview. Pay 100 sats via Lightning.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        {children}
        <footer className="border-t mt-auto py-4 text-center text-xs text-muted-foreground">
          <a
            href="https://github.com/paulosacramento/Geolocator-Paywall"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            View on GitHub
          </a>
        </footer>
      </body>
    </html>
  )
}
