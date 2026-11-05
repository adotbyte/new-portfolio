'use client';
import { useState, useRef, useEffect } from 'react';
import {
  Send,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Download,
  Copy,
} from 'lucide-react';
import TypewriterMarkdown from './TypewriterMarkdown';
import ReactMarkdown from 'react-markdown';
import { useTranslations, useLocale } from 'next-intl';
import remarkGfm from 'remark-gfm';
import { registerRobotoFont } from './fonts/roboto';

interface ChatbotProps {
  onClose: () => void;
  nonce?: string;
}

type Message = { role: 'user' | 'ai'; content: string; isNew?: boolean };

export default function Chatbot({ onClose }: ChatbotProps) {
  const t = useTranslations('chatbot');
  const locale = useLocale();

  const DEFAULT_MESSAGE: Message = {
    role: 'ai',
    content: t('defaultMessage'),
  };

  const suggestions = [t('suggestion1'), t('suggestion2'), t('suggestion3')];

  const [messages, setMessages] = useState<Message[]>([DEFAULT_MESSAGE]);
  const [lastSaved, setLastSaved] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [input, setInput] = useState('');
  const [isDark, setIsDark] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [hints, setHints] = useState<string[]>([]);

  function handleSuggestionClick(text: string) {
    setInput(text);
    sendMessage(text); // reuse your existing send function
  }

  useEffect(() => {
    setIsMobile(window.innerWidth < 500);
    fetch('/api/chat')
      .then((r) => r.json())
      .then((data) => {
        if (data.messages?.length) {
          setMessages(data.messages);
          setLastSaved(t('restored'));
        }
      })
      .catch(() => {}); // no more .finally(setMounted)
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 500);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const checkTheme = () => setIsDark(document.documentElement.classList.contains('dark'));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isCollapsed && isOpen) {
      const chatContainer = document.getElementById('chat-messages');
      if (!chatContainer) return;

      const lastMessage = messages[messages.length - 1];

      // Nuslenkame į apačią, kai:
      // 1. Chatbotas atsidaro (isOpen pasikeičia į true)
      // 2. Įkeliamas senas pokalbis
      // 3. Vartotojas parašo žinutę
      // 4. Atsiranda nauja AI žinutė
      if (
        isOpen ||
        (messages.length > 1 &&
          (lastMessage?.role === 'user' || (lastMessage?.role === 'ai' && lastMessage.isNew)))
      ) {
        // Naudojame setTimeout, kad palauktume, kol DOM atsinaujins
        setTimeout(() => {
          chatContainer.scrollTo({
            top: chatContainer.scrollHeight,
            behavior: 'smooth',
          });
        }, 100);
      }
    }
  }, [isOpen, messages.length, isTyping, isCollapsed]);

  const theme = {
    bg: isDark ? '#1a1d20' : '#ffffff',
    text: isDark ? '#f8fafc' : '#334155',
    msgAi: isDark ? '#2d333b' : '#ffffff',
    msgAiBorder: isDark ? '#444c56' : '#e2e8f0',
    inputBg: isDark ? '#2d333b' : '#f1f5f9',
    inputBorder: isDark ? '#444c56' : '#e2e8f0',
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose(); // <-- Kviečiame onClose, o ne setIsOpen
    }, 350);
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const downloadTranscript = async () => {
    const { jsPDF } = await import('jspdf');

    try {
      const doc = new jsPDF();

      // ── 0. ŠRIFTO ĮKĖLIMAS (PRIVALOMA) ───────────────────────────────────
      // robotoFont turi būti oficialaus fontconverter sugeneruotas .js failas
      registerRobotoFont(doc);

      // ── 1. ANTRAŠTĖ SU DATA ──────────────────────────────────────────────
      const now = new Date();
      const dateStr = now.toLocaleDateString('lt-LT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      doc.setFontSize(18);
      doc.setTextColor(37, 99, 235);
      doc.text(`${t('downloadLabel')}`, 10, 20);

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Data: ${dateStr}`, 10, 27);

      doc.setDrawColor(200, 200, 200);
      doc.line(10, 32, 200, 32);

      let yPos = 40;

      // ── 2. PRANEŠIMAI ────────────────────────────────────────────────────
      messages.forEach((m) => {
        // ── TEKSTO VALYMAS IR FORMATAVIMAS ──
        let cleanContent = m.content
          // Nuvalome Markdown antraštes
          .replace(/#{1,6}\s/g, '')
          // Nuvalome nuorodas, paliekame tik tekstą
          .replace(/\[(.*?)\]\(.*?\)/g, '$1')
          // Paverčiame pabraukimus tarpais (kad nesuliptų žodžiai)
          .replace(/_/g, ' ')
          // Sąrašų brūkšnelius paverčiame gražiais taškais
          .replace(/^-\s/gm, '• ')
          // Lentelių brūkšnelius paverčiame tarpais
          .replace(/\|/g, '   ')
          // Pašaliname horizontalias linijas
          .replace(/---/g, '')
          // Pašaliname emoji ir visus "keistus" simbolius
          .replace(/[^\p{L}\p{N}\s.,!?;:()\-–—"'\/•\n]/gu, '')
          // Sutvarkome per didelius tarpus
          .replace(/ {2,}/g, ' ')
          .replace(/\n{2,}/g, '\n')
          .trim();

        const roleLabel = m.role === 'user' ? 'YOU' : 'ADOTBYTE';
        const roleColor = m.role === 'user' ? [37, 99, 235] : [16, 185, 129];

        // ── VARDAS (Spalvotas) ──
        doc.setFontSize(12); // Šiek tiek padidiname vardą
        doc.setTextColor(roleColor[0], roleColor[1], roleColor[2]);
        doc.text(`${roleLabel}:`, 10, yPos);
        yPos += 7; // Šiek tiek daugiau tarpo po vardu

        // ── TURINYS ──
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);

        // Suskaidome tekstą pagal puslapio plotį
        const splitText = doc.splitTextToSize(cleanContent, 180);

        // Puslapio lūžis (jei netelpa)
        if (yPos + splitText.length * 5 > 280) {
          doc.addPage();
          yPos = 20;
        }

        // Atspausdiname tekstą
        doc.text(splitText, 10, yPos);

        // Pridedame daugiau erdvės tarp žinučių (buvo +10, dabar +15)
        yPos += splitText.length * 5 + 15;
      });

      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.textWithLink('morkunas.info', 10, 290, { url: 'https://morkunas.info' });

      doc.save(`${t('downloadLabel')}.pdf`);
    } catch (err) {
      console.error('PDF Error:', err);
    }
  };

  const sendMessage = async (overrideInput?: string) => {
    const messageToSend = overrideInput || input;
    if (!messageToSend.trim()) return;
    setMessages((prev) => [...prev, { role: 'user', content: messageToSend }]);
    setInput('');
    setHints([]); // clear stale hints while waiting for reply
    setIsTyping(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageToSend, locale }),
      });
      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'ai', content: data.content, isNew: true }]);
      setHints(data.hints || []);
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', content: t('connectionError') }]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = async () => {
    await fetch('/api/chat', { method: 'DELETE' });
    setLastSaved('');
    setMessages([{ role: 'ai', content: t('cleared') }]);
    setHints([]);
    setShowConfirm(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        zIndex: 100000,
        bottom: isMobile ? '10px' : '30px',
        right: isMobile ? '10px' : '30px',
        maxWidth: 'calc(100vw - 40px)',
        width: isMobile ? 'calc(100% - 20px)' : '380px',
        height: isCollapsed ? '52px' : isMobile ? '75vh' : '600px',
        backgroundColor: theme.bg,
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
        overflow: 'hidden',
        border: `1px solid ${theme.inputBorder}`,
        transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxSizing: 'border-box',
        animation: isClosing
          ? 'chatClose 0.35s cubic-bezier(0.36, 0, 0.66, -0.56) forwards'
          : 'chatOpen 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transformOrigin: 'bottom right',
      }}
    >
      <style>{`
        .hide-scroll::-webkit-scrollbar { display: none; }
        @keyframes chatOpen {
          0% { opacity: 0; transform: scale(0.5) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes chatClose {
          0% { opacity: 1; transform: scale(1) translateY(0); }
          100% { opacity: 0; transform: scale(0.5) translateY(20px); }
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #4338ca 100%)',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'white',
          cursor: 'pointer',
          minHeight: '52px',
        }}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MessageCircle size={20} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{t('title')}</span>
            {lastSaved && !isCollapsed && (
              <span style={{ fontSize: '9px', opacity: 0.8 }}>{lastSaved}</span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {!isCollapsed && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadTranscript();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  opacity: 0.8,
                }}
              >
                <Download size={16} />
              </button>
              {showConfirm ? (
                <div
                  style={{
                    display: 'flex',
                    gap: '6px',
                    background: 'rgba(255,255,255,0.15)',
                    padding: '2px 6px',
                    borderRadius: '6px',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={clearChat}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#fca5a5',
                      cursor: 'pointer',
                    }}
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowConfirm(true);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    opacity: 0.7,
                  }}
                >
                  <X size={16} style={{ transform: 'rotate(45deg)' }} />
                </button>
              )}
            </>
          )}
          <button style={{ background: 'none', border: 'none', color: 'white' }}>
            {isCollapsed ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            style={{ background: 'none', border: 'none', color: 'white' }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          <div
            id="chat-messages"
            className="chat-scroll"
            style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              wordBreak: 'break-word',
              padding: '15px',
              backgroundColor: isDark ? '#0d1117' : '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  marginBottom: m.role === 'ai' ? '12px' : '0',
                }}
              >
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '14px',
                    fontSize: '14px',
                    position: 'relative',
                    backgroundColor: m.role === 'user' ? '#2563eb' : theme.msgAi,
                    color: m.role === 'user' ? 'white' : theme.text,
                    border: m.role === 'user' ? 'none' : `1px solid ${theme.msgAiBorder}`,
                    wordBreak: 'break-word',
                  }}
                >
                  {m.role === 'ai' && i === messages.length - 1 && m.isNew ? (
                    <TypewriterMarkdown
                      content={m.content}
                      onComplete={() => {
                        setMessages((prev) =>
                          prev.map((msg, idx) => (idx === i ? { ...msg, isNew: false } : msg))
                        );
                      }}
                    />
                  ) : (
                    <div className="break-words">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                    </div>
                  )}
                  {m.role === 'ai' && (
                    <button
                      onClick={() => handleCopy(m.content, i)}
                      style={{
                        position: 'absolute',
                        bottom: '-20px',
                        right: '5px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: theme.text,
                        opacity: 0.5,
                      }}
                    >
                      {copiedIndex === i ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ alignSelf: 'flex-start', padding: '10px 14px', color: theme.text }}>
                {t('typing')}
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {messages.length === 1 && hints.length === 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '0 12px 10px' }}>
              {suggestions.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSuggestionClick(q)}
                  style={{
                    fontSize: '12px',
                    padding: '6px 10px',
                    borderRadius: '999px',
                    border: `1px solid ${theme.inputBorder}`,
                    background: theme.inputBg,
                    color: theme.text,
                    cursor: 'pointer',
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {!isTyping && hints.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '0 12px 10px' }}>
              {hints.map((h) => (
                <button
                  key={h}
                  onClick={() => handleSuggestionClick(h)}
                  style={{
                    fontSize: '12px',
                    padding: '6px 10px',
                    borderRadius: '999px',
                    border: `1px solid ${theme.inputBorder}`,
                    background: theme.inputBg,
                    color: theme.text,
                    cursor: 'pointer',
                  }}
                >
                  {h}
                </button>
              ))}
            </div>
          )}

          <div style={{ padding: '12px', borderTop: `1px solid ${theme.inputBorder}` }}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              style={{ display: 'flex', position: 'relative' }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('placeholder')}
                style={{
                  width: '100%',
                  padding: '10px',
                  paddingRight: '48px',
                  borderRadius: '10px',
                  border: `1px solid ${theme.inputBorder}`,
                  backgroundColor: theme.inputBg,
                  color: theme.text,
                }}
              />
              <button
                type="submit"
                style={{
                  position: 'absolute',
                  right: '6px',
                  top: '6px',
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px',
                }}
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
