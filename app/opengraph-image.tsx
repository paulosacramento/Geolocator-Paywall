import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'GeoLocator — AI Photo Geolocation'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
          padding: '60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.1)',
              fontSize: '32px',
            }}
          >
            🌍
          </div>
          <span style={{ fontSize: '48px', fontWeight: 700 }}>GeoLocator</span>
        </div>
        <p
          style={{
            fontSize: '28px',
            opacity: 0.8,
            textAlign: 'center',
            maxWidth: '700px',
            lineHeight: 1.4,
          }}
        >
          Upload any photo and AI identifies the top 3 most likely locations it was taken.
        </p>
        <div
          style={{
            display: 'flex',
            gap: '24px',
            marginTop: '40px',
            fontSize: '18px',
            opacity: 0.6,
          }}
        >
          <span>Powered by Gemini</span>
          <span>·</span>
          <span>100 sats per analysis</span>
          <span>·</span>
          <span>Lightning payments</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
