import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, ChevronDown, ChevronUp, Check, X, Download, Copy } from 'lucide-react';
import TypewriterMarkdown from './TypewriterMarkdown';
import { jsPDF } from "jspdf";

// Utility for Django CSRF
function getCookie(name) {
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
}

export default function Chatbot() {
  // --- 1. STATE ---
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
  const [copiedIndex, setCopiedIndex] = useState(null); // Added this
  const scrollRef = useRef(null);

  // --- 2. THEME ---
  const theme = {
    bg: isDark ? '#1a1d20' : '#ffffff',
    text: isDark ? '#f8fafc' : '#334155',
    msgAi: isDark ? '#2d333b' : '#ffffff',
    msgAiBorder: isDark ? '#444c56' : '#e2e8f0',
    inputBg: isDark ? '#2d333b' : '#f1f5f9',
    inputBorder: isDark ? '#444c56' : '#e2e8f0'
  };

  // --- 3. EFFECTS ---
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

  // --- 4. ACTIONS ---
  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const downloadTranscript = () => {
    try {
      const doc = new jsPDF();
      let yPos = 20;
      doc.setFontSize(16);
      doc.text("AdotByte AI Chat Transcript", 10, yPos);
      yPos += 15;

      messages.forEach((m) => {
        const cleanContent = m.content.replace(/<[^>]*>?/gm, '');
        const rolePrefix = m.role === 'user' ? "YOU: " : "ADOTBYTE: ";
        const splitText = doc.splitTextToSize(`${rolePrefix}${cleanContent}`, 180);
        
        if (yPos + (splitText.length * 7) > 280) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFontSize(10);
        doc.text(splitText, 10, yPos);
        yPos += (splitText.length * 7) + 10;
      });

      doc.save("Audrius_Resume_Chat.pdf");
    } catch (err) {
      console.error("PDF Error:", err);
    }
  };

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
          'X-CSRFToken': getCookie('csrftoken') || ''
        },
        body: JSON.stringify({ message: messageToSend }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'ai', content: data.content, isNew: true }]);
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
        headers: { 'X-CSRFToken': getCookie('csrftoken') || '' }
      });
    } catch (e) { console.error("Server sync failed"); }
  };

  // --- 5. RENDER ---
  if (!isOpen) {
    return (
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 100000, maxWidth: '100vw' }}>
        <button 
          onClick={() => setIsOpen(true)}
          style={{ 
            width: '65px', height: '65px', borderRadius: '20px', border: 'none', 
            background: 'linear-gradient(135deg, #2563eb 0%, #4338ca 100%)', 
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            boxShadow: '0 10px 25px rgba(37,99,235,0.4)', cursor: 'pointer'
          }}
        >
          <MessageCircle size={30} />
        </button>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed', zIndex: 100000, bottom: isMobile ? '10px' : '30px', right: isMobile ? '10px' : '30px',
      maxWidth: 'calc(100vw - 40px)',
      width: isMobile ? 'calc(100% - 20px)' : '380px', height: isCollapsed ? '52px' : (isMobile ? '75vh' : '600px'),
      backgroundColor: theme.bg, borderRadius: '20px', display: 'flex', flexDirection: 'column',
      boxShadow: '0 20px 50px rgba(0,0,0,0.25)', overflow: 'hidden', border: `1px solid ${theme.inputBorder}`,
      transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxSizing: 'border-box'
    }}>
      <style>{`
        .hide-scroll::-webkit-scrollbar { display: none; }
        @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-5px); } }
      `}</style>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #2563eb 0%, #4338ca 100%)',
        padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', cursor: 'pointer', minHeight: '52px'
      }} onClick={() => setIsCollapsed(!isCollapsed)}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MessageCircle size={20} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>AdotByte AI</span>
            {lastSaved && !isCollapsed && <span style={{ fontSize: '9px', opacity: 0.8 }}>{lastSaved}</span>}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {!isCollapsed && (
            <>
              <button onClick={(e) => { e.stopPropagation(); downloadTranscript(); }} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }}>
                <Download size={16} />
              </button>
              {showConfirm ? (
                <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: '6px' }} onClick={(e) => e.stopPropagation()}>
                  <button onClick={clearChat} style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer' }}><Check size={16} /></button>
                  <button onClick={() => setShowConfirm(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={16} /></button>
                </div>
              ) : (
                <button onClick={(e) => { e.stopPropagation(); setShowConfirm(true); }} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.7 }}>
                  <X size={16} style={{ transform: 'rotate(45deg)' }} />
                </button>
              )}
            </>
          )}
          <button style={{ background: 'none', border: 'none', color: 'white' }}>{isCollapsed ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</button>
          <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} style={{ background: 'none', border: 'none', color: 'white' }}><X size={18} /></button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          <div className="hide-scroll" style={{ flex: 1, overflowY: 'auto', padding: '15px', backgroundColor: isDark ? '#0d1117' : '#f8fafc', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', marginBottom: m.role === 'ai' ? '12px' : '0' }}>
                <div style={{
                  padding: '10px 14px', borderRadius: '14px', fontSize: '14px', position: 'relative',
                  backgroundColor: m.role === 'user' ? '#2563eb' : theme.msgAi,
                  color: m.role === 'user' ? 'white' : theme.text,
                  border: m.role === 'user' ? 'none' : `1px solid ${theme.msgAiBorder}`
                }}>
          <div className="chat-content">
            {m.role === 'ai' && i === messages.length - 1 && m.isNew ? (
              <TypewriterMarkdown 
                content={m.content} 
                onComplete={() => {
                  // This function will run when the typewriter is done
                  const updatedMessages = [...messages];
                  updatedMessages[i].isNew = false;
                  setMessages(updatedMessages);
                }}
              />
            ) : (
              /* If it's old OR already typed, just show the content instantly */
              <div dangerouslySetInnerHTML={{ __html: m.content }} />
            )}
          </div>
                  {m.role === 'ai' && (
                    <button onClick={() => handleCopy(m.content, i)} style={{ position: 'absolute', bottom: '-20px', right: '5px', background: 'none', border: 'none', cursor: 'pointer', color: theme.text, opacity: 0.5 }}>
                      {copiedIndex === i ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {isTyping && <div style={{ alignSelf: 'flex-start', padding: '10px 14px' }}>Typing...</div>}
            <div ref={scrollRef} />
          </div>

          <div style={{ padding: '12px', borderTop: `1px solid ${theme.inputBorder}` }}>
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} style={{ display: 'flex', position: 'relative' }}>
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.inputBorder}`, backgroundColor: theme.inputBg, color: theme.text }} />
              <button type="submit" style={{ position: 'absolute', right: '6px', top: '6px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', padding: '10px' }}><Send size={14} /></button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}