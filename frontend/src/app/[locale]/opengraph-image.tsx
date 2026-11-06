import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

export const alt = 'Audrius Morkūnas | AI & Next.js Developer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  // Nuskaitome VISĄ paveikslėlį
  const imageBuffer = readFileSync(join(process.cwd(), 'public', 'logo.png'));
  const imageBase64 = imageBuffer.toString('base64');
  const imageUrl = `data:image/png;base64,${imageBase64}`;

  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#111827',
      }}
    >
      <img
        src={imageUrl}
        width={1200}
        height={630}
        style={{ objectFit: 'cover' }}
        alt="Open Graph"
      />
    </div>,
    { ...size }
  );
}
