'use client';

import React from 'react';
import { EquationVerification } from '@/lib/types';
import { MathRenderer } from './MathRenderer';
import { ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';

interface VerificationCardProps {
  verification: EquationVerification;
}

export const VerificationCard: React.FC<VerificationCardProps> = ({ verification }) => {
  return (
    <div className="rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-emerald-500/30 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-emerald-950/20">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Demostración y Comprobación Formal
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                100% Verificado
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Sustitución rigurosa de los valores calculados en la ecuación original manuscrita
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 font-semibold px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40">
          <CheckCircle2 className="w-4 h-4" />
          <span>LHS = RHS</span>
        </div>
      </div>

      {/* Verification Steps List */}
      <div className="space-y-4 mb-6">
        {verification.steps.map((vStep, index) => (
          <div
            key={index}
            className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-emerald-500/30 transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                {vStep.title}
              </h5>
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono">
                Identidad Confirmada
              </span>
            </div>

            <p className="text-xs text-slate-400">
              {vStep.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">
                  1. Sustitución en Miembro Izquierdo (LHS)
                </span>
                <MathRenderer math={vStep.substitutionMath} displayMode={false} />
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-emerald-900/40 text-center">
                <span className="text-[10px] uppercase font-mono text-emerald-400 block mb-1">
                  2. Evaluación Algebraica
                </span>
                <MathRenderer math={vStep.evaluationMath} displayMode={false} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Formal Conclusion Banner */}
      <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
        <div className="text-xs text-emerald-200 leading-relaxed">
          <strong className="text-emerald-300 font-bold block">Conclusión Demostrada:</strong>
          {verification.conclusion}
        </div>
      </div>
    </div>
  );
};
