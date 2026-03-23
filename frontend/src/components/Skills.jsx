import React from 'react';
import SEO from './SEO';

const Skills = () => {
  const skillCategories = [
    {
      title: "Systems & Infrastructure",
      subtitle: "The Core",
      skills: ["Linux Server Admin", "Virtualization", "Hardware Diagnostics", "Network Architecture"]
    },
    {
      title: "Backend & Servers",
      subtitle: "The Engine",
      skills: ["Django", "Python", "PostgreSQL", "Nginx/Apache"]
    },
    {
      title: "Security & Web",
      subtitle: "The Shield",
      skills: ["DNS Management", "Cloudflare", "SSL/TLS", "Server Hardening"]
    },
    {
      title: "Modern Tools",
      subtitle: "The Workflow",
      skills: ["Docker", "Git/GitHub", "React (Frontend)", "Tailwind CSS"]
    }
  ];

return (
  <>
    <SEO 
        title="Technical Skills" 
        description="Explore the technical expertise of Audrius Morkūnas: Systems Administration, Backend Development with Django, and Modern Web Tools." 
        path="Portfolio" 
    />
  <section className="min-h-[87vh] flex flex-col justify-center bg-white py-12">
    <div className="w-full max-w-7xl mx-auto px-6">
      
      {/* Header */}
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <h2 className="text-4xl font-black text-gray-900 tracking-tight sm:text-5xl">
          Technical Expertise
        </h2>
        {/* FIXED: text-gray-600 -> text-gray-700 for better contrast */}
        <p className="text-gray-700 mt-6 text-lg leading-relaxed">
          I approach technology from the <span className="text-blue-700 font-bold underline decoration-blue-200 underline-offset-4">Server-side down</span>. 
          With a deep foundation in computer hardware, OS architecture, and networking, 
          I build web applications that aren't just code—they are stable, optimized systems.
        </p>
      </div>

      {/* The Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {skillCategories.map((category, index) => (
          <div 
            key={index} 
            className="group p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-200 transition-all duration-500 hover:-translate-y-2"
          >
            {/* FIXED: text-blue-500 -> text-blue-700 for baseline contrast */}
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-700 group-hover:text-blue-100 transition-colors">
              {category.subtitle}
            </span>
            <h3 className="text-xl font-bold text-gray-900 mt-2 mb-6 group-hover:text-white transition-colors">
              {category.title}
            </h3>
            <ul className="space-y-4">
              {category.skills.map((skill) => (
                <li key={skill} className="flex items-center text-sm font-semibold text-gray-700 group-hover:text-white transition-colors">
                  {/* FIXED: Dot color for visibility */}
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 group-hover:bg-blue-200 shrink-0"></div>
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Hardware Note */}
      <div className="mt-16 p-8 bg-blue-50 rounded-2xl border border-blue-100 text-center max-w-4xl mx-auto shadow-sm">
        {/* FIXED: Contrast for text inside light blue box */}
        <p className="text-blue-900 font-bold text-sm">
          🛠️ Deep Tech Knowledge: <span className="text-blue-800 font-medium ml-1">From PC building and hardware troubleshooting to complex internet protocols—I understand the physical and logical layers of the web.</span>
        </p>
      </div>
    </div>
  </section>
  </>
);
};

export default Skills;