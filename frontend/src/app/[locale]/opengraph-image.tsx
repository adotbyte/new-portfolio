import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

export const alt = 'Audrius Morkūnas | AI & Next.js Developer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isLt = locale === 'lt';

  // Nuskaitome logotipo ikoną
  const logoBuffer = readFileSync(join(process.cwd(), 'public', 'logo-icon.png'));
  const logoBase64 = logoBuffer.toString('base64');
  const logoUrl = `data:image/png;base64,${logoBase64}`;

  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
        padding: '80px',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Logotipas */}
      <img
        src={logoUrl}
        width={250}
        height={250}
        style={{ objectFit: 'contain', marginBottom: '40px' }}
        alt="Logo"
      />

      {/* Vardas */}
      <div
        style={{
          fontSize: 72,
          fontWeight: 'bold',
          color: 'white',
          lineHeight: 1.2,
          textAlign: 'center',
        }}
      >
        Audrius Morkūnas
      </div>

      {/* Specialybė */}
      <div
        style={{
          fontSize: 36,
          color: '#60a5fa',
          marginTop: '20px',
          fontWeight: '500',
        }}
      >
        {isLt ? 'AI & Next.js Kūrėjas' : 'AI & Next.js Developer'}
      </div>
    </div>,
    { ...size }
  );
}
