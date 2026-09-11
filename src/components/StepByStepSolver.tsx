'use client';

import React, { useState } from 'react';
import { EquationStep, AppliedProperty, PartialFractionTerm, CalculationMode } from '@/lib/types';
import { MathRenderer } from './MathRenderer';
import { 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  Layers, 
  Copy, 
  Check, 
  Info,
  Compass,
  Zap
} from 'lucide-react';

interface StepByStepSolverProps {
  steps: EquationStep[];
  calculationMode?: CalculationMode;
  appliedProperties?: AppliedProperty[];
  partialFractions?: PartialFractionTerm[];
  onExplainStep?: (step: EquationStep) => void;
}

export const StepByStepSolver: React.FC<StepByStepSolverProps> = ({
  steps,
  calculationMode = 'transfer_function',
  appliedProperties = [],
  partialFractions = [],
  onExplainStep
}) => {
  // All steps open by default for rich readability
  const [openSteps, setOpenSteps] = useState<number[]>(steps.map((_, i) => i));
  const [copiedStepIndex, setCopiedStepIndex] = useState<number | null>(null);
  const [showPropertiesTable, setShowPropertiesTable] = useState(true);

  const toggleStep = (index: number) => {
    setOpenSteps((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const expandAll = () => setOpenSteps(steps.map((_, i) => i));
  const collapseAll = () => setOpenSteps([]);

  const copyStepLatex = (latex: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(latex);
      setCopiedStepIndex(index);
      setTimeout(() => setCopiedStepIndex(null), 1800);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Applied Properties & Laplace Tables Reference Card */}
      {appliedProperties.length > 0 && (
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  Propiedades y Teoremas de Laplace Aplicados
                </h4>
                <p className="text-xs text-slate-400">
                  Fundamentación formal del procedimiento algebraico
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowPropertiesTable(!showPropertiesTable)}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
            >
              {showPropertiesTable ? 'Ocultar' : 'Ver Propiedades'}
            </button>
          </div>

          {showPropertiesTable && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              {appliedProperties.map((prop, idx) => (
                <div 
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col justify-between space-y-2 hover:border-cyan-500/30 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      {prop.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                      Regla {idx + 1}
                    </span>
                  </div>

                  <div className="py-1 px-2 rounded-lg bg-slate-900/60 flex items-center justify-center overflow-x-auto text-xs">
                    <MathRenderer math={prop.formula} displayMode={false} />
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {prop.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. Partial Fraction Expansion Breakdown (if applicable) */}
      {partialFractions.length > 0 && (
        <div className="rounded-2xl bg-gradient-to-r from-cyan-950/20 via-slate-900 to-blue-950/20 border border-cyan-500/30 p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <h4 className="text-sm font-bold text-white">
              Expansión en Fracciones Parciales (Método de Heaviside)
            </h4>
          </div>
          <p className="text-xs text-slate-300">
            Descomposición de la función en frecuencia compleja en suma de términos elementales simples:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {partialFractions.map((frac, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-400">Término {idx + 1}:</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    Residuo = {frac.residue}
                  </span>
                </div>
                <div className="text-center py-1">
                  <MathRenderer math={frac.termLatex} displayMode={true} />
                </div>
                <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Antitransformada:</span>
                  <span className="text-cyan-300 font-mono font-semibold">
                    <MathRenderer math={frac.inverseLatex} displayMode={false} />
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 italic mt-1">{frac.method}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Step-by-Step Accordion Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-white tracking-tight">
            Desglose Matemático Paso a Paso
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition cursor-pointer"
          >
            Desplegar Todos
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition cursor-pointer"
          >
            Plegar Todos
          </button>
        </div>
      </div>

      {/* 4. Sequential Step Cards */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isOpen = openSteps.includes(index);
          const isCopied = copiedStepIndex === index;

          return (
            <div
              key={index}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden shadow-lg ${
                isOpen
                  ? 'bg-slate-900/90 border-slate-700/80'
                  : 'bg-slate-900/50 border-slate-800/70 hover:border-slate-700'
              }`}
            >
              {/* Accordion Header */}
              <div
                onClick={() => toggleStep(index)}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Step Number Circle */}
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold text-sm shrink-0 shadow-inner">
                    {step.stepNumber || index + 1}
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-sm sm:text-base font-bold text-white truncate">
                      {step.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {step.ruleApplied || step.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {step.ruleApplied && (
                    <span className="hidden md:inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-950 border border-slate-800 text-cyan-400">
                      {step.ruleApplied}
                    </span>
                  )}

                  <div className="p-1.5 rounded-lg text-slate-400 hover:text-white transition">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Accordion Body */}
              {isOpen && (
                <div className="px-5 pb-5 pt-1 space-y-4 border-t border-slate-800/80 bg-slate-950/40">
                  {/* Description text */}
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Math Expression with KaTeX */}
                  <div className="relative group p-5 rounded-xl bg-slate-950 border border-slate-800 shadow-inner flex flex-col items-center justify-center overflow-x-auto">
                    <div className="w-full flex justify-center py-2">
                      <MathRenderer math={step.mathExpression} displayMode={true} />
                    </div>

                    {/* Copy LaTeX button on top right of box */}
                    <button
                      type="button"
                      onClick={(e) => copyStepLatex(step.mathExpression, index, e)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white cursor-pointer"
                      title="Copiar LaTeX de este paso"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Highlight note or key insight */}
                  {step.highlightNote && (
                    <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono">
                      <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{step.highlightNote}</span>
                    </div>
                  )}

                  {/* Pedagogical Tutor Button */}
                  {step.explanation && (
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => onExplainStep?.(step)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 text-xs font-semibold transition cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                        <span>¿Por qué se hace este paso? (Tutor IA)</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
