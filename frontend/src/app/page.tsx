import AboutMe from '@/components/AboutMe';
import Skills from '@/components/Skills';
import HomeLab from '@/components/HomeLab';
import Contact from '@/components/Contact';

export const metadata = {
  title: 'Audrius Morkūnas | Portfolio',
  description: 'Explore the portfolio of Audrius Morkūnas - Creator of AdotByte AI. Linux, Docker, Next.js, and React.',
};

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
