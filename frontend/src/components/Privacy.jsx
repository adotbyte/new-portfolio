import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Privacy = () => {
  const navigate = useNavigate();
  useEffect(() => {
    document.title = "Privacy Policy | Audrius Morkūnas";
    window.scrollTo(0, 0); // Ensure page starts at the top
  }, []);
  return (
    <section className="min-h-screen bg-white w-full flex flex-col justify-center py-20">
      <div className="w-full max-w-4xl mx-auto px-8">
        
        {/* Header */}
        <div className="mb-12 flex items-center gap-6">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Privacy Policy</h1>
          <div className="h-[1px] flex-grow bg-gray-100"></div>
          <span className="text-xs font-mono text-gray-400">v.2026.03</span>
        </div>

        {/* Content Box */}
        <article className="prose prose-slate prose-sm md:prose-base max-w-none 
          prose-h3:text-blue-600 prose-h3:font-bold prose-h3:mt-8
          prose-strong:text-gray-900 prose-p:text-gray-600 prose-p:leading-relaxed">
          
          <p className="text-sm italic text-gray-400 mb-8">Last Updated: March 2026</p>
          
          <h3>1. Data We Process</h3>
          <p>This site is designed to be privacy-first. We do not sell your data.</p>
          <ul>
            <li><strong>Chat History:</strong> This is stored in your local session. If you clear your browser cookies, this history is deleted.</li>
            <li><strong>Preferences:</strong> We store a small cookie to remember your Dark/Light mode choice.</li>
            <li><strong>Security:</strong> Standard Django CSRF tokens are used to prevent cross-site attacks.</li>
          </ul>

          <h3>2. Third Parties</h3>
          <p>We use <strong>Gemini AI</strong> to power the chat. Any prompts you send are processed by Google. We do not send your personal identity to them.</p>

          <h3>3. Your Rights</h3>
          <p>As an EU resident, you have the right to access or delete your data. Since we use local sessions, you can exercise this right simply by clicking "Wipe All My Data" in the footer or clearing your browser cache.</p>

          <h3>4. Server Logs and SEO</h3>
          <p>
            To ensure the security and performance of this site, our server automatically 
            logs standard technical information when you visit. This includes your 
            <strong> IP address</strong>, browser type, and the pages you access. 
          </p>
          <p className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <strong>Legal Basis:</strong> We process this data based on our 
            <em> Legitimate Interest</em> (GDPR Art. 6(1)(f)) to maintain website security, 
            prevent fraud, and allow search engines to crawl and index the site accurately.
          </p>

          <h3>5. Data Retention</h3>
          <p>
            Server logs are typically kept for 30 days before being automatically deleted. 
            Your <strong>Chat History</strong> and <strong>Theme Preferences </strong> 
            stay on your device until you choose to clear them.
          </p>
        </article>

        {/* Back Button */}
        <div className="mt-12 pt-8 border-t border-gray-100">
            <button 
              onClick={() => navigate(-1)} 
              className="text-blue-600 font-bold text-sm hover:underline cursor-pointer flex items-center"
            >
              ← Back to Portfolio
            </button>
        </div>
      </div>
    </section>
  );
};

export default Privacy;