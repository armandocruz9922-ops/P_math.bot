'use client';

import React, { useState, useMemo, useRef } from 'react';
import { MathRenderer } from './MathRenderer';
import katex from 'katex';
import { Edit3, Check, RefreshCw, AlertCircle, Sparkles, Copy, Undo2, ShieldAlert } from 'lucide-react';
import { validateLaplaceDomain } from '@/lib/laplace-solver';
import { DomainValidationResult } from '@/lib/types';

interface LatexEditorProps {
  initialLatex: string;
  onApply: (newLatex: string) => void;
  onCancel?: () => void;
  isRecalculating?: boolean;
}

const LAPLACE_QUICK_BUTTONS = [
  { label: 'ℒ{·}', insert: '\\mathcal{L}\\{  \\}' },
  { label: 'ℒ⁻¹{·}', insert: '\\mathcal{L}^{-1}\\{  \\}' },
  { label: 'G(s)', insert: 'G(s) = \\frac{  }{  }' },
  { label: 'F(s)', insert: 'F(s) = ' },
  { label: 's²', insert: 's^2' },
  { label: 'a/b', insert: '\\frac{a}{b}' },
  { label: 'e⁻ᵃᵗ', insert: 'e^{-at}' },
  { label: 'sen(ωt)', insert: '\\sin(\\omega t)' },
  { label: 'cos(ωt)', insert: '\\cos(\\omega t)' },
  { label: 'u(t)', insert: 'u(t)' },
  { label: "y''", insert: "\\frac{d^2y}{dt^2}" },
  { label: "y'", insert: "\\frac{dy}{dt}" },
  { label: 'ωₙ', insert: '\\omega_n' },
  { label: 'ζ', insert: '\\zeta' },
  { label: '±', insert: '\\pm ' }
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

  // Check domain compliance (Laplace & Control only)
  const domainStatus = useMemo((): DomainValidationResult => {
    if (!syntaxStatus.valid) return { isValid: true, detectedDomain: 'invalid', message: '' };
    return validateLaplaceDomain(latexInput);
  }, [latexInput, syntaxStatus]);

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
      const cursorOffset = textToInsert.includes('{  }') ? textToInsert.indexOf('{  }') + 2 : textToInsert.length;
      el.setSelectionRange(start + cursorOffset, start + cursorOffset);
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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <Edit3 className="w-4 h-4 text-cyan-400" />
          <span>Editor de Fórmulas de Laplace y Control</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono">
          {syntaxStatus.valid ? (
            <span className="flex items-center gap-1 text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
              <Check className="w-3 h-3" /> KaTeX Válido
            </span>
          ) : (
            <span className="flex items-center gap-1 text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
              <AlertCircle className="w-3 h-3" /> Error Sintáctico
            </span>
          )}
        </div>
      </div>

      {/* Domain restriction warning if applicable */}
      {!domainStatus.isValid && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Aviso de Dominio: </span>
            <span>{domainStatus.message}</span>
            {domainStatus.suggestedCorrection && (
              <button
                type="button"
                onClick={() => setLatexInput(domainStatus.suggestedCorrection!)}
                className="ml-2 underline font-semibold text-cyan-300 hover:text-cyan-200 cursor-pointer"
              >
                Usar sugerencia: {domainStatus.suggestedCorrection}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quick Insert Keypad for Laplace & Control */}
      <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-800/80">
        <span className="text-[10px] uppercase font-bold text-slate-500 mr-1">Símbolos Laplace:</span>
        {LAPLACE_QUICK_BUTTONS.map((btn, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => insertSymbol(btn.insert)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 text-xs font-mono font-medium transition cursor-pointer"
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div>
        <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
          Código LaTeX de la Ecuación (Dominio Laplace / Control):
        </label>
        <textarea
          ref={textareaRef}
          rows={2}
          value={latexInput}
          onChange={(e) => setLatexInput(e.target.value)}
          placeholder="Ej: G(s) = \frac{25}{s^2 + 4s + 25}  o  \mathcal{L}\{4e^{-2t}\sin(3t)\}"
          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-cyan-300 font-mono text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
        />
      </div>

      {/* Live KaTeX Preview Box */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/90 text-center">
        <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
          Vista Previa Tipográfica en Vivo (KaTeX)
        </span>
        <div className="min-h-[38px] flex items-center justify-center overflow-x-auto py-1">
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
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
            <span>Recalcular Polos, Respuesta y Estabilidad</span>
          </button>
        </div>
      </div>
    </div>
  );
};
