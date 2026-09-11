'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useEquation } from '@/context/EquationContext';
import { HistorySidebar } from './HistorySidebar';
import { Sparkles, Settings, Key, History, Check, X, GraduationCap } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    userApiKey, 
    setUserApiKey, 
    history, 
    isHistoryOpen, 
    setIsHistoryOpen,
    loadHistoryEntry,
    clearHistory
  } = useEquation();

  const [showSettings, setShowSettings] = useState(false);
  const [keyInput, setKeyInput] = useState(userApiKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    setUserApiKey(keyInput.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setShowSettings(false);
    }, 1200);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-teal-500 p-[1px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/30 transition-all duration-300">
              <div className="w-full h-full rounded-xl bg-slate-950 flex items-center justify-center font-bold text-cyan-400 text-base">
                <span className="group-hover:scale-110 transition-transform duration-200 font-mono">ℒ&#123;s&#125;</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                  LaplaceControl
                </span>
                <span className="px-2 py-0.5 text-[11px] font-semibold tracking-wider uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full">
                  Laplace & t_s
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                LaplaceCropper • Fracciones Parciales • Polos y Ceros • Tiempo de Asentamiento
              </p>
            </div>
          </Link>

          {/* Right Actions: History & Settings */}
          <div className="flex items-center gap-2.5">
            {/* History Toggle Button */}
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all text-xs font-semibold cursor-pointer"
              title="Ver Historial de Ecuaciones"
            >
              <History className="w-4 h-4 text-teal-400" />
              <span>Historial</span>
              {history.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px]">
                  {history.length}
                </span>
              )}
            </button>

            {/* Settings Modal Button */}
            <button
              onClick={() => {
                setKeyInput(userApiKey);
                setShowSettings(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all text-xs font-medium cursor-pointer"
              title="Configuración de API"
            >
              <Settings className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Configuración</span>
            </button>
          </div>
        </div>
      </header>

      {/* History Drawer Sidebar */}
      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectEntry={loadHistoryEntry}
        onClearHistory={clearHistory}
      />

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <button
              onClick={() => setShowSettings(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Configuración del Motor OCR</h3>
                <p className="text-xs text-slate-400">Elige cómo deseas procesar las fotos del pizarrón</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <p className="font-semibold text-emerald-300 mb-1 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-emerald-400" /> Modo Standalone / Local (Predeterminado)
                </p>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  No requiere ninguna clave externa. Incluye presets de pizarrones escolares, graficador 2D interactivo, KaTeX y demostración formal paso a paso.
                </p>
              </div>

              <form onSubmit={handleSaveKey} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Google Gemini API Key (Opcional para fotos personalizadas)
                  </label>
                  <input
                    type="password"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono text-xs"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Si agregas tu clave, se utilizará Gemini Vision Multimodal para transcribir fotos tomadas con tu cámara.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setKeyInput('');
                      setUserApiKey('');
                    }}
                    className="px-3 py-2 rounded-xl text-slate-400 hover:text-white text-xs hover:bg-slate-800 cursor-pointer"
                  >
                    Borrar Clave
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/25 transition cursor-pointer"
                  >
                    {savedSuccess ? (
                      <>
                        <Check className="w-4 h-4" /> Guardado
                      </>
                    ) : (
                      'Guardar Preferencia'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
