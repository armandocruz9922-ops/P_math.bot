'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import Image from 'next/image';
import { useEquation } from '@/context/EquationContext';
import { SAMPLE_EQUATIONS } from '@/lib/sample-equations';
import { CameraCaptureModal } from './CameraCaptureModal';
import { ProcessingOverlay } from './ProcessingOverlay';
import { ImageCropper } from './ImageCropper';
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
  RotateCcw
} from 'lucide-react';

export const ImageUploader: React.FC = () => {
  const { 
    currentImage, 
    setCurrentImage, 
    croppedImage,
    setCroppedImage,
    solveEquation, 
    isProcessing, 
    processingPhase, 
    processingPercent 
  } = useEquation();

  const [isDragging, setIsDragging] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCroppingOpen, setIsCroppingOpen] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
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
        setCurrentImage(event.target.result as string);
        // Automatically offer cropping for custom uploaded photos
        setIsCroppingOpen(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sampleId: string, imagePath: string) => {
    setSelectedSampleId(sampleId);
    setCroppedImage(null);
    setCurrentImage(imagePath);
  };

  const handleRemoveImage = () => {
    setCurrentImage(null);
    setCroppedImage(null);
    setSelectedSampleId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSolve = async () => {
    if (!currentImage && !croppedImage) return;
    await solveEquation(
      currentImage || undefined, 
      selectedSampleId || undefined, 
      undefined, 
      croppedImage || undefined
    );
  };

  return (
    <>
      <div className="w-full max-w-4xl mx-auto space-y-8">
        {/* Main Decorated Glass Panel */}
        <div className="relative rounded-3xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl shadow-emerald-950/20 overflow-hidden">
          {/* Subtle Ambient Light Gradients */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

          {/* Section Header */}
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Paso 1: Captura, Recorte y Digitalización
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Sube la foto de tu pizarra de clase
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Sube o toma una foto del pizarrón, recorta la región exacta de la ecuación y deja que nuestro motor genere la solución con gráficas y demostración.
            </p>
          </div>

          {/* Crop Mode or Normal Upload/Preview Area */}
          {isCroppingOpen && currentImage ? (
            <ImageCropper
              imageSrc={currentImage}
              onCropComplete={(croppedDataUrl) => {
                setCroppedImage(croppedDataUrl);
                setIsCroppingOpen(false);
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
                  ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]'
                  : 'border-slate-700/80 hover:border-emerald-500/60 bg-slate-950/40 hover:bg-slate-950/60'
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
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:text-emerald-300 transition-all duration-300 shadow-lg shadow-emerald-500/10">
                  <UploadCloud className="w-10 h-10" />
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-1.5 group-hover:text-emerald-300 transition-colors">
                Arrastra tu imagen aquí o haz clic para explorar
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mb-6">
                Formatos compatibles: JPG, PNG, WEBP, SVG. Admite fotos con iluminación variable sobre pizarrón verde o negro.
              </p>

              {/* Dual Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Seleccionar Archivo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-semibold text-xs transition-all cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span>Tomar Foto con Cámara</span>
                </button>
              </div>
            </div>
          ) : (
            /* Preview State Card with Cropping controls */
            <div className="space-y-6">
              <div className="relative rounded-2xl overflow-hidden border border-emerald-500/40 bg-slate-950 shadow-xl group">
                <div className="relative w-full max-h-[420px] aspect-video sm:aspect-[16/9] flex items-center justify-center bg-slate-950 p-2">
                  <img
                    src={croppedImage || currentImage}
                    alt="Pizarrón escolar capturado"
                    className="w-full h-full object-contain rounded-xl"
                  />

                  {/* Chalkboard status badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold backdrop-blur-md">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{croppedImage ? 'Área de Tiza Recortada' : 'Pizarrón Listo para Análisis'}</span>
                  </div>

                  {/* Actions overlay */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <button
                      onClick={() => setIsCroppingOpen(true)}
                      title="Recortar y ajustar área de la ecuación"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold shadow-lg backdrop-blur-md transition cursor-pointer"
                    >
                      <Crop className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{croppedImage ? 'Volver a Recortar' : 'Recortar Área'}</span>
                    </button>

                    <button
                      onClick={handleRemoveImage}
                      title="Eliminar y elegir otra foto"
                      className="p-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-300 hover:text-rose-100 transition shadow-lg backdrop-blur-md cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subtitle status bar */}
                <div className="p-4 bg-slate-900/90 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <ImageIcon className="w-4 h-4 text-emerald-400" />
                    <span>
                      {selectedSampleId 
                        ? 'Ejemplo Escolar Seleccionado' 
                        : croppedImage 
                        ? 'Foto Recortada y Optimizada para OCR' 
                        : 'Foto Original Subida'}
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
                      className="text-emerald-400 hover:text-emerald-300 font-medium hover:underline cursor-pointer"
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

              {/* Detected Equation Confirmation Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-inner space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Fórmula a resolver:
                  </span>
                  <span className="text-[11px] text-emerald-400 font-mono">
                    {selectedSampleId === 'cuadratica' ? '2x² + 5x - 3 = 0' : selectedSampleId === 'lineal' ? '3x - 7 = 14' : '= L di/dt + Ri + 1/C ∫ i dt'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-center overflow-x-auto text-sm">
                  {selectedSampleId === 'cuadratica' ? (
                    <span className="font-mono text-emerald-300">2x^2 + 5x - 3 = 0</span>
                  ) : selectedSampleId === 'lineal' ? (
                    <span className="font-mono text-emerald-300">3x - 7 = 14</span>
                  ) : (
                    <span className="font-mono text-emerald-300">v(t) = L \frac&#123;di(t)&#125;&#123;dt&#125; + R i(t) + \frac&#123;1&#125;&#123;C&#125; \int_0^t i(\tau) \, d\tau</span>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 text-center">
                  💡 Tip: Puedes ingresar tu Google Gemini API Key en Configuración (icono ⚙️ arriba) para transcribir automáticamente cualquier otra foto manuscrita por visión AI.
                </p>
              </div>

              {/* Big Action Button: Resolver Ecuación */}
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={handleSolve}
                  disabled={isProcessing}
                  className="w-full sm:w-auto min-w-[280px] flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 text-slate-950 font-black text-base tracking-wide shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-5 h-5 text-slate-950" />
                  <span>RESOLVER ECUACIÓN</span>
                  <ArrowRight className="w-5 h-5 text-slate-950" />
                </button>
              </div>
            </div>
          )}

          {/* Preset Blackboards Section for Instant 1-Click Testing */}
          <div className="mt-10 pt-8 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">
                  O prueba al instante con estos pizarrones de clase de muestra:
                </h4>
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:inline">1 clic para probar</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {SAMPLE_EQUATIONS.map((sample) => {
                const isSelected = selectedSampleId === sample.id;
                return (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSelectSample(sample.id, sample.imagePath)}
                    className={`relative p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer group overflow-hidden ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-950/30 shadow-lg shadow-emerald-500/15 ring-1 ring-emerald-400'
                        : 'border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                        {sample.badge}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>

                    <div className="mb-2">
                      <p className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {sample.title}
                      </p>
                      <p className="text-[11px] font-mono text-emerald-400/90 mt-0.5">
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
    </>
  );
};
