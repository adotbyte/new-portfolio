import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

export const alt = 'Audrius Morkūnas Blog';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Nuskaitome straipsnio pavadinimą
  let title = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  try {
    const filePath = join(process.cwd(), 'public', 'blog', `${slug}.lt.md`);
    const content = readFileSync(filePath, 'utf-8');
    const firstLine = content.split('\n')[0];
    if (firstLine.startsWith('# ')) title = firstLine.replace('# ', '');
  } catch {}

  // Nuskaitome logotipą
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
        alignItems: 'flex-start',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
        padding: '80px',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Logotipas */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
        <img
          src={logoUrl}
          width={200}
          height={200}
          style={{ borderRadius: '16px', objectFit: 'contain' }}
          alt="Logo"
        />
        <div style={{ color: '#94a3b8', fontSize: 28, marginLeft: '20px' }}>morkunas.info/blog</div>
      </div>

      {/* Straipsnio pavadinimas */}
      <div
        style={{
          fontSize: 64,
          fontWeight: 'bold',
          color: 'white',
          lineHeight: 1.2,
          maxWidth: '1000px',
        }}
      >
        {title}
      </div>

      {/* Apatinė eilutė */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginTop: 'auto',
          color: '#94a3b8',
          fontSize: 24,
        }}
      >
        <span>Audrius Morkūnas | Blog</span>
      </div>
    </div>,
    { ...size }
  );
}
