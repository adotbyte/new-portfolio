'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { MessageCircle } from 'lucide-react';

const Chatbot = dynamic(() => import('./Chatbot'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 100000,
        width: '65px',
        height: '65px',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, #2563eb 0%, #4338ca 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 10px 25px rgba(147,197,253,0.5)',
      }}
    >
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
    </div>
  ),
});

export default function ChatbotWrapper() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 100000 }}>
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '65px',
            height: '65px',
            borderRadius: '20px',
            border: 'none',
            background: 'linear-gradient(135deg, #2563eb 0%, #4338ca 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 25px rgba(147,197,253,0.5)',
            cursor: 'pointer',
          }}
        >
          <MessageCircle size={30} />
        </button>
      </div>
    );
  }

  return <Chatbot onClose={() => setIsOpen(false)} />;
}
