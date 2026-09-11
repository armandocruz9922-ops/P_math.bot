'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEquation } from '@/context/EquationContext';
import { MathRenderer } from '@/components/MathRenderer';
import { StepByStepSolver } from '@/components/StepByStepSolver';
import { StabilityGraph } from '@/components/StabilityGraph';
import { LatexEditor } from '@/components/LatexEditor';
import { VerificationCard } from '@/components/VerificationCard';
import { StepExplainerModal } from '@/components/StepExplainerModal';
import { GreenBlackboardModal } from '@/components/GreenBlackboardModal';
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
  Activity,
  Compass,
  Clock,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  FileText,
  Code2
} from 'lucide-react';
import { EquationStep } from '@/lib/types';

export default function ResultPage() {
  const { 
    currentImage, 
    croppedImage,
    currentSolution, 
    calculationMode,
    resetState, 
    solveEquation, 
    isProcessing,
    explainingStep,
    setExplainingStep
  } = useEquation();

  const router = useRouter();

  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isEditingLatex, setIsEditingLatex] = useState(false);
  const [isGreenBoardOpen, setIsGreenBoardOpen] = useState(false);
  const [copiedLatex, setCopiedLatex] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Trigger celebration on mount if stable
  useEffect(() => {
    if (currentSolution && currentSolution.stabilityAnalysis?.status === 'stable') {
      try {
        confetti({
          particleCount: 75,
          spread: 80,
          origin: { y: 0.25 },
          colors: ['#22d3ee', '#38bdf8', '#34d399', '#818cf8']
        });
      } catch (e) {
        // Confetti non-critical
      }
    }
  }, [currentSolution]);

  // Fallback if no solution is present in state
  if (!currentSolution) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-4 shadow-xl">
          <Activity className="w-8 h-8 text-cyan-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No hay ningún cálculo de Laplace cargado</h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-sm mb-6">
          Para ver el desglose paso a paso, los polos en el plano s y la gráfica del tiempo de asentamiento, primero sube o selecciona una ecuación.
        </p>
        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/25 transition"
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
      croppedImage || undefined,
      calculationMode
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

  const stability = currentSolution.stabilityAnalysis;

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
          <RotateCcw className="w-4 h-4 text-cyan-400" />
          <span>Analizar Otra Ecuación de Laplace</span>
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Green Blackboard tcolorbox Export Button */}
          <button
            onClick={() => setIsGreenBoardOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 text-xs font-semibold shadow-sm transition cursor-pointer"
            title="Ver y exportar código LaTeX con estilo Pizarrón Verde (tcolorbox)"
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>LaTeX Pizarrón Verde</span>
          </button>

          {/* Copy LaTeX Button */}
          <button
            onClick={handleCopyLatexOnly}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 text-xs font-medium transition cursor-pointer"
            title="Copiar fórmula en código LaTeX"
          >
            {copiedLatex ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLatex ? 'LaTeX Copiado' : 'Copiar LaTeX'}</span>
          </button>

          {/* Export to PDF / Print Button */}
          <button
            onClick={handlePrintPdf}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 text-xs font-semibold shadow-sm transition cursor-pointer"
            title="Exportar reporte de estabilidad a PDF o Imprimir"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span>Exportar Reporte a PDF</span>
          </button>

          {/* Share Link */}
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs transition cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copiado' : 'Compartir'}</span>
          </button>
        </div>
      </div>

      {/* Screen 2 Header Card: Pizarrón y Ecuación en LaTeX */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Thumbnail of Blackboard Photo (4 cols) */}
        <div className="lg:col-span-4 rounded-3xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-xl p-5 shadow-xl flex flex-col justify-between print:border-gray-300">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Pizarrón {croppedImage ? 'Recortado' : 'Original'}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Dominio Laplace
              </span>
            </div>

            <div 
              onClick={() => setIsZoomOpen(true)}
              className="relative aspect-video sm:aspect-[4/3] rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 cursor-pointer group shadow-inner"
            >
              <img
                src={croppedImage || currentImage || currentSolution.originalImage}
                alt="Foto del pizarrón de Laplace"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] print:hidden">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs font-semibold shadow-lg">
                  <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Ampliar Foto</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 text-center mt-3 print:hidden">
            Haz clic en la imagen para ver el trazo original completo
          </p>
        </div>

        {/* Detected Equation Card with 3 Sections (8 cols) */}
        <div className="lg:col-span-8 rounded-3xl bg-gradient-to-br from-slate-900/95 via-slate-900 to-slate-950 border border-slate-800/90 p-6 sm:p-8 backdrop-blur-xl shadow-xl flex flex-col justify-between relative overflow-hidden space-y-5 print:border-gray-300">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

          {/* 1. SECCIÓN SUPERIOR: Fórmula Detectada en la Imagen (Dominio del Tiempo f(t)) */}
          <div className="rounded-2xl bg-slate-950/70 border border-amber-500/30 p-4 sm:p-5 shadow-inner space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300">
                  Fórmula Detectada en la Imagen (Dominio del Tiempo f(t))
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsGreenBoardOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition cursor-pointer"
                  title="Ver código LaTeX para Pizarrón Verde compilable con tcolorbox"
                >
                  <Code2 className="w-3 h-3 text-emerald-400" />
                  <span>Ver código tcolorbox</span>
                </button>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono">
                  Dominio Temporal (t) | Texto Literal OCR
                </span>
              </div>
            </div>

            {/* Pizarrón Verde preview container */}
            <div 
              style={{
                backgroundColor: 'rgb(20, 65, 40)',
                borderColor: 'rgb(110, 70, 40)',
                borderWidth: '4px',
                borderStyle: 'solid'
              }}
              className="py-3 px-4 rounded-xl flex items-center justify-center overflow-x-auto my-1 shadow-lg text-white"
            >
              <MathRenderer 
                math={currentSolution.timeDomainLatex || currentSolution.detectedLatex} 
                displayMode={true} 
                showCopy={true} 
              />
            </div>
            <p className="text-[10px] text-slate-400">
              Transcripción literal exacta leída de la imagen recortada del pizarrón o cuaderno.
            </p>
          </div>

          {/* 2. SECCIÓN INTERMEDIA: Fórmula Reconocida en Frecuencia Compleja (F(s) / G(s)) */}
          <div className="rounded-2xl bg-slate-950/90 border border-cyan-500/40 p-4 sm:p-5 shadow-lg space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-cyan-300">
                  Fórmula Reconocida en Frecuencia Compleja (F(s) / G(s))
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-mono">
                  Frecuencia Compleja (s) | Transformada Calculada
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {Math.round(currentSolution.confidenceScore * 100)}% Certeza
                </span>
              </div>
            </div>

            {/* LaTeX Display or Active Editor */}
            {!isEditingLatex ? (
              <div className="p-4 sm:p-5 rounded-xl bg-slate-900 border border-cyan-500/20 shadow-inner flex flex-col items-center justify-center my-2 group relative overflow-x-auto">
                <MathRenderer 
                  math={currentSolution.frequencyDomainLatex || currentSolution.detectedLatex} 
                  displayMode={true} 
                  showCopy={true} 
                />
                <span className="text-[10px] font-mono text-slate-500 mt-2">
                  LaTeX: {currentSolution.frequencyDomainLatex || currentSolution.detectedLatex}
                </span>
              </div>
            ) : (
              <div className="my-2">
                <LatexEditor
                  initialLatex={currentSolution.frequencyDomainLatex || currentSolution.detectedLatex}
                  onApply={handleApplyLatexEdit}
                  onCancel={() => setIsEditingLatex(false)}
                  isRecalculating={isProcessing}
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-1 text-xs">
              <div className="text-slate-400 flex items-center gap-1.5">
                <span className="font-semibold text-slate-300">Método:</span>
                <span>{currentSolution.methodUsed}</span>
              </div>

              {!isEditingLatex && (
                <button
                  onClick={() => setIsEditingLatex(true)}
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold hover:underline cursor-pointer print:hidden"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Corregir / Editar LaTeX</span>
                </button>
              )}
            </div>
          </div>

          {/* 3. SECCIÓN INFERIOR (NUEVA): Nota Explicativa / "¿Por qué cambia al Dominio s?" */}
          <div className="rounded-2xl bg-gradient-to-r from-blue-950/30 via-slate-950 to-cyan-950/30 border border-blue-500/30 p-4 sm:p-5 shadow-md space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
              <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>¿Por qué la fórmula cambia del dominio t al dominio s?</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              La Transformada de Laplace $\mathcal&#123;L&#125;&#123;f(t)&#125;$ convierte ecuaciones del dominio del tiempo ($t$) al dominio de la frecuencia compleja ($s = \sigma + j\omega$). Este cambio convierte ecuaciones diferenciales complejas en multiplicaciones algebraicas sencillas, lo que permite analizar la estabilidad del sistema, sus polos, ceros y el tiempo de asentamiento ($t_s$).
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Stability Graph & Time Response (Screen 2: Requisito 4) */}
      {stability && (
        <section className="space-y-4">
          <StabilityGraph stabilityAnalysis={stability} />
        </section>
      )}

      {/* Step-by-Step Solver Section with KaTeX & Accordions (Screen 2: Requisito 3) */}
      <section className="space-y-6">
        <StepByStepSolver
          steps={currentSolution.steps}
          calculationMode={currentSolution.calculationMode}
          appliedProperties={currentSolution.appliedProperties}
          partialFractions={currentSolution.partialFractions}
          onExplainStep={(step) => setExplainingStep(step)}
        />
      </section>

      {/* Highlighted Final Result Card */}
      <section className="rounded-3xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-blue-950/40 border-2 border-cyan-500/40 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl shadow-cyan-500/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-cyan-500/30 shrink-0">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Conclusiones de Control y Estabilidad
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                  Solución Hallada
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Valores analíticos del sistema en el dominio temporal y frecuencial
              </p>
            </div>
          </div>

          {/* Solutions Badges in KaTeX */}
          <div className="flex flex-wrap items-center gap-3">
            {currentSolution.finalSolutions.map((sol, index) => (
              <div
                key={index}
                className="px-5 py-3 rounded-2xl bg-slate-950/90 border border-cyan-500/50 shadow-lg text-cyan-300 text-base sm:text-lg font-bold font-mono flex items-center justify-center"
              >
                <MathRenderer math={sol} displayMode={false} showCopy={true} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formal Demonstration & Verification Section */}
      <section>
        <VerificationCard verification={currentSolution.verification} />
      </section>

      {/* Bottom Action (Hidden on Print) */}
      <div className="flex justify-center pt-6 pb-12 print:hidden">
        <button
          onClick={() => {
            resetState();
            router.push('/');
          }}
          className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-teal-500 hover:from-cyan-400 hover:via-blue-500 hover:to-teal-400 text-slate-950 font-black text-base shadow-xl shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <RotateCcw className="w-5 h-5 text-slate-950" />
          <span>RESOLVER OTRA ECUACIÓN DE LAPLACE</span>
        </button>
      </div>

      {/* Pedagogical Step Tutor Explainer Modal */}
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
              alt="Pizarra de Laplace ampliada"
              className="w-full h-full max-h-[80vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* Green Blackboard Compilable LaTeX (tcolorbox) Modal */}
      <GreenBlackboardModal
        isOpen={isGreenBoardOpen}
        onClose={() => setIsGreenBoardOpen(false)}
        equationLatex={currentSolution.timeDomainLatex || currentSolution.detectedLatex}
      />
    </div>
  );
}
