'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 transition-colors hover:text-blue-600 dark:hover:text-blue-700"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? 'Nukopijuota!' : 'Copy'}
    </button>
  );
}
