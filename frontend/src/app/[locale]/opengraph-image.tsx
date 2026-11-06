import { ImageResponse } from 'next/og';

export const alt = 'Audrius Morkūnas | AI & Next.js Developer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  // Naudojame TIESIOGINĮ URL į tavo logotipą
  // (šis URL turi būti pasiekiamas viešai, pvz., https://morkunas.info/logo.webp)
  const logoUrl = 'https://morkunas.info/logo.webp';

  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
      }}
    >
      <img
        src={logoUrl}
        width={1200}
        height={630}
        style={{ objectFit: 'cover' }}
        alt="Audrius Morkūnas"
      />
    </div>,
    { ...size }
  );
}
