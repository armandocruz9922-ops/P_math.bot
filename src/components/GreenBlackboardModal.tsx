'use client';

import React, { useState } from 'react';
import { MathRenderer } from './MathRenderer';
import { Copy, Check, Download, X, Code2, Sparkles } from 'lucide-react';

interface GreenBlackboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  equationLatex: string;
}

export const GreenBlackboardModal: React.FC<GreenBlackboardModalProps> = ({
  isOpen,
  onClose,
  equationLatex
}) => {
  const [copiedEq, setCopiedEq] = useState(false);
  const [copiedDoc, setCopiedDoc] = useState(false);

  if (!isOpen) return null;

  const cleanEq = equationLatex.trim() || '= L \\frac{di(t)}{dt} + R i(t) + \\frac{1}{C} \\int_{0}^{t} i(t) \\, dt';

  const fullLatexDoc = `\\documentclass{article}
\\usepackage{amsmath, amsfonts, amssymb}
\\usepackage[most]{tcolorbox}
\\usepackage{xcolor}

% Configuración del estilo Pizarrón Verde
\\definecolor{verdePizarron}{RGB}{20, 65, 40}
\\definecolor{marcoMadera}{RGB}{110, 70, 40}

\\newtcolorbox{pizarron}{
  colback=verdePizarron,
  colframe=marcoMadera,
  coltext=white,
  fontupper=\\Large,
  halign=center,
  arc=2mm,
  boxrule=3mm,
  drop shadow
}

\\begin{document}

\\begin{pizarron}
\\[
  ${cleanEq}
\\]
\\end{pizarron}

\\end{document}`;

  const handleCopyEq = () => {
    navigator.clipboard.writeText(cleanEq);
    setCopiedEq(true);
    setTimeout(() => setCopiedEq(false), 2000);
  };

  const handleCopyDoc = () => {
    navigator.clipboard.writeText(fullLatexDoc);
    setCopiedDoc(true);
    setTimeout(() => setCopiedDoc(false), 2000);
  };

  const handleDownloadTex = () => {
    const blob = new Blob([fullLatexDoc], { type: 'text/x-tex;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pizarron_verde_laplace.tex';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700/80 p-6 sm:p-8 shadow-2xl shadow-emerald-950/40 text-left my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Exportar en Formato Pizarrón Verde (tcolorbox)
            </h3>
            <p className="text-xs text-slate-400">
              Transcripción exacta en LaTeX y documento compilable con estilo pizarra y marco de madera.
            </p>
          </div>
        </div>

        {/* Visual Preview: Styled as Pizarrón Verde */}
        <div className="mb-6 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Vista Previa del Estilo Pizarrón:
          </span>
          <div 
            style={{ 
              backgroundColor: 'rgb(20, 65, 40)', 
              borderColor: 'rgb(110, 70, 40)',
              borderWidth: '5px',
              borderStyle: 'solid'
            }}
            className="rounded-2xl p-6 sm:p-8 shadow-2xl flex items-center justify-center overflow-x-auto text-white"
          >
            <MathRenderer math={cleanEq} displayMode={true} />
          </div>
        </div>

        {/* Section 1: Pure Equation Code */}
        <div className="mb-5 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200">
              1. Código de la ecuación en LaTeX (para copiar y pegar rápidamente):
            </h4>
            <button
              onClick={handleCopyEq}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition cursor-pointer"
            >
              {copiedEq ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedEq ? 'Copiado' : 'Copiar Ecuación'}</span>
            </button>
          </div>
          <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-xs overflow-x-auto selection:bg-cyan-900 selection:text-white">
            {cleanEq}
          </pre>
        </div>

        {/* Section 2: Full Compilable Document */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200">
              2. Código completo en LaTeX compilable (Pizarrón Verde):
            </h4>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadTex}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition cursor-pointer"
                title="Descargar archivo .tex"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Descargar .tex</span>
              </button>
              <button
                onClick={handleCopyDoc}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
              >
                {copiedDoc ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedDoc ? 'Documento Copiado' : 'Copiar Código Completo'}</span>
              </button>
            </div>
          </div>
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px] leading-relaxed max-h-56 overflow-y-auto overflow-x-auto selection:bg-emerald-900 selection:text-white">
            {fullLatexDoc}
          </pre>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
