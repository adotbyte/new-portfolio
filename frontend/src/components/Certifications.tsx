import { getTranslations } from 'next-intl/server';

const Certifications = async () => {
  const t = await getTranslations('certifications');

  const certs = [
    {
      name: 'AWS Certified Cloud Practitioner',
      issuer: 'Amazon Web Services',
      date: '2025',
      url: 'https://www.credly.com/earner/earned/badge/6a3d2231-79c9-485e-9442-981ac2b4049f', // <-- Pakeiskite į savo Credly nuorodą
      icon: '☁️',
    },
  ];

  return (
    <section className="bg-white py-16 dark:bg-gray-950">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="mb-12 flex items-center gap-6">
          <h2 className="whitespace-nowrap text-3xl font-black tracking-tight text-gray-900 dark:text-white">
            {t('title')}
          </h2>
          <div className="h-[1px] flex-grow bg-gray-100 dark:bg-gray-800"></div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {certs.map((cert) => (
            <a
              key={cert.name}
              href={cert.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col justify-between rounded-3xl border border-slate-100 bg-slate-50 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-700 dark:hover:shadow-blue-950"
            >
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-3xl">{cert.icon}</span>
                  <div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">
                      {cert.name}
                    </h3>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-600">
                      {cert.issuer} · {cert.date}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-2 text-sm font-bold text-blue-600 transition-colors group-hover:text-blue-700 dark:text-blue-700 dark:group-hover:text-blue-300">
                <span>{t('verify')}</span>
                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Certifications;
