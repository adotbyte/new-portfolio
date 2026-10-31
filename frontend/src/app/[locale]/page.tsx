import AboutMe from '@/components/AboutMe';
import Skills from '@/components/Skills';
import HomeLab from '@/components/HomeLab';
import Contact from '@/components/Contact';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const isLt = locale === 'lt';
  const baseUrl = 'https://morkunas.info';

  return {
    title: 'Audrius Morkūnas | Portfolio',
    description: isLt
      ? 'Audriaus Morkūno portfolio — AI chatbot kūrėjas, Next.js, Docker, Linux serverių administratorius (Raspberry Pi 5).'
      : 'Portfolio of Audrius Morkūnas — Creator AI chatbot, Next.js, Docker, Linux server admin on Raspberry Pi 5.',

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
      title: 'Audrius Morkūnas | Portfolio',
      description: isLt
        ? 'Audriaus Morkūno portfolio — AI chatbot kūrėjas, Next.js, Docker, Linux serverių administratorius.'
        : 'Portfolio of Audrius Morkūnas — Creator AI chatbot, Next.js, Docker, Linux server admin on Raspberry Pi 5.',
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
  };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // JSON-LD Schema data
  const jsonLd = {
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
  };

  return (
    <>
      {/* JSON-LD code for Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section id="about">
        <AboutMe />
      </section>
      <section id="portfolio">
        <Skills />
      </section>
      <section id="homelab">
        <HomeLab />
      </section>
      <section id="contact">
        <Contact />
      </section>
    </>
  );
}
