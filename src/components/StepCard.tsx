'use client';

import React from 'react';
import { EquationStep } from '@/lib/types';
import { MathRenderer } from './MathRenderer';
import { CheckCircle2, Lightbulb, BookOpen } from 'lucide-react';

interface StepCardProps {
  step: EquationStep;
  isLast?: boolean;
}

export const StepCard: React.FC<StepCardProps> = ({ step, isLast = false }) => {
  return (
    <div className="relative flex items-start gap-4 sm:gap-6 group">
      {/* Left Timeline Line & Number Badge */}
      <div className="flex flex-col items-center">
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-[1.5px] shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
          <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center font-black text-sm sm:text-base text-emerald-400">
            {step.stepNumber}
          </div>
        </div>
        {!isLast && (
          <div className="w-0.5 h-full min-h-[40px] bg-gradient-to-b from-emerald-500/40 via-slate-800 to-slate-800/40 my-2"></div>
        )}
      </div>

      {/* Main Step Content Card */}
      <div className="flex-1 pb-8">
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 p-5 sm:p-6 backdrop-blur-xl shadow-xl transition-all duration-200 group-hover:bg-slate-900">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h4 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>{step.title}</span>
            </h4>
            {step.ruleApplied && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {step.ruleApplied}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
            {step.description}
          </p>

          {/* KaTeX Equation Box */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-center shadow-inner overflow-x-auto flex justify-center items-center">
            <MathRenderer math={step.mathExpression} displayMode={true} showCopy={true} />
          </div>

          {/* Highlight note if present */}
          {step.highlightNote && (
            <div className="mt-3 p-3 rounded-xl bg-cyan-950/20 border border-cyan-800/30 text-xs text-cyan-200 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>{step.highlightNote}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
