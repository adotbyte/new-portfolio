import { getTranslations } from 'next-intl/server';

const stackColors: Record<string, string> = {
  'Next.js': 'bg-black text-white dark:bg-white dark:text-black',
  'React': 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  'Tailwind': 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300',
  'Anthropic Claude': 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
  'Docker': 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  'Linux': 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
  'Cloudflare': 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
  'Raspberry Pi 5': 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
  'WireGuard': 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
  'Python': 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
  'PostgreSQL': 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300',
};

const Skills = async () => {
  const t = await getTranslations('skills');

  const skillCategories = [
    { title: t('categories.systemsTitle'), subtitle: t('categories.systemsSubtitle'), skills: [t('skills.linuxAdmin'), t('skills.virtualization'), t('skills.hardware'), t('skills.network')] },
    { title: t('categories.backendTitle'), subtitle: t('categories.backendSubtitle'), skills: [t('skills.django'), t('skills.python'), t('skills.postgresql'), t('skills.nginx')] },
    { title: t('categories.securityTitle'), subtitle: t('categories.securitySubtitle'), skills: [t('skills.dns'), t('skills.cloudflare'), t('skills.ssl'), t('skills.hardening')] },
    { title: t('categories.toolsTitle'), subtitle: t('categories.toolsSubtitle'), skills: [t('skills.docker'), t('skills.git'), t('skills.nextjs'), t('skills.react'), t('skills.tailwind')] },
  ];

  const projects = [
    {
      name: t('projects.portfolioName'),
      description: t('projects.portfolioDesc'),
      stack: ['Next.js', 'React', 'Tailwind', 'Anthropic Claude', 'Docker'],
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
  ];

  return (
    <section className="min-h-[87vh] flex flex-col justify-center bg-white dark:bg-gray-950 py-12">
      <div className="w-full max-w-7xl mx-auto px-6">

        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight sm:text-5xl">
            {t('title')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mt-6 text-lg leading-relaxed">
            {t('description')}{' '}
            <span className="text-blue-700 dark:text-blue-400 font-bold underline decoration-blue-200 underline-offset-4">
              {t('descriptionHighlight')}
            </span>
            {t('descriptionRest')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {skillCategories.map((category, index) => (
            <div key={index} className="group p-8 bg-slate-50 dark:bg-gray-800 rounded-3xl border border-slate-100 dark:border-gray-700 hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-200 transition-all duration-500 hover:-translate-y-2">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-700 dark:text-blue-400 group-hover:text-blue-100 transition-colors">
                {category.subtitle}
              </span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-2 mb-6 group-hover:text-white transition-colors">
                {category.title}
              </h3>
              <ul className="space-y-4">
                {category.skills.map((skill) => (
                  <li key={skill} className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-white transition-colors">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 group-hover:bg-blue-200 shrink-0"></div>
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 p-8 bg-blue-50 dark:bg-blue-950 rounded-2xl border border-blue-100 dark:border-blue-900 text-center max-w-4xl mx-auto shadow-sm">
          <p className="text-blue-900 dark:text-blue-200 font-bold text-sm">
            {t('deepTechLabel')}{' '}
            <span className="text-blue-800 dark:text-blue-300 font-medium ml-1">
              {t('deepTechText')}
            </span>
          </p>
        </div>

        <div className="mt-24">
          <div className="mb-12 flex items-center gap-6">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight whitespace-nowrap">
              {t('projectsTitle')}
            </h2>
            <div className="h-[1px] flex-grow bg-gray-100 dark:bg-gray-800"></div>
            <span className="text-xs font-mono text-gray-400 dark:text-gray-500 whitespace-nowrap">{projects.length} {t('built')}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <div key={project.name} className="group bg-slate-50 dark:bg-gray-800 rounded-3xl border border-slate-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-xl hover:shadow-blue-50 dark:hover:shadow-blue-950 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{project.icon}</span>
                      <div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white">{project.name}</h3>
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-green-600 dark:text-green-400">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                          {project.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {project.github && (
                        <a href={project.github} target="_blank" rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-blue-300 transition-colors text-gray-600 dark:text-gray-300 hover:text-blue-600"
                          aria-label="GitHub">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                          </svg>
                        </a>
                      )}
                      {project.link && (
                        <a href={project.link} target="_blank" rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors text-white"
                          aria-label="Live site">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.stack.map((tech) => (
                      <span key={tech} className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${stackColors[tech] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
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