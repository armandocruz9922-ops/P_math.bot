'use client';

import React, { useMemo, useState } from 'react';
import katex from 'katex';
import { Copy, Check } from 'lucide-react';

interface MathRendererProps {
  math: string;
  displayMode?: boolean;
  className?: string;
  showCopy?: boolean;
}

export const MathRenderer: React.FC<MathRendererProps> = ({
  math,
  displayMode = true,
  className = '',
  showCopy = false
}) => {
  const [copied, setCopied] = useState(false);

  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode,
        throwOnError: false,
        strict: false
      });
    } catch (error) {
      console.warn('Error al renderizar fórmula KaTeX:', error);
      return `<span class="text-rose-400 font-mono text-sm">${math}</span>`;
    }
  }, [math, displayMode]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(math);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`relative group inline-block max-w-full ${className}`}>
      <div
        className="overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-emerald-500/20"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {showCopy && (
        <button
          onClick={handleCopy}
          title="Copiar código LaTeX"
          className="absolute -top-2 -right-2 p-1.5 rounded-lg bg-slate-800/90 text-slate-300 hover:text-emerald-300 border border-slate-700/60 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      )}
    </div>
  );
};
