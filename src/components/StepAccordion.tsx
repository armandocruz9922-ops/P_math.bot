'use client';

import React, { useState } from 'react';
import { EquationStep } from '@/lib/types';
import { MathRenderer } from './MathRenderer';
import { 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Lightbulb, 
  ChevronsUpDown,
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface StepAccordionProps {
  steps: EquationStep[];
  onExplainStep: (step: EquationStep) => void;
}

export const StepAccordion: React.FC<StepAccordionProps> = ({ steps, onExplainStep }) => {
  // Array of open step indices (by default all open for immediate reading, or user can collapse)
  const [openSteps, setOpenSteps] = useState<number[]>(steps.map((s) => s.stepNumber));

  const toggleStep = (stepNumber: number) => {
    setOpenSteps((prev) =>
      prev.includes(stepNumber) ? prev.filter((n) => n !== stepNumber) : [...prev, stepNumber]
    );
  };

  const expandAll = () => {
    setOpenSteps(steps.map((s) => s.stepNumber));
  };

  const collapseAll = () => {
    setOpenSteps([]);
  };

  return (
    <div className="space-y-4">
      {/* Global Accordion Controls */}
      <div className="flex items-center justify-between pb-2">
        <span className="text-xs text-slate-400 font-medium">
          Haz clic en cualquier paso para desplegar u ocultar su desarrollo
        </span>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={expandAll}
            className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition cursor-pointer"
          >
            Expandir todos
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition cursor-pointer"
          >
            Colapsar todos
          </button>
        </div>
      </div>

      {/* Accordion Cards */}
      <div className="space-y-3">
        {steps.map((step) => {
          const isOpen = openSteps.includes(step.stepNumber);

          return (
            <div
              key={step.stepNumber}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'bg-slate-900/90 border-slate-700/80 shadow-xl'
                  : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-900/70 hover:border-slate-700'
              }`}
            >
              {/* Accordion Header */}
              <div
                onClick={() => toggleStep(step.stepNumber)}
                className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1">
                  {/* Number Badge */}
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-[1.5px] shrink-0">
                    <div className="w-full h-full rounded-xl bg-slate-950 flex items-center justify-center font-black text-sm sm:text-base text-emerald-400">
                      {step.stepNumber}
                    </div>
                  </div>

                  {/* Title and Rule */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                        {step.title}
                      </h4>
                      {step.ruleApplied && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {step.ruleApplied}
                        </span>
                      )}
                    </div>
                    {!isOpen && (
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Chevron & Action */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="p-1 rounded-lg text-slate-400 hover:text-white">
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Accordion Content */}
              {isOpen && (
                <div className="px-4 sm:px-6 pb-5 pt-1 border-t border-slate-800/80 space-y-4 animate-fade-in">
                  {/* Description text */}
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-2">
                    {step.description}
                  </p>

                  {/* KaTeX Math Box */}
                  <div className="p-4 sm:p-5 rounded-xl bg-slate-950/90 border border-slate-800 text-center shadow-inner overflow-x-auto flex justify-center items-center">
                    <MathRenderer math={step.mathExpression} displayMode={true} showCopy={true} />
                  </div>

                  {/* Highlight note if present */}
                  {step.highlightNote && (
                    <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-800/30 text-xs text-cyan-200 flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{step.highlightNote}</span>
                    </div>
                  )}

                  {/* Explainer Button */}
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onExplainStep(step);
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-cyan-500/15 hover:from-emerald-500/25 hover:to-cyan-500/25 border border-emerald-500/30 text-emerald-300 font-semibold text-xs shadow-md transition cursor-pointer"
                    >
                      <Lightbulb className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <span>💡 Explicar este paso</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
