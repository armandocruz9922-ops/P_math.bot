'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEquation } from '@/context/EquationContext';
import { MathRenderer } from '@/components/MathRenderer';
import { StepAccordion } from '@/components/StepAccordion';
import { StepExplainerModal } from '@/components/StepExplainerModal';
import { GraphViewer } from '@/components/GraphViewer';
import { LatexEditor } from '@/components/LatexEditor';
import { VerificationCard } from '@/components/VerificationCard';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  Sparkles, 
  RotateCcw, 
  Maximize2, 
  X, 
  CheckCircle2, 
  Edit3, 
  Check, 
  Award,
  Layers,
  HelpCircle,
  Share2,
  Printer,
  Copy,
  Download,
  FileText
} from 'lucide-react';
import { EquationStep } from '@/lib/types';

export default function ResultPage() {
  const { 
    currentImage, 
    croppedImage,
    currentSolution, 
    resetState, 
    solveEquation, 
    isProcessing,
    explainingStep,
    setExplainingStep
  } = useEquation();

  const router = useRouter();

  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isEditingLatex, setIsEditingLatex] = useState(false);
  const [copiedLatex, setCopiedLatex] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Trigger confetti celebration on mount
  useEffect(() => {
    if (currentSolution) {
      try {
        confetti({
          particleCount: 70,
          spread: 75,
          origin: { y: 0.25 },
          colors: ['#34d399', '#38bdf8', '#fbbf24', '#a78bfa']
        });
      } catch (e) {
        // Confetti not critical
      }
    }
  }, [currentSolution]);

  // If no solution is present in state or session
  if (!currentSolution) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-4">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No hay ninguna ecuación resuelta</h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-sm mb-6">
          Para ver el desglose paso a paso, la gráfica 2D y la demostración formal, primero sube o captura una foto del pizarrón.
        </p>
        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-600/30 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ir a Capturar Ecuación</span>
        </Link>
      </div>
    );
  }

  const handleApplyLatexEdit = async (newLatex: string) => {
    setIsEditingLatex(false);
    await solveEquation(
      currentImage || undefined,
      undefined,
      newLatex,
      croppedImage || undefined
    );
  };

  const handleCopyLatexOnly = () => {
    if (typeof window !== 'undefined' && currentSolution) {
      navigator.clipboard.writeText(currentSolution.detectedLatex);
      setCopiedLatex(true);
      setTimeout(() => setCopiedLatex(false), 2000);
    }
  };

  const handlePrintPdf = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 print:p-0 print:m-0 print:max-w-full">
      {/* Top Action Bar (Hidden on Print) */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80 print:hidden">
        <button
          onClick={() => {
            resetState();
            router.push('/');
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-emerald-400" />
          <span>Resolver Otra Ecuación</span>
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Copy LaTeX Button */}
          <button
            onClick={handleCopyLatexOnly}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 border border-slate-800 text-xs font-medium transition cursor-pointer"
            title="Copiar fórmula en código LaTeX"
          >
            {copiedLatex ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLatex ? 'LaTeX Copiado' : 'Copiar LaTeX'}</span>
          </button>

          {/* Export to PDF / Print Button */}
          <button
            onClick={handlePrintPdf}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold shadow-sm transition cursor-pointer"
            title="Exportar reporte a PDF o Imprimir"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar a PDF</span>
          </button>

          {/* Share Link */}
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs transition cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copiado' : 'Compartir'}</span>
          </button>
        </div>
      </div>

      {/* Screen 2 Header Card: Original Blackboard & Detected Equation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Thumbnail of Blackboard Photo (4 cols) */}
        <div className="lg:col-span-4 rounded-3xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-xl p-5 shadow-xl flex flex-col justify-between print:border-gray-300">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Pizarrón {croppedImage ? 'Recortado' : 'Original'}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Tiza Manuscrita
              </span>
            </div>

            <div 
              onClick={() => setIsZoomOpen(true)}
              className="relative aspect-video sm:aspect-[4/3] rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 cursor-pointer group shadow-inner"
            >
              <img
                src={croppedImage || currentImage || currentSolution.originalImage}
                alt="Foto del pizarrón"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] print:hidden">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs font-semibold shadow-lg">
                  <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ampliar Foto</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 text-center mt-3 print:hidden">
            Haz clic en la imagen para ver el trazo original completo
          </p>
        </div>

        {/* Detected Equation Card with LatexEditor (8 cols) */}
        <div className="lg:col-span-8 rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900 to-slate-950 border border-slate-800/90 p-6 sm:p-8 backdrop-blur-xl shadow-xl flex flex-col justify-between relative overflow-hidden print:border-gray-300">
          <div className="absolute -top-16 -right-16 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                  Ecuación Extraída por OCR
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {currentSolution.equationType}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {Math.round(currentSolution.confidenceScore * 100)}% Confianza
                </span>
              </div>
            </div>

            {/* LaTeX Display or Active Editor */}
            {!isEditingLatex ? (
              <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-inner flex flex-col items-center justify-center my-4 group relative">
                <MathRenderer math={currentSolution.detectedLatex} displayMode={true} showCopy={true} />
                <span className="text-[10px] font-mono text-slate-500 mt-2">
                  LaTeX: {currentSolution.detectedLatex}
                </span>
              </div>
            ) : (
              <div className="my-2">
                <LatexEditor
                  initialLatex={currentSolution.detectedLatex}
                  onApply={handleApplyLatexEdit}
                  onCancel={() => setIsEditingLatex(false)}
                  isRecalculating={isProcessing}
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 text-xs border-t border-slate-800/80">
            <div className="text-slate-400 flex items-center gap-1.5">
              <span className="font-semibold text-slate-300">Método aplicado:</span>
              <span>{currentSolution.methodUsed}</span>
            </div>

            {!isEditingLatex && (
              <button
                onClick={() => setIsEditingLatex(true)}
                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold hover:underline cursor-pointer print:hidden"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Corregir / Editar LaTeX</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Interactive 2D Graph Section (GraphViewer) */}
      {currentSolution.graphConfig && (
        <section className="space-y-4">
          <GraphViewer config={currentSolution.graphConfig} />
        </section>
      )}

      {/* Step-by-Step Accordion Section */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Layers className="w-6 h-6 text-emerald-400" />
              <span>Solución Paso a Paso</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Desglose detallado interactivo con regla algebraica y tutor pedagógico flotante
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300">
            {currentSolution.steps.length} Pasos Realizados
          </span>
        </div>

        {/* Accordion Component */}
        <StepAccordion
          steps={currentSolution.steps}
          onExplainStep={(step) => setExplainingStep(step)}
        />
      </section>

      {/* Highlighted Final Result Card */}
      <section className="rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border-2 border-emerald-500/40 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl shadow-emerald-500/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/30 shrink-0">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Resultado Final
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  Solución Hallada
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Valores de la incógnita que satisfacen la igualdad
              </p>
            </div>
          </div>

          {/* Solutions Badges in KaTeX */}
          <div className="flex flex-wrap items-center gap-3">
            {currentSolution.finalSolutions.map((sol, index) => (
              <div
                key={index}
                className="px-6 py-3.5 rounded-2xl bg-slate-950/90 border border-emerald-500/50 shadow-lg text-emerald-300 text-lg sm:text-xl font-bold font-mono flex items-center justify-center"
              >
                <MathRenderer math={sol} displayMode={false} showCopy={true} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demonstration / Formal Verification Section */}
      <section>
        <VerificationCard verification={currentSolution.verification} />
      </section>

      {/* Bottom Floating Navigation Action (Hidden on Print) */}
      <div className="flex justify-center pt-6 pb-12 print:hidden">
        <button
          onClick={() => {
            resetState();
            router.push('/');
          }}
          className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <RotateCcw className="w-5 h-5 text-slate-950" />
          <span>RESOLVER OTRA ECUACIÓN</span>
        </button>
      </div>

      {/* Step Explainer Tutor Modal */}
      <StepExplainerModal
        step={explainingStep}
        onClose={() => setExplainingStep(null)}
      />

      {/* Zoom Modal for Blackboard Photo */}
      {isZoomOpen && (
        <div
          onClick={() => setIsZoomOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md cursor-zoom-out print:hidden"
        >
          <div className="relative max-w-4xl max-h-[85vh] w-full rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-2xl p-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsZoomOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-slate-900/80 text-white hover:bg-slate-800 border border-slate-700 cursor-pointer shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={croppedImage || currentImage || currentSolution.originalImage}
              alt="Pizarra ampliada"
              className="w-full h-full max-h-[80vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
