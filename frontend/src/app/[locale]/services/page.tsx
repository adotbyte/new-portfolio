import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Server, ShieldCheck, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';

import { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isLt = locale === 'lt';

  return {
    title: isLt ? 'Paslaugos | Audrius Morkūnas' : 'Services | Audrius Morkūnas',
    description: isLt
      ? 'Stabilios, saugios ir automatiškai save prižiūrinčios serverių infrastruktūros.'
      : 'Stable, secure, and self-maintaining server infrastructures.',
  };
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'services' });

  const packages = [
    {
      id: 'rescue',
      icon: <Server className="h-8 w-8 text-blue-600 dark:text-blue-700" />,
      ...t.raw('packages.rescue'), // Naudojame vertimus
      accent: 'border-gray-200 dark:border-gray-800',
    },
    {
      id: 'infrastructure',
      icon: <ShieldCheck className="h-8 w-8 text-purple-600 dark:text-purple-400" />,
      ...t.raw('packages.infrastructure'),
      accent:
        'border-purple-200 dark:border-purple-900/50 shadow-lg shadow-purple-100 dark:shadow-purple-900/10',
      isPopular: true,
    },
    {
      id: 'maintenance',
      icon: <RefreshCw className="h-8 w-8 text-green-700 dark:text-green-400" />,
      ...t.raw('packages.maintenance'),
      accent: 'border-gray-200 dark:border-gray-800',
    },
  ];

  return (
    <div className="min-h-screen bg-white py-24 dark:bg-gray-950 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Antraštė */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600 dark:text-blue-700">
            {t('badge')}
          </h2>
          <p className="mt-2 text-4xl font-black tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            {t('title')}
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-600">
            {t('description')}
          </p>
        </div>

        {/* Kortelės */}
        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-3">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative flex flex-col rounded-3xl border bg-white p-8 dark:bg-gray-900 ${pkg.accent} transition-transform duration-300 hover:-translate-y-1`}
            >
              {pkg.isPopular && (
                <div className="absolute right-8 top-0 -translate-y-1/2">
                  <span className="inline-flex items-center rounded-full bg-purple-600 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white">
                    {pkg.popular}
                  </span>
                </div>
              )}

              <div className="mb-6">{pkg.icon}</div>
              <h3 className="mb-1 text-2xl font-bold text-gray-900 dark:text-white">{pkg.title}</h3>
              <p className="mb-4 text-sm font-medium text-gray-500 dark:text-gray-600">
                {pkg.subtitle}
              </p>
              <div className="mb-6 text-3xl font-black text-gray-900 dark:text-white">
                {pkg.price}
              </div>

              <ul className="mb-8 flex-1 space-y-4">
                {pkg.features.map((feature: string, i: number) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300"
                  >
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={`/${locale}/Contact`}
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition-colors ${
                  pkg.isPopular
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700'
                }`}
              >
                {pkg.button}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>

        {/* Papildoma info */}
        <div className="mt-24 text-center">
          <p className="text-gray-600 dark:text-gray-600">
            {t('cta.text')}{' '}
            <Link
              href={`/${locale}/Contact`}
              className="font-semibold text-blue-600 hover:underline dark:text-blue-700"
            >
              {t('cta.link')}
            </Link>{' '}
            {t('cta.suffix')}
          </p>
        </div>
      </div>
    </div>
  );
}
