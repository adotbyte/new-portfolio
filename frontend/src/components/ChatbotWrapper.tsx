'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

// Dinaminis importas be SSR (nes Chatbot naudoja window)
const Chatbot = dynamic(() => import('./Chatbot'), { ssr: false });

export default function ChatbotWrapper() {
  const [isOpen, setIsOpen] = useState(false);

  // Jei neatsidaręs, rodome tik mygtuką
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg transition-transform hover:scale-110"
        aria-label="Open chat"
      >
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </button>
    );
  }

  // Jei atidarytas, įkeliame pilną Chatbot komponentą
  return <Chatbot />;
}
