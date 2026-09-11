'use client';

import React, { useState, useMemo, useRef } from 'react';
import { MathRenderer } from './MathRenderer';
import katex from 'katex';
import { Edit3, Check, RefreshCw, AlertCircle, Sparkles, Copy, Undo2 } from 'lucide-react';

interface LatexEditorProps {
  initialLatex: string;
  onApply: (newLatex: string) => void;
  onCancel?: () => void;
  isRecalculating?: boolean;
}

const QUICK_MATH_BUTTONS = [
  { label: 'x²', insert: 'x^2' },
  { label: '√x', insert: '\\sqrt{x}' },
  { label: 'a/b', insert: '\\frac{a}{b}' },
  { label: '±', insert: '\\pm ' },
  { label: 'Δ', insert: '\\Delta ' },
  { label: '·', insert: '\\cdot ' },
  { label: '≠', insert: '\\neq ' },
  { label: '≤', insert: '\\le ' },
  { label: '≥', insert: '\\ge ' },
  { label: '{ }', insert: '\\begin{cases}  \\end{cases}' }
];

export const LatexEditor: React.FC<LatexEditorProps> = ({
  initialLatex,
  onApply,
  onCancel,
  isRecalculating = false
}) => {
  const [latexInput, setLatexInput] = useState(initialLatex);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Validate LaTeX syntax in real time
  const syntaxStatus = useMemo(() => {
    if (!latexInput.trim()) {
      return { valid: false, message: 'La fórmula no puede estar vacía' };
    }
    try {
      katex.renderToString(latexInput, { throwOnError: true });
      return { valid: true, message: 'Sintaxis LaTeX válida' };
    } catch (e: unknown) {
      const err = e instanceof Error ? e.message : 'Error de sintaxis LaTeX';
      return { valid: false, message: err };
    }
  }, [latexInput]);

  const insertSymbol = (textToInsert: string) => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const current = latexInput;

    const updated = current.substring(0, start) + textToInsert + current.substring(end);
    setLatexInput(updated);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 50);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!syntaxStatus.valid) return;
    onApply(latexInput.trim());
  };

  return (
    <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <Edit3 className="w-4 h-4 text-emerald-400" />
          <span>Editor y Verificador de LaTeX</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono">
          {syntaxStatus.valid ? (
            <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <Check className="w-3 h-3" /> Sintaxis Correcta
            </span>
          ) : (
            <span className="flex items-center gap-1 text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              <AlertCircle className="w-3 h-3" /> Error Sintáctico
            </span>
          )}
        </div>
      </div>

      {/* Quick Insert Keypad */}
      <div className="flex flex-wrap items-center gap-1.5 pb-1 border-b border-slate-800/80">
        <span className="text-[10px] uppercase font-bold text-slate-500 mr-1">Insertar:</span>
        {QUICK_MATH_BUTTONS.map((btn, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => insertSymbol(btn.insert)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 border border-slate-800 text-xs font-mono font-medium transition cursor-pointer"
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div>
        <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
          Código LaTeX de la Ecuación:
        </label>
        <textarea
          ref={textareaRef}
          rows={2}
          value={latexInput}
          onChange={(e) => setLatexInput(e.target.value)}
          placeholder="Escribe la fórmula en LaTeX, ej: 2x^2 + 5x - 3 = 0"
          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-emerald-300 font-mono text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
        />
      </div>

      {/* Live KaTeX Preview Box */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/90 text-center">
        <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
          Vista Previa en Vivo (KaTeX)
        </span>
        <div className="min-h-[38px] flex items-center justify-center">
          {syntaxStatus.valid ? (
            <MathRenderer math={latexInput} displayMode={true} />
          ) : (
            <p className="text-xs text-rose-400 font-mono">{syntaxStatus.message}</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => setLatexInput(initialLatex)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-400 hover:text-slate-200 text-xs hover:bg-slate-900 transition cursor-pointer"
        >
          <Undo2 className="w-3.5 h-3.5" />
          <span>Restablecer</span>
        </button>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3.5 py-1.5 rounded-xl text-slate-400 hover:text-white text-xs hover:bg-slate-800 transition cursor-pointer"
            >
              Cancelar
            </button>
          )}

          <button
            type="button"
            onClick={handleFormSubmit}
            disabled={!syntaxStatus.valid || isRecalculating}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-600/25 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
            <span>Recalcular Solución y Gráfica</span>
          </button>
        </div>
      </div>
    </div>
  );
};
