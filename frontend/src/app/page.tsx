import AboutMe from '@/components/AboutMe';
import Skills from '@/components/Skills';
import HomeLab from '@/components/HomeLab';
import Contact from '@/components/Contact';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
  title: 'Audrius Morkūnas | Portfolio',
  description: 'Portfolio of Audrius Morkūnas — Creator AI chatbot, Next.js, Docker, Linux server admin on Raspberry Pi 5.',
  openGraph: {
    title: 'Audrius Morkūnas | Portfolio',
    description: 'Portfolio of Audrius Morkūnas — Creator AI chatbot, Next.js, Docker, Linux server admin on Raspberry Pi 5.',
    url: 'https://morkunas.info',
    siteName: 'Audrius Morkūnas Portfolio',
    images: [
      {
        url: 'https://morkunas.info/logo.png',
        width: 512,
        height: 512,
        alt: 'Audrius Morkūnas Portfolio',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  other: {
    'fb:app_id': process.env.NEXT_PUBLIC_FB_APP_ID ?? '',
  },
};
}

export default function Home() {
  return (
    <>
      <section id="about"><AboutMe /></section>
      <section id="portfolio"><Skills /></section>
      <section id="homelab"><HomeLab /></section>
      <section id="contact"><Contact /></section>
    </>
  );
}
