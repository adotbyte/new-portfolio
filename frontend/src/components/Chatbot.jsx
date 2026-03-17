import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, ChevronDown, ChevronUp, Check, X } from 'lucide-react';

export default function Chatbot() {
  // --- 1. PERSISTENT STATE ---
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('adotbyte_chat_history');
    return saved ? JSON.parse(saved) : [
      { role: 'ai', content: "Hi! I'm Audrius's AI Agent. I'll remember our chat even if you refresh!" }
    ];
  });

  const [lastSaved, setLastSaved] = useState(() => localStorage.getItem('adotbyte_chat_time') || '');
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 500);
  const [showConfirm, setShowConfirm] = useState(false);
  const [input, setInput] = useState('');
  const [isDark, setIsDark] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  // --- 2. EFFECTS ---
  useEffect(() => {
    localStorage.setItem('adotbyte_chat_history', JSON.stringify(messages));
    if (messages.length > 1) {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const date = new Date().toLocaleDateString([], { month: 'short', day: 'numeric' });
      const fullTime = `${date} at ${now}`;
      localStorage.setItem('adotbyte_chat_time', fullTime);
      setLastSaved(fullTime);
    }
  }, [messages]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 500);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const checkTheme = () => {
        const dark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
        setIsDark(dark);
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-bs-theme'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isCollapsed && isOpen) scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isCollapsed, isOpen]);

  // --- 3. ACTIONS ---
  const sendMessage = async (overrideInput) => {
    const messageToSend = overrideInput || input;
    if (!messageToSend.trim()) return;

    const userMsg = { role: 'user', content: messageToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]')?.value || ''
        },
        body: JSON.stringify({ message: messageToSend }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'ai', content: data.content }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, brain fog! Check connection." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = async () => {
    localStorage.removeItem('adotbyte_chat_history');
    localStorage.removeItem('adotbyte_chat_time');
    setLastSaved('');
    setMessages([{ role: 'ai', content: "History cleared! Fresh start." }]);
    setShowConfirm(false);
    try {
      await fetch('/api/delete-chat-history/', { 
        method: 'POST',
        headers: { 'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]')?.value || '' }
      });
    } catch (e) { console.error("Server sync failed"); }
  };

  const theme = {
    bg: isDark ? '#1a1d20' : '#ffffff',
    text: isDark ? '#f8fafc' : '#334155',
    msgAi: isDark ? '#2d333b' : '#ffffff',
    msgAiBorder: isDark ? '#444c56' : '#e2e8f0',
    inputBg: isDark ? '#2d333b' : '#f1f5f9',
    inputBorder: isDark ? '#444c56' : '#e2e8f0'
  };

  if (!isOpen) {
    return (
      <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 100000 }}>
        <button 
          onClick={() => setIsOpen(true)}
          aria-label="Open Chatbot" 
          style={{ 
            width: '65px', height: '65px', borderRadius: '20px', border: 'none', 
            background: 'linear-gradient(135deg, #2563eb 0%, #4338ca 100%)', 
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            boxShadow: '0 10px 25px rgba(37,99,235,0.4)', cursor: 'pointer',
            transition: 'transform 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <MessageCircle size={30} />
        </button>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      zIndex: 100000,
      bottom: isMobile ? '10px' : '30px',
      right: isMobile ? '10px' : '30px',
      width: isMobile ? 'calc(100% - 20px)' : '380px',
      height: isCollapsed ? '52px' : (isMobile ? '75vh' : '600px'),
      backgroundColor: theme.bg,
      borderRadius: '20px', // Fixed radius to prevent "square" jumping
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
      overflow: 'hidden',
      border: `1px solid ${theme.inputBorder}`,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)' // Smoother height-only transition
    }}>
      <style>{`
        .chat-content p { margin-bottom: 8px; }
        .hide-scroll::-webkit-scrollbar { display: none; }
        @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-5px); } }
      `}</style>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #2563eb 0%, #4338ca 100%)',
        padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', cursor: 'pointer',
        minHeight: '52px'
      }} onClick={() => setIsCollapsed(!isCollapsed)}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* ENHANCED LOGO: Added filter for glow and clear viewbox */}
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 1424 752" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ flexShrink: 0 }}
          >
        
            {/* The Main Logo Shapes */}
            <path d="M50.43 652.46 C51.52 652.45 52.61 652.43 53.73 652.41 C54.9 652.42 56.07 652.42 57.28 652.43..." fill="#f2f4f8"/>
            <path d="M786 214 C789.06 215.93 789.06 215.93 791 219 C792.03 223.72 791.65 226.93 789.12 231.06..." fill="#ffffff"/>
            <path d="M634.79 193.50 C653.18 193.61 663.47 202.09 675.82 214.52..." fill="#73DDED"/>
            <path d="M812.21 195.46 C814.15 195.94 816.07 196.46 818 197..." fill="#F5D585"/>
            
            {/* Note: I've truncated the path data for readability, paste your full paths here if the shapes look incomplete */}
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 'bold', fontSize: '14px', lineHeight: 1.2 }}>AdotByte AI</span>
            {lastSaved && !isCollapsed && <span style={{ fontSize: '9px', opacity: 0.8 }}>Last saved: {lastSaved}</span>}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {!isCollapsed && (
            showConfirm ? (
              <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: '6px' }} onClick={(e) => e.stopPropagation()}>
                <button onClick={clearChat} style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', padding: '2px' }}><Check size={16} /></button>
                <button onClick={() => setShowConfirm(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '2px' }}><X size={16} /></button>
              </div>
            ) : (
              <button onClick={(e) => { e.stopPropagation(); setShowConfirm(true); }} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.7 }}>
                <X size={16} style={{ transform: 'rotate(45deg)' }} />
              </button>
            )
          )}
          <button style={{ background: 'none', border: 'none', color: 'white', opacity: 0.9 }}>
            {isCollapsed ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} style={{ background: 'none', border: 'none', color: 'white', opacity: 0.9 }}>
            <X size={18} />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          <div className="hide-scroll" style={{ flex: 1, overflowY: 'auto', padding: '15px', backgroundColor: isDark ? '#0d1117' : '#f8fafc', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                <div style={{
                  padding: '10px 14px', borderRadius: '14px', fontSize: '14px', lineHeight: '1.45',
                  backgroundColor: m.role === 'user' ? '#2563eb' : theme.msgAi,
                  color: m.role === 'user' ? 'white' : theme.text,
                  border: m.role === 'user' ? 'none' : `1px solid ${theme.msgAiBorder}`,
                  boxShadow: m.role === 'user' ? '0 2px 8px rgba(37,99,235,0.2)' : 'none'
                }}>
                  <div className="chat-content" dangerouslySetInnerHTML={{ __html: m.content }} />
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ alignSelf: 'flex-start', backgroundColor: theme.msgAi, padding: '10px 14px', borderRadius: '14px', border: `1px solid ${theme.msgAiBorder}` }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[0, 0.2, 0.4].map((d, i) => (
                    <div key={i} style={{ width: '5px', height: '5px', backgroundColor: '#94a3b8', borderRadius: '50%', animation: `bounce 1.4s infinite ease-in-out ${d}s` }}></div>
                  ))}
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          <div className="hide-scroll" style={{ padding: '8px 12px', display: 'flex', gap: '6px', overflowX: 'auto', backgroundColor: isDark ? '#0d1117' : '#f8fafc', borderTop: `1px solid ${theme.inputBorder}` }}>
            {["🚀 Projects", "🛠️ Skills", "🍓 Raspberry Pi"].map((label, idx) => (
              <button key={idx} onClick={() => sendMessage(label)} style={{ whiteSpace: 'nowrap', padding: '5px 10px', borderRadius: '15px', fontSize: '11px', border: `1px solid ${theme.inputBorder}`, backgroundColor: theme.bg, color: theme.text, cursor: 'pointer' }}>
                {label}
              </button>
            ))}
          </div>

          <div style={{ padding: '12px', borderTop: `1px solid ${theme.inputBorder}`, backgroundColor: theme.bg }}>
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} style={{ display: 'flex', position: 'relative', alignItems: 'center' }}>
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." style={{ width: '100%', padding: '10px 40px 10px 12px', borderRadius: '10px', outline: 'none', border: `1px solid ${theme.inputBorder}`, backgroundColor: theme.inputBg, color: theme.text, fontSize: '14px' }} />
              <button type="submit" style={{ position: 'absolute', right: '6px', backgroundColor: '#2563eb', border: 'none', borderRadius: '6px', color: 'white', padding: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Send size={14} /></button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}