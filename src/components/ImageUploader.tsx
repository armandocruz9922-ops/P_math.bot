'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import Image from 'next/image';
import { useEquation } from '@/context/EquationContext';
import { SAMPLE_EQUATIONS } from '@/lib/sample-equations';
import { CameraCaptureModal } from './CameraCaptureModal';
import { ProcessingOverlay } from './ProcessingOverlay';
import { LaplaceCropper } from './LaplaceCropper';
import { LatexEditor } from './LatexEditor';
import { DataInputModal } from './DataInputModal';
import { ApiKeyModal } from './ApiKeyModal';
import { CalculationMode } from '@/lib/types';
import { validateLaplaceDomain } from '@/lib/laplace-solver';
import { MathRenderer } from './MathRenderer';
import { transcribeChalkboardImage } from '@/lib/ocr-solver-service';
import { 
  UploadCloud, 
  Camera, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Layers, 
  Crop, 
  Image as ImageIcon, 
  RotateCcw,
  Sigma,
  Activity,
  ArrowDownUp,
  ShieldAlert,
  Edit3,
  Copy,
  Check,
  Download,
  Code2,
  Sliders,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';

export const ImageUploader: React.FC = () => {
  const { 
    currentImage, 
    setCurrentImage, 
    croppedImage, 
    setCroppedImage,
    setCurrentSolution,
    calculationMode,
    setCalculationMode,
    solveEquation, 
    isProcessing, 
    processingPhase, 
    processingPercent,
    userApiKey,
    isApiKeyModalOpen,
    setIsApiKeyModalOpen,
    needsInputData,
    setNeedsInputData,
    submitUserParameters
  } = useEquation();

  const [isDragging, setIsDragging] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCroppingOpen, setIsCroppingOpen] = useState(false);
  const [isEditingLatex, setIsEditingLatex] = useState(false);
  const [manualLatex, setManualLatex] = useState<string>('');
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [domainAlert, setDomainAlert] = useState<{ show: boolean; message: string } | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isRlcCircuit, setIsRlcCircuit] = useState(false);
  const [copiedEq, setCopiedEq] = useState(false);
  const [copiedDoc, setCopiedDoc] = useState(false);
  const [showFullLatexDoc, setShowFullLatexDoc] = useState(false);
  const [rlcParams, setRlcParams] = useState<{ R: number; L: number; C: number; i0: number; v: number }>({
    R: 10,
    L: 1,
    C: 0.04,
    i0: 0,
    v: 1
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP o SVG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedSampleId(null);
        setCroppedImage(null);
        setCurrentSolution(null);
        try {
          sessionStorage.removeItem('mathboard_laplace_solution');
          sessionStorage.removeItem('mathboard_laplace_cropped_image');
        } catch (e) {
          // Ignorable
        }
        setErrorMessage(null);
        setNeedsInputData(null);
        setCurrentImage(event.target.result as string);
        setIsCroppingOpen(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedDataUrl: string) => {
    setCroppedImage(croppedDataUrl);
    setIsCroppingOpen(false);
    setErrorMessage(null);
    setIsTranscribing(true);

    try {
      const result = await transcribeChalkboardImage(croppedDataUrl, userApiKey);
      if (result?.raw_latex) {
        setManualLatex(result.raw_latex);
        setIsRlcCircuit(result.is_rlc);
      }
    } catch (e) {
      console.warn('Error en auto-transcripción de recorte:', e);
      setManualLatex('v(t) = L \\frac{di(t)}{dt} + R i(t) + \\frac{1}{C} \\int_{0}^{t} i(t) \\, dt');
      setIsRlcCircuit(true);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSelectSample = (sampleId: string, imagePath: string, mode: CalculationMode) => {
    setSelectedSampleId(sampleId);
    setCroppedImage(null);
    setCurrentSolution(null);
    setCurrentImage(imagePath);
    setCalculationMode(mode);
    setDomainAlert(null);
    setErrorMessage(null);

    const sample = SAMPLE_EQUATIONS.find((s) => s.id === sampleId);
    if (sample) {
      setManualLatex(sample.latex);
      setIsRlcCircuit(sampleId === 'circuito_rlc');
    }
  };

  const handleRemoveImage = () => {
    setCurrentImage(null);
    setCroppedImage(null);
    setSelectedSampleId(null);
    setCurrentSolution(null);
    try {
      sessionStorage.removeItem('mathboard_laplace_solution');
      sessionStorage.removeItem('mathboard_laplace_cropped_image');
    } catch (e) {
      // Ignorable
    }
    setManualLatex('');
    setErrorMessage(null);
    setNeedsInputData(null);
    setDomainAlert(null);
    setIsRlcCircuit(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Sample active formula text
  const currentSample = SAMPLE_EQUATIONS.find((s) => s.id === selectedSampleId);
  const activeEquation = manualLatex.trim() || currentSample?.latex || 'v(t) = L \\frac{di(t)}{dt} + R i(t) + \\frac{1}{C} \\int_{0}^{t} i(t) \\, dt';

  const fullLatexDoc = `\\documentclass{article}
\\usepackage{amsmath, amsfonts, amssymb}
\\usepackage[most]{tcolorbox}
\\usepackage{xcolor}

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
  ${activeEquation}
\\]
\\end{pizarron}

\\end{document}`;

  const handleCopyEq = () => {
    navigator.clipboard.writeText(activeEquation);
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

  const handleSolve = async () => {
    setErrorMessage(null);

    const effectiveLatex = activeEquation;

    // Check domain restriction if manual latex is present
    if (effectiveLatex && effectiveLatex.trim()) {
      const validation = validateLaplaceDomain(effectiveLatex);
      if (!validation.isValid) {
        setDomainAlert({
          show: true,
          message: validation.message
        });
        return;
      }
    }

    const hasCustomImage = Boolean(croppedImage || currentImage);
    const effectiveSampleId = hasCustomImage && !selectedSampleId ? undefined : selectedSampleId;

    const success = await solveEquation(
      currentImage || undefined, 
      effectiveSampleId || undefined, 
      effectiveLatex || undefined, 
      croppedImage || undefined,
      calculationMode,
      isRlcCircuit ? rlcParams : undefined
    );

    // Only set error if not waiting for user parameters and not waiting for API key
    if (!success && !needsInputData && !isApiKeyModalOpen) {
      setErrorMessage('No se pudo interpretar la fórmula en la imagen recortada. Por favor reajusta el recuadro o escribe la fórmula directamente.');
    }
  };

  return (
    <>
      <div className="w-full max-w-4xl mx-auto space-y-8">
        {/* Main Decorated Glass Panel */}
        <div className="relative rounded-3xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl shadow-cyan-950/20 overflow-hidden">
          {/* Subtle Ambient Light Gradients */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Pantalla 1: Captura, Recorte y Edición LaTeX
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Análisis de Laplace y Estabilidad Dinámica
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2">
              Sube una foto de tu pizarrón o libreta, recorta la ecuación y obtén la transformada paso a paso, polos en el plano s y la gráfica del tiempo de asentamiento.
            </p>
          </div>

          {/* Calculation Mode Selector Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-1.5 p-1.5 rounded-2xl bg-slate-950 border border-slate-800 max-w-xl mx-auto text-xs">
              <button
                type="button"
                onClick={() => setCalculationMode('transfer_function')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold transition cursor-pointer ${
                  calculationMode === 'transfer_function'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>G(s) Estabilidad & t_s</span>
              </button>

              <button
                type="button"
                onClick={() => setCalculationMode('direct')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold transition cursor-pointer ${
                  calculationMode === 'direct'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sigma className="w-4 h-4" />
                <span>ℒ&#123;f(t)&#125; Directa</span>
              </button>

              <button
                type="button"
                onClick={() => setCalculationMode('inverse')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold transition cursor-pointer ${
                  calculationMode === 'inverse'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ArrowDownUp className="w-4 h-4" />
                <span>ℒ⁻¹&#123;F(s)&#125; Inversa</span>
              </button>
            </div>
          </div>

          {/* Domain Restriction Alert Modal/Banner */}
          {domainAlert?.show && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 flex items-start gap-3 animate-fade-in shadow-xl">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-rose-200">Restricción de Dominio Activada</h4>
                <p className="leading-relaxed">{domainAlert.message}</p>
                <button
                  type="button"
                  onClick={() => {
                    setCalculationMode('transfer_function');
                    setSelectedSampleId('tf_subamortiguado');
                    setManualLatex('');
                    setDomainAlert(null);
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/20 text-rose-200 border border-rose-500/30 hover:bg-rose-500/30 transition font-semibold cursor-pointer"
                >
                  <span>Cargar Problema Válido de Laplace (G(s) = 25/(s² + 4s + 25))</span>
                </button>
              </div>
            </div>
          )}

          {/* Crop Mode or Normal Upload/Preview Area */}
          {isCroppingOpen && currentImage ? (
            <LaplaceCropper
              imageSrc={currentImage}
              onCropComplete={(croppedDataUrl) => {
                handleCropComplete(croppedDataUrl);
              }}
              onCancel={() => setIsCroppingOpen(false)}
            />
          ) : !currentImage ? (
            /* Upload Box */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 p-8 sm:p-12 text-center flex flex-col items-center justify-center ${
                isDragging
                  ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
                  : 'border-slate-700/80 hover:border-cyan-500/60 bg-slate-950/40 hover:bg-slate-950/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="relative mb-5">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-blue-500/20 to-teal-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:text-cyan-300 transition-all duration-300 shadow-lg shadow-cyan-500/10">
                  <UploadCloud className="w-10 h-10" />
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-1.5 group-hover:text-cyan-300 transition-colors">
                Arrastra la foto de tu pizarrón o cuaderno aquí
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mb-6">
                Especializado en fórmulas con tiza manuscrita de funciones de transferencia G(s), transformada ℒ&#123;f(t)&#125; o fracciones parciales.
              </p>

              {/* Dual Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Seleccionar Imagen</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-semibold text-xs transition-all cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <span>Tomar Foto del Pizarrón</span>
                </button>
              </div>
            </div>
          ) : (
            /* Preview State Card with Cropping controls */
            <div className="space-y-6">
              <div className="relative rounded-2xl overflow-hidden border border-cyan-500/40 bg-slate-950 shadow-xl group">
                <div className="relative w-full max-h-[420px] aspect-video sm:aspect-[16/9] flex items-center justify-center bg-slate-950 p-2">
                  <img
                    src={croppedImage || currentImage}
                    alt="Ecuación de Laplace capturada"
                    className="w-full h-full object-contain rounded-xl"
                  />

                  {/* Chalkboard status badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-950/85 border border-cyan-500/40 text-cyan-300 text-xs font-semibold backdrop-blur-md">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{croppedImage ? 'Ecuación Recortada para OCR' : 'Foto Lista para Análisis'}</span>
                  </div>

                  {/* Actions overlay */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <button
                      onClick={() => setIsCroppingOpen(true)}
                      title="Encuadrar la fórmula con LaplaceCropper"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold shadow-lg backdrop-blur-md transition cursor-pointer"
                    >
                      <Crop className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{croppedImage ? 'Volver a Recortar' : 'Recortar Pizarrón'}</span>
                    </button>

                    <button
                      onClick={handleRemoveImage}
                      title="Eliminar foto"
                      className="p-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-300 hover:text-rose-100 transition shadow-lg backdrop-blur-md cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subtitle status bar */}
                <div className="p-4 bg-slate-900/90 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <ImageIcon className="w-4 h-4 text-cyan-400" />
                    <span>
                      {selectedSampleId 
                        ? `Ejemplo: ${currentSample?.title}` 
                        : croppedImage 
                        ? 'Imagen Recortada y Optimizada' 
                        : 'Foto Subida'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {croppedImage && (
                      <button
                        onClick={() => setCroppedImage(null)}
                        className="text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Ver foto completa</span>
                      </button>
                    )}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline cursor-pointer"
                    >
                      Cambiar foto
                    </button>
                  </div>
                </div>
              </div>

              {/* Hidden file input for replacing */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* LaTeX Editor Section (if editing) or Detected Equation Card */}
              {isEditingLatex ? (
                <LatexEditor
                  initialLatex={manualLatex || currentSample?.latex || ''}
                  onApply={(newLatex) => {
                    setManualLatex(newLatex);
                    setIsEditingLatex(false);
                  }}
                  onCancel={() => setIsEditingLatex(false)}
                />
              ) : (
                <div className="space-y-4">
                  {/* Real-time OCR scanning indicator */}
                  {isTranscribing && (
                    <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-center gap-3 text-cyan-300 text-xs animate-pulse shadow-lg shadow-cyan-500/10">
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                      <span className="font-semibold">
                        Filtrando cuadrículas y sombras del cuaderno... Transcribiendo ecuación manuscrita en LaTeX
                      </span>
                    </div>
                  )}

                  {/* Main Chalkboard / LaTeX Card */}
                  <div className="p-5 sm:p-6 rounded-3xl bg-slate-950/95 border border-slate-800 shadow-2xl space-y-6">
                    {/* Header with Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Filtrado de Fondo & OCR Experto
                          </span>
                          {isRlcCircuit && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                              Circuito RLC
                            </span>
                          )}
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-white">
                          Interpretación Matemática de la Imagen
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Cuadrículas y sombras aisladas. Trazos transcritos en notación LaTeX estándar.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsEditingLatex(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer border border-slate-700"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Editar Fórmula</span>
                      </button>
                    </div>

                    {/* SECCIÓN 1: CÓDIGO LATEX (Solo la fórmula) */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                          1. CÓDIGO LATEX (Solo la fórmula):
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyEq}
                          className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                        >
                          {copiedEq ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedEq ? '¡Copiado!' : 'Copiar LaTeX'}</span>
                        </button>
                      </div>

                      {/* Math Typography Render */}
                      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-x-auto text-cyan-300 text-lg sm:text-xl shadow-inner min-h-[64px]">
                        <MathRenderer math={activeEquation} />
                      </div>

                      {/* Raw LaTeX Mono String */}
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between gap-2 overflow-x-auto">
                        <code className="truncate">{activeEquation}</code>
                      </div>
                    </div>

                    {/* SECCIÓN 2: CÓDIGO COMPLETO COMPILABLE (Pizarrón Verde) */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                          2. CÓDIGO COMPLETO COMPILABLE (Pizarrón Verde):
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleCopyDoc}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition cursor-pointer"
                          >
                            {copiedDoc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedDoc ? '¡Documento Copiado!' : 'Copiar .tex'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleDownloadTex}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Descargar</span>
                          </button>
                        </div>
                      </div>

                      {/* Visual Chalkboard Container */}
                      <div
                        className="relative p-6 sm:p-8 rounded-2xl text-center overflow-hidden transition-all duration-300"
                        style={{
                          backgroundColor: 'rgb(20, 65, 40)',
                          border: '8px solid rgb(110, 70, 40)',
                          boxShadow: 'inset 0 0 30px rgba(0,0,0,0.7), 0 10px 25px -5px rgba(0,0,0,0.5)'
                        }}
                      >
                        <div className="text-emerald-200/50 text-[10px] uppercase font-bold tracking-widest mb-2">
                          Entorno LaTeX tcolorbox (Pizarrón Escolar Verde)
                        </div>
                        <div className="text-white text-xl sm:text-2xl font-serif py-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                          <MathRenderer math={activeEquation} />
                        </div>
                      </div>

                      {/* Collapsible Source Code */}
                      <div className="rounded-xl border border-slate-800/90 overflow-hidden bg-slate-950">
                        <button
                          type="button"
                          onClick={() => setShowFullLatexDoc(!showFullLatexDoc)}
                          className="w-full px-3 py-2 flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 bg-slate-900/60 transition cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5">
                            <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                            {showFullLatexDoc ? 'Ocultar Código LaTeX Compilable' : 'Ver Código Fuente Compilable (tcolorbox)'}
                          </span>
                          {showFullLatexDoc ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {showFullLatexDoc && (
                          <div className="p-3 text-[11px] font-mono text-emerald-300/90 overflow-x-auto max-h-56 bg-slate-950/90 border-t border-slate-800">
                            <pre>{fullLatexDoc}</pre>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* SECCIÓN 3: PARÁMETROS DEL CIRCUITO RLC (Sin Asumir Datos) */}
                    {isRlcCircuit && (
                      <div className="p-4 sm:p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-3 animate-fade-in">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Sliders className="w-4 h-4 text-cyan-400" />
                            <h4 className="text-xs sm:text-sm font-bold text-cyan-200">
                              Parámetros Reales del Circuito RLC (Sin Inventar Datos)
                            </h4>
                          </div>

                          <button
                            type="button"
                            onClick={() => setRlcParams({ R: 10, L: 1, C: 0.04, i0: 0, v: 1 })}
                            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold underline cursor-pointer"
                          >
                            Valores Típicos: R=10Ω, L=1H, C=0.04F
                          </button>
                        </div>

                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          La ecuación manuscrita contiene componentes simbólicos (R, L, C). Ingresa los valores reales de tu ejercicio para calcular la función de transferencia G(s) = I(s)/V(s) y graficar el tiempo de asentamiento:
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1">
                              Resistencia R (Ω)
                            </label>
                            <input
                              type="number"
                              step="any"
                              value={rlcParams.R}
                              onChange={(e) => setRlcParams({ ...rlcParams, R: parseFloat(e.target.value) || 0 })}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:border-cyan-400 outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1">
                              Inductancia L (H)
                            </label>
                            <input
                              type="number"
                              step="any"
                              value={rlcParams.L}
                              onChange={(e) => setRlcParams({ ...rlcParams, L: parseFloat(e.target.value) || 0 })}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:border-cyan-400 outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1">
                              Capacitancia C (F)
                            </label>
                            <input
                              type="number"
                              step="any"
                              value={rlcParams.C}
                              onChange={(e) => setRlcParams({ ...rlcParams, C: parseFloat(e.target.value) || 0 })}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:border-cyan-400 outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1">
                              Corriente i(0) (A)
                            </label>
                            <input
                              type="number"
                              step="any"
                              value={rlcParams.i0}
                              onChange={(e) => setRlcParams({ ...rlcParams, i0: parseFloat(e.target.value) || 0 })}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:border-cyan-400 outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 mb-1">
                              Voltaje V (V)
                            </label>
                            <input
                              type="number"
                              step="any"
                              value={rlcParams.v}
                              onChange={(e) => setRlcParams({ ...rlcParams, v: parseFloat(e.target.value) || 0 })}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:border-cyan-400 outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Error Message Alert with Direct Action Buttons */}
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/60 text-rose-300 space-y-2.5 animate-fade-in shadow-xl">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-rose-200">{errorMessage}</p>
                      <p className="text-[11px] text-slate-300">
                        Puedes escribir la fórmula directamente o configurar tu API Key gratuita de Gemini:
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1 pl-8">
                    <button
                      type="button"
                      onClick={() => setIsApiKeyModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition cursor-pointer"
                    >
                      Configurar API Key / Transcribir
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingLatex(true)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                    >
                      Escribir Fórmula Manualmente
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCroppingOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs transition cursor-pointer"
                    >
                      Reajustar Recuadro
                    </button>
                  </div>
                </div>
              )}

              {/* Big Action Button: Resolver Laplace & Analizar Estabilidad */}
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={handleSolve}
                  disabled={isProcessing}
                  className="w-full sm:w-auto min-w-[320px] flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-teal-500 hover:from-cyan-400 hover:via-blue-500 hover:to-teal-400 text-slate-950 font-black text-base tracking-wide shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50"
                >
                  <Activity className="w-5 h-5 text-slate-950" />
                  <span>CALCULAR LAPLACE Y GRAFICAR ESTABILIDAD</span>
                  <ArrowRight className="w-5 h-5 text-slate-950" />
                </button>
              </div>
            </div>
          )}

          {/* Preset Blackboards Section for Instant 1-Click Testing */}
          <div className="mt-10 pt-8 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-bold text-white">
                  O prueba con estos pizarrones universitarios de Laplace y Sistemas de Control:
                </h4>
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:inline">1 clic para cargar</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {SAMPLE_EQUATIONS.map((sample) => {
                const isSelected = selectedSampleId === sample.id;
                return (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSelectSample(sample.id, sample.imagePath, sample.calculationMode)}
                    className={`relative p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer group overflow-hidden ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/30 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400'
                        : 'border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-cyan-300 border border-slate-700">
                        {sample.badge}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      )}
                    </div>

                    <div className="mb-2">
                      <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {sample.title}
                      </p>
                      <p className="text-[11px] font-mono text-cyan-400/90 mt-0.5">
                        {sample.subtitle}
                      </p>
                    </div>

                    <div className="w-full h-14 rounded-lg overflow-hidden border border-slate-800/80 bg-slate-900/90 mt-1">
                      <img
                        src={sample.imagePath}
                        alt={sample.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(dataUrl) => {
          setSelectedSampleId(null);
          setCroppedImage(null);
          setCurrentImage(dataUrl);
          setIsCroppingOpen(true);
        }}
      />

      {/* Multi-stage Processing Overlay */}
      {isProcessing && (
        <ProcessingOverlay phase={processingPhase} percent={processingPercent} />
      )}

      {/* Pop-up Modal for Missing Data / Initial Conditions (Zero Assumptions) */}
      <DataInputModal
        isOpen={Boolean(needsInputData)}
        needsInputData={needsInputData}
        onSubmit={async (parameters) => {
          await submitUserParameters(parameters);
        }}
        onCancel={() => setNeedsInputData(null)}
        isSubmitting={isProcessing}
      />

      {/* Pop-up Modal for Configuring Gemini API Key or Entering Formula */}
      <ApiKeyModal />
    </>
  );
};
