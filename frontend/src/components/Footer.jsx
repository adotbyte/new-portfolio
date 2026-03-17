import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const currentYear = new Date().getFullYear();

  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

const handleFinalWipe = async () => {
    setIsWiping(true);
    try {
      // 1. Tell Django to clear the server-side history (ChromaDB/Session)
      const response = await fetch('/chat/clear/', { 
        method: "POST",
        headers: { 
            "X-CSRFToken": getCookie('csrftoken'), 
            "Content-Type": "application/json"
        }
      });

      const data = await response.json();

      if (data.status === "success" || response.ok) {
        // 2. Clear Browser Storage
        localStorage.clear();
        sessionStorage.clear();
        
        // 3. Clear All Cookies (The "Nuke" logic from your JS file)
        document.cookie.split(";").forEach((c) => {
            document.cookie = c
              .replace(/^ +/, "")
              .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });

        // 4. UI Feedback
        setIsWiping(false);
        setShowConfirm(false);
        setShowPrivacy(false);
        setShowSuccess(true);
        
        // 5. Hard Reset
        setTimeout(() => {
          window.location.href = "/"; // Redirect to home and refresh everything
        }, 2000);
      }
    } catch (err) {
      console.error("Wipe failed:", err);
      // Fallback: Clear local data even if the network fails
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <>
      {/* 1. Wipe Success Alert - Tailwind Centered */}
      {showSuccess && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[10002] bg-green-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce">
          <span className="font-bold">✓</span> 
          History and preferences cleared.
        </div>
      )}

      {/* 2. Main Footer - Centered and Tight */}
      <footer className="w-full py-8 border-t border-gray-100 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-600 text-xs font-medium tracking-wide">
            &copy; {currentYear} | 
            <button 
              type="button" 
              onClick={() => setShowPrivacy(true)}
              className="ml-2 text-gray-500 hover:text-blue-600 font-bold transition-colors underline underline-offset-4 decoration-gray-200 hover:decoration-blue-200"
            >
              Privacy & Cookies
            </button>
          </p>
        </div>
      </footer>

      {/* 3. Privacy Modal - Modern Tailwind UI */}
      {showPrivacy && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-gray-900">Privacy & Cookies</h2>
                <button onClick={() => setShowPrivacy(false)} aria-label="Close privacy modal" className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
              </div>
              
              <div className="space-y-4 text-sm text-gray-600 leading-relaxed text-left">
                <p>To provide a functional experience, this site uses:</p>
                <ul className="space-y-2">
                  <li className="flex gap-2">
                    <span className="text-blue-500">▹</span> 
                    <span><strong>Chat History:</strong> Saved in your browser locally.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-500">▹</span> 
                    <span><strong>Theme:</strong> Remembers your Dark/Light mode.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-500">▹</span> 
                    <span>
                      <strong>Read:</strong>
                      <Link 
                        to="Privacy" 
                        className="font-bold hover:underline ml-1"
                        onClick={() => setShowPrivacy(false)} 
                      >
                        Full Privacy Policy.
                      </Link>
                    </span>
                  </li>
                </ul>
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-amber-800 text-xs italic">
                  <strong>Safety Note:</strong> Clicking "Wipe Data" will permanently delete your chat history and reset all preferences.
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => setShowConfirm(true)}
                  className="flex-1 px-4 py-2.5 text-xs font-bold text-red-600 border border-red-100 hover:bg-red-50 rounded-xl transition-colors"
                >
                  Wipe Data
                </button>
                <button 
                  onClick={() => setShowPrivacy(false)}
                  className="flex-1 px-4 py-2.5 text-xs font-bold bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                >
                  I Understand
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Final Confirmation Modal - Dark Mode "Danger" Style */}
      {showConfirm && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 w-full max-w-sm rounded-[2rem] p-8 border border-slate-800 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 text-2xl">
              ⚠
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Final Warning</h3>
            <p className="text-slate-400 text-sm mb-8">This action is permanent. All settings and history will be destroyed.</p>
            
            <div className="flex flex-col gap-2">
              <button 
                onClick={handleFinalWipe}
                disabled={isWiping}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all disabled:opacity-50"
              >
                {isWiping ? 'Processing...' : 'Yes, Delete Everything'}
              </button>
              <button 
                onClick={() => setShowConfirm(false)}
                className="w-full py-3 text-slate-400 hover:text-white font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;