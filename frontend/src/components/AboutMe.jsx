import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import SEO from './SEO';

const AboutMe = () => {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true); // Added loading state
  
  useEffect(() => {
    document.title = "Audrius Morkūnas | Portfolio";
    
    // This updates the meta description dynamically
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Explore the portfolio of Audrius Morkūnas - Creator of AdotByte AI.");
    }
  }, []);

  useEffect(() => {
    fetch('/api/about_me/')
      .then((res) => res.json())
      .then((data) => {
        setContent(data.content);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching markdown:", err);
        setIsLoading(false);
      });
  }, []);

  const skillCategories = [
    { name: "Infrastructure", items: ["Linux", "Docker", "Nginx"] },
    { name: "Backend", items: ["Django", "Python", "Postgres"] },
    { name: "Frontend", items: ["React", "Tailwind"] }
  ];

return (
    <>
      <SEO 
        title="About Me" 
        description="Explore the portfolio of Audrius Morkūnas - Creator of AdotByte AI. Linux, Docker, Django, and React." 
        path="/" 
      />
      {/* Changed: Added overflow-x-hidden here just to be safe */}
      <section id="about" className="w-full relative bg-white py-auto overflow-x-hidden">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-8">
          
          <div className="mb-12 flex items-center gap-6">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight"></h2>
            <div className="h-[1px] flex-grow bg-gray-100"></div>
          </div>

          {/* Changed: gap-16 is too big for some screens, reduced to gap-8 on smaller screens */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-16 items-start w-full max-w-full">
            
            <div className="lg:col-span-8 w-full min-w-0"> {/* min-w-0 is a CSS grid trick to stop overflow */}
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-8 bg-gray-100 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-100 rounded w-full"></div>
                  <div className="h-4 bg-gray-100 rounded w-full"></div>
                </div>
              ) : (
                /* Changed: Added break-words and overflow-hidden to the article */
                <article className="prose prose-sm md:prose-base max-w-none break-words overflow-hidden
                  prose-headings:text-gray-900 prose-headings:font-bold prose-headings:tracking-tight
                  prose-h1:text-3xl prose-h1:mb-4 
                  prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3 
                  prose-p:text-gray-700 prose-p:leading-relaxed 
                  prose-li:text-gray-700
                  prose-hr:my-6">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </article>
              )}
            </div>

            <aside className="lg:col-span-4 sticky top-28 w-full"> 
              <div className="bg-slate-50 p-7 rounded-[2rem] border border-slate-100 shadow-sm">
                <h3 className="text-[11px] font-black text-blue-700 uppercase tracking-[0.2em] mb-6">Technical Stack</h3>
                
                <div className="space-y-6">
                  {skillCategories.map((cat) => (
                    <div key={cat.name}>
                      <p className="text-[11px] font-bold text-gray-600 uppercase mb-3 tracking-wider">{cat.name}</p>
                      <div className="flex flex-wrap gap-2">
                        {cat.items.map(skill => (
                          <span key={skill} className="px-3 py-1 bg-white border border-slate-200 text-slate-800 text-[11px] font-semibold rounded-lg shadow-sm whitespace-nowrap">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-6 mt-8 border-t border-slate-200 flex items-center justify-between text-[11px]">
                  <span className="text-gray-700 font-semibold">Status:</span>
                  <span className="text-green-700 font-bold flex items-center">
                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    ONLINE
                  </span>
                </div>

                <div className="mt-5 bg-slate-900 p-4 rounded-2xl font-mono text-[11px] text-blue-300 shadow-inner overflow-hidden">
                  <div className="flex gap-1.5 mb-2">
                    <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                  </div>
                  <span className="text-gray-500">$</span> uptime: <span className="text-white">up 24/7</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutMe;