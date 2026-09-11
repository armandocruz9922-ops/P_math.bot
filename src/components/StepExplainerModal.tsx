'use client';

import React from 'react';
import { EquationStep } from '@/lib/types';
import { MathRenderer } from './MathRenderer';
import { 
  Lightbulb, 
  X, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle2, 
  BookOpen,
  GraduationCap
} from 'lucide-react';

interface StepExplainerModalProps {
  step: EquationStep | null;
  onClose: () => void;
}

export const StepExplainerModal: React.FC<StepExplainerModalProps> = ({ step, onClose }) => {
  if (!step) return null;

  const exp = step.explanation || {
    whyWeDoThis: 'Esta transformación algebraica es necesaria para simplificar la expresión y aislar los términos que contienen a la incógnita.',
    intuitiveConcept: 'Imagina una balanza equilibrada: cualquier cambio en un lado debe compensarse exactamente en el otro.',
    commonMistakes: ['Cuidado con los signos negativos al multiplicar o dividir miembros.'],
    keyTakeaway: 'Mantener la igualdad balanceada en cada línea de cálculo.'
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700/80 p-6 sm:p-8 shadow-2xl shadow-emerald-500/10 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  Tutor Matemático • Paso {step.stepNumber}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {step.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formula Snippet */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center shadow-inner">
          <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">
            Fórmula en este paso:
          </span>
          <MathRenderer math={step.mathExpression} displayMode={true} />
        </div>

        {/* Explanations List */}
        <div className="space-y-4 text-xs sm:text-sm">
          {/* Why we do this */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
            <h4 className="font-bold text-emerald-300 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0" />
              ¿Por qué se realiza esta operación?
            </h4>
            <p className="text-slate-300 leading-relaxed pl-6">
              {exp.whyWeDoThis}
            </p>
          </div>

          {/* Intuitive Concept */}
          <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-800/30 space-y-1.5">
            <h4 className="font-bold text-cyan-300 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
              Intuición y Analogía Práctica
            </h4>
            <p className="text-slate-300 leading-relaxed pl-6">
              {exp.intuitiveConcept}
            </p>
          </div>

          {/* Common Mistakes */}
          {exp.commonMistakes && exp.commonMistakes.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-800/30 space-y-2">
              <h4 className="font-bold text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                Errores comunes a evitar en este paso:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
                {exp.commonMistakes.map((m, i) => (
                  <li key={i} className="leading-relaxed">
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Key Takeaway */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong className="text-emerald-300 font-bold mr-1">Regla de Oro:</strong>
              {exp.keyTakeaway}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-600/25 transition cursor-pointer"
          >
            Entendido, continuar
          </button>
        </div>
      </div>
    </div>
  );
};
