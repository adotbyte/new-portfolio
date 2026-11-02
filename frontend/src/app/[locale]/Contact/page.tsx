import { routing } from '@/i18n/routing';
import Contact from '@/components/Contact';

// @next-codemod-ignore Cache Components adoption: this segment temporarily allows blocking.
// Remove this opt-out after verifying the segment passes validation without it.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata = {
  title: 'Contact | Audrius Morkūnas',
  description: 'Get in touch with Audrius Morkūnas.',
};

export default function ContactPage() {
  return <Contact />;
}
