import AboutMe from '@/components/AboutMe';
import Skills from '@/components/Skills';
import Contact from '@/components/Contact';
import DotGrid from '@/components/DotGrid';
import Certifications from '@/components/Certifications';
import DeferredSection from '@/components/DeferredSection';
import ChatbotWrapper from '@/components/ChatbotWrapper';
import dynamic from 'next/dynamic';
import { headers } from 'next/headers';

// Dinaminiai importai su ssr: false per wrapper
const HomeLab = dynamic(() => import('@/components/HomeLab'), {
  loading: () => <div className="h-96 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />,
});

const LiveStats = dynamic(() => import('@/components/LiveStats'), {
  loading: () => <div className="h-64 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />,
});

import type { Metadata } from 'next';

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const isLt = locale === 'lt';
  const baseUrl = 'https://morkunas.info';

  const title = isLt
    ? 'Audrius Morkūnas | AI & Next.js Kūrėjas'
    : 'Audrius Morkūnas | AI & Next.js Developer';

  // Konkretesnis aprašymas su išskirtiniais pasiekimais
  const description = isLt
    ? 'Savamokslis infrastruktūros entuziastas. Kuriu stabilias, saugias sistemas su Next.js, Docker ir AI (Claude API). 100 balų našumas, A+ saugumas.'
    : 'Self-taught infrastructure enthusiast. I build stable, secure systems with Next.js, Docker, and AI (Claude API). 100/100 Lighthouse, A+ Security.';

  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
    },

    // HERE IS THE MOST IMPORTANT PART REGARDING THE TWO LANGUAGES:
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        lt: `${baseUrl}/lt`,
        en: `${baseUrl}/en`,
        'x-default': `${baseUrl}/en`,
      },
    },

    openGraph: {
      title,
      description,

      url: `${baseUrl}/${locale}`,
      siteName: 'Audrius Morkūnas Portfolio',
      images: [
        {
          url: `${baseUrl}/logo.png`,
          width: 512,
          height: 512,
          alt: 'Audrius Morkūnas Portfolio',
        },
      ],
      locale: isLt ? 'lt_LT' : 'en_US',
      type: 'website',
    },

    facebook: {
      appId: process.env.FB_APP_ID || '',
    },
  };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const nonce = (await headers()).get('x-nonce') ?? undefined;

  // JSON-LD Schema data (dabar masyvas su dviem schemomis)
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      mainEntity: {
        '@type': 'Person',
        name: 'Audrius Morkūnas',
        givenName: 'Audrius',
        familyName: 'Morkūnas',
        jobTitle:
          locale === 'lt' ? 'Kūrėjas, Serverių Administratorius' : 'Creator, Server Administrator',
        description:
          locale === 'lt'
            ? 'Audriaus Morkūno asmeninis portfolio. AI chatbot kūrimas, Next.js, Docker, Linux.'
            : 'Audrius Morkūnas personal portfolio. AI chatbot creation, Next.js, Docker, Linux.',
        url: `https://morkunas.info/${locale}`,
        image: 'https://morkunas.info/logo.png',
        sameAs: [
          'https://www.linkedin.com/in/audrius-morkunas-939a2581/',
          'https://github.com/adotbyte',
        ],
        knowsAbout: ['Next.js', 'React', 'Docker', 'Linux', 'Artificial Intelligence', 'Chatbots'],
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Audrius Morkūnas | Portfolio',
      url: 'https://morkunas.info',
      alternateName: 'morkunas.info',
    },
  ];

  return (
    <>
      <DotGrid />
      {/* JSON-LD code for Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section id="about">
        <AboutMe locale={locale} />
      </section>
      <section id="portfolio">
        <Skills />
        <Certifications />
      </section>
      <section id="homelab">
        <DeferredSection>
          <HomeLab />
        </DeferredSection>
        {/* Įdedame LiveStats PO HomeLab, kad būtų Namų laboratorijos sekcijoje */}
        <div className="mx-auto max-w-6xl px-4 pb-12">
          <DeferredSection>
            <LiveStats />
          </DeferredSection>
        </div>
      </section>
      <section id="contact">
        <Contact />
        <ChatbotWrapper nonce={nonce} />
      </section>
    </>
  );
}
