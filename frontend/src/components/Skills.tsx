import { getTranslations } from 'next-intl/server';

const stackColors: Record<string, string> = {
  'Next.js': 'bg-black text-white dark:bg-white dark:text-black',
  React: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  Tailwind: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300',
  'Anthropic Claude': 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
  Docker: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  Linux: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
  Cloudflare: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
  'Raspberry Pi 5': 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
  WireGuard: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
  Python: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
  PostgreSQL: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300',
};

const Skills = async () => {
  const t = await getTranslations('skills');

  const skillCategories = [
    {
      title: t('categories.systemsTitle'),
      subtitle: t('categories.systemsSubtitle'),
      skills: [
        t('skills.linuxAdmin'),
        t('skills.virtualization'),
        t('skills.hardware'),
        t('skills.network'),
      ],
    },
    {
      title: t('categories.backendTitle'),
      subtitle: t('categories.backendSubtitle'),
      skills: [t('skills.django'), t('skills.python'), t('skills.postgresql'), t('skills.nginx')],
    },
    {
      title: t('categories.securityTitle'),
      subtitle: t('categories.securitySubtitle'),
      skills: [t('skills.dns'), t('skills.cloudflare'), t('skills.ssl'), t('skills.hardening')],
    },
    {
      title: t('categories.toolsTitle'),
      subtitle: t('categories.toolsSubtitle'),
      skills: [
        t('skills.docker'),
        t('skills.git'),
        t('skills.nextjs'),
        t('skills.react'),
        t('skills.tailwind'),
      ],
    },
  ];

  const projects = [
    {
      name: t('projects.portfolioName'),
      description: t('projects.portfolioDesc'),
      stack: ['Next.js 16', 'React', 'Tailwind', 'Anthropic Claude', 'Docker', 'Cloudflare'],
      link: 'https://morkunas.info',
      github: 'https://github.com/adotbyte',
      icon: '🚀',
      status: t('projects.portfolioStatus'),
    },
    {
      name: t('projects.homelabName'),
      description: t('projects.homelabDesc'),
      stack: ['Docker', 'Linux', 'Cloudflare', 'Raspberry Pi 5', 'WireGuard'],
      link: null,
      github: null,
      icon: '🏠',
      status: t('projects.homelabStatus'),
    },
    {
      name: t('projects.knowledgeBaseName'),
      description: t('projects.knowledgeBaseDesc'),
      stack: ['Next.js 16', 'Prisma', 'PostgreSQL', 'Google Gemini', 'Cloudflare'],
      link: 'https://knowledge.morkunas.info/public',
      github: 'https://github.com/adotbyte/knowledge-base',
      icon: '🧠',
      status: t('projects.knowledgeBaseStatus'),
    },
  ];

  return (
    <section className="flex min-h-[87vh] flex-col justify-center bg-white py-12 dark:bg-gray-950">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            {t('title')}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-gray-700 dark:text-gray-300">
            {t('description')}{' '}
            <span className="font-bold text-blue-700 underline decoration-blue-200 underline-offset-4 dark:text-blue-700">
              {t('descriptionHighlight')}
            </span>
            {t('descriptionRest')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {skillCategories.map((category, index) => (
            <div
              key={index}
              className="rounded-3xl border border-slate-100 bg-slate-50 p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-200 dark:border-gray-700 dark:bg-gray-800"
            >
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-700 dark:text-blue-700">
                {category.subtitle}
              </span>
              <h3 className="mb-6 mt-2 text-xl font-bold text-gray-900 dark:text-white">
                {category.title}
              </h3>
              <ul className="space-y-4">
                {category.skills.map((skill) => (
                  <li
                    key={skill}
                    className="group flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300"
                  >
                    {/* 
            Šviesiame fone: baltas taškas -> hover metu mėlynas 
            Tamsiame fone: mėlynas taškas -> hover metu baltas 
          */}
                    <div className="mr-3 h-2 w-2 shrink-0 rounded-full border border-slate-300 bg-white transition-colors duration-200 group-hover:border-blue-600 group-hover:bg-blue-600 dark:border-blue-600 dark:bg-blue-600 dark:group-hover:border-white dark:group-hover:bg-white"></div>

                    <span className="transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-white">
                      {skill}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-4xl rounded-2xl border border-blue-100 bg-blue-50 p-8 text-center shadow-sm dark:border-blue-900 dark:bg-blue-950">
          <p className="text-sm font-bold text-blue-900 dark:text-blue-200">
            {t('deepTechLabel')}{' '}
            <span className="ml-1 font-medium text-blue-800 dark:text-blue-300">
              {t('deepTechText')}
            </span>
          </p>
        </div>

        <div className="mt-24">
          <div className="mb-12 flex items-center gap-6">
            <h2 className="whitespace-nowrap text-3xl font-black tracking-tight text-gray-900 dark:text-white">
              {t('projectsTitle')}
            </h2>
            <div className="h-[1px] flex-grow bg-gray-100 dark:bg-gray-800"></div>
            <span className="whitespace-nowrap font-mono text-xs text-gray-600 dark:text-gray-500">
              {projects.length} {t('built')}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {projects.map((project) => (
              <div
                key={project.name}
                className="group overflow-hidden rounded-3xl border border-slate-100 bg-slate-50 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-700 dark:hover:shadow-blue-950"
              >
                <div className="p-8">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{project.icon}</span>
                      <div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white">
                          {project.name}
                        </h3>
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-green-700 dark:text-green-400">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500"></span>
                          {project.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-xl border border-gray-200 bg-white p-2 text-gray-600 transition-colors hover:border-blue-300 hover:text-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                          aria-label="GitHub"
                        >
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                          </svg>
                        </a>
                      )}
                      {project.link && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-xl bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700"
                          aria-label="Live site"
                        >
                          <svg
                            className="h-4 w-4"
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
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="mb-6 text-sm leading-relaxed text-gray-600 dark:text-gray-600">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.stack.map((tech) => (
                      <span
                        key={tech}
                        className={`rounded-lg px-2.5 py-1 text-[10px] font-bold ${stackColors[tech] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;
