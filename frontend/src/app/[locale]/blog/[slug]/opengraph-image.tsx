import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

export const alt = 'Audrius Morkūnas Blog';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
  const { slug } = await params;

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
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            backgroundColor: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '40px',
            fontWeight: 'bold',
          }}
        >
          AM
        </div>
        <div style={{ color: '#94a3b8', fontSize: 28, marginLeft: '20px' }}>morkunas.info</div>
      </div>
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
      <div style={{ color: '#3b82f6', fontSize: 24, marginTop: 'auto', fontWeight: 'bold' }}>
        Audrius Morkūnas | Blog
      </div>
    </div>,
    { ...size }
  );
}
