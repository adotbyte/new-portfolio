'use client';

import { useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';

interface CodePlaygroundProps {
  initialCode?: string;
}

export default function CodePlayground({ initialCode }: CodePlaygroundProps) {
  const [code, setCode] = useState(initialCode || 'console.log("Labas, pasauli!");');
  const [output, setOutput] = useState('');

  const runCode = () => {
    try {
      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (...args) => logs.push(args.join(' '));

      new Function(code)();

      console.log = originalLog;
      setOutput(logs.join('\n') || 'Kodas įvykdytas sėkmingai (be išvesties).');
    } catch (err: any) {
      setOutput(`Klaida: ${err.message}`);
    }
  };

  const resetCode = () => {
    setCode(initialCode || 'console.log("Labas, pasauli!");');
    setOutput('');
  };

  return (
    <div className="my-8 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-100 px-4 py-2 dark:border-gray-800 dark:bg-gray-800">
        <span className="font-mono text-xs font-medium text-gray-600 dark:text-gray-400">
          JavaScript Playground
        </span>
        <div className="flex gap-2">
          <button
            onClick={resetCode}
            className="flex items-center gap-1 rounded bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            <RotateCcw className="h-3 w-3" /> Atstatyti
          </button>
          <button
            onClick={runCode}
            className="flex items-center gap-1 rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <Play className="h-3 w-3" /> Vykdyti
          </button>
        </div>
      </div>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full resize-none bg-transparent p-4 font-mono text-sm text-gray-800 outline-none dark:text-gray-200"
        rows={6}
        spellCheck={false}
      />
      {output && (
        <div className="border-t border-gray-200 bg-white p-4 font-mono text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400">
          <div className="mb-1 text-xs font-bold text-gray-400">Rezultatas:</div>
          <pre className="whitespace-pre-wrap">{output}</pre>
        </div>
      )}
    </div>
  );
}
