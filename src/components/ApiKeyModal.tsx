'use client';

import React, { useState } from 'react';
import { useEquation } from '@/context/EquationContext';
import { Key, Sparkles, ExternalLink, X, ArrowRight, Edit3, ShieldAlert } from 'lucide-react';

export const ApiKeyModal: React.FC = () => {
  const { 
    isApiKeyModalOpen, 
    setIsApiKeyModalOpen, 
    userApiKey, 
    setUserApiKey, 
    solveEquation, 
    currentImage, 
    croppedImage,
    calculationMode 
  } = useEquation();

  const [inputKey, setInputKey] = useState(userApiKey || '');
  const [manualFormula, setManualFormula] = useState('');
  const [activeTab, setActiveTab] = useState<'api_key' | 'manual_formula'>('api_key');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isApiKeyModalOpen) return null;

  const handleSaveAndAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (activeTab === 'api_key') {
      const trimmed = inputKey.trim();
      if (!trimmed) {
        setErrorMsg('Por favor ingresa una API Key válida de Gemini (inicia comúnmente con AIzaSy...).');
        return;
      }
      setUserApiKey(trimmed);
      setIsApiKeyModalOpen(false);
      // Retry analysis with the new key
      await solveEquation(currentImage || undefined, undefined, undefined, croppedImage || undefined, calculationMode);
    } else {
      const trimmedFormula = manualFormula.trim();
      if (!trimmedFormula) {
        setErrorMsg('Por favor ingresa la fórmula matemática que aparece en tu imagen.');
        return;
      }
      setIsApiKeyModalOpen(false);
      // Solve directly using the formula text provided
      await solveEquation(currentImage || undefined, undefined, trimmedFormula, croppedImage || undefined, calculationMode);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 p-6 sm:p-8 shadow-2xl shadow-cyan-950/40 text-left overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow accents */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

        {/* Close Button */}
        <button
          onClick={() => setIsApiKeyModalOpen(false)}
          className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3.5 mb-5">
          <div className="p-3 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shrink-0">
            <Key className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Configura el OCR de Visión
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Para leer los trazos manuscritos de tu foto recortada se requiere una API Key de Google Gemini (100% gratuita) o puedes ingresar la fórmula directamente.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('api_key')}
            className={`flex-1 py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'api_key'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Usar Gemini API Key</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manual_formula')}
            className={`flex-1 py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'manual_formula'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Transcribir Fórmula</span>
          </button>
        </div>

        <form onSubmit={handleSaveAndAnalyze} className="space-y-4">
          {activeTab === 'api_key' ? (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 leading-relaxed space-y-1.5">
                <p className="text-slate-200 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  ¿Cómo obtener tu clave en 30 segundos?
                </p>
                <p>
                  Google ofrece acceso gratuito a Gemini Flash para transcripción multimodal de imágenes:
                </p>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-semibold hover:underline"
                >
                  <span>Abrir Google AI Studio (Crear API Key gratis)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Pega tu Gemini API Key:
                </label>
                <input
                  type="password"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Escribe la fórmula que aparece en tu foto:
                </label>
                <input
                  type="text"
                  value={manualFormula}
                  onChange={(e) => setManualFormula(e.target.value)}
                  placeholder="Ej: L di/dt + R i + 1/C \int i dt  o  y'' + 4y' + 13y = 0"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  💡 Si la fórmula contiene variables sin valor (como R, L, C o condiciones iniciales), el sistema te las preguntará inmediatamente en el siguiente paso.
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-slate-500 w-full">Ejemplos rápidos para probar:</span>
                <button
                  type="button"
                  onClick={() => setManualFormula('v(t) = L \\frac{di}{dt} + R i(t) + \\frac{1}{C} \\int_0^t i(t) dt')}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-[10px] text-cyan-300 font-mono transition cursor-pointer"
                >
                  Circuito RLC (L di/dt + Ri + 1/C ∫ i dt)
                </button>
                <button
                  type="button"
                  onClick={() => setManualFormula("y'' + 4y' + 13y = 0")}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-[10px] text-cyan-300 font-mono transition cursor-pointer"
                >
                  Ec. Diferencial (y'' + 4y' + 13y = 0)
                </button>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsApiKeyModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs hover:bg-slate-800 transition cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-teal-500 hover:from-cyan-400 hover:via-blue-500 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 transition cursor-pointer"
            >
              <span>{activeTab === 'api_key' ? 'Guardar y Analizar Foto' : 'Continuar y Resolver'}</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
