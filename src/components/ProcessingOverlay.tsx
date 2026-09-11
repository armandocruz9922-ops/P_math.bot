'use client';

import React from 'react';
import { ProcessingPhase } from '@/lib/types';
import { Sparkles, Cpu, CheckCircle2, ScanLine } from 'lucide-react';

interface ProcessingOverlayProps {
  phase: ProcessingPhase;
  percent: number;
}

const PHASE_DETAILS: Record<ProcessingPhase, { title: string; subtitle: string; icon: string }> = {
  idle: { title: 'Preparando...', subtitle: 'Iniciando conexión', icon: '⚡' },
  uploading: { title: 'Cargando imagen del pizarrón...', subtitle: 'Optimizando resolución y balance de blancos', icon: '📸' },
  scanning_board: { title: 'Escaneando trazos de tiza...', subtitle: 'Segmentando caracteres manuscritos sobre la pizarra', icon: '🔍' },
  extracting_ocr: { title: 'Extrayendo fórmula matemática...', subtitle: 'Transcribiendo escritura manual a sintaxis LaTeX estándar', icon: '📐' },
  validating_domain: { title: 'Validando Dominio de Laplace...', subtitle: 'Verificando pertenencia a Transformadas de Laplace y Sistemas Dinámicos', icon: '🛡️' },
  solving_math: { title: 'Calculando solución simbólica...', subtitle: 'Aplicando propiedades algebraicas y deducción paso a paso', icon: '🧠' },
  verifying_proof: { title: 'Verificando demostración formal...', subtitle: 'Comprobando igualdad por sustitución (LHS = RHS)', icon: '✨' },
  completed: { title: '¡Ecuación resuelta!', subtitle: 'Cargando desglose pedagógico', icon: '🎉' },
  error: { title: 'Error en el procesamiento', subtitle: 'Por favor, intenta nuevamente', icon: '⚠️' }
};

export const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({ phase, percent }) => {
  const current = PHASE_DETAILS[phase] || PHASE_DETAILS.idle;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
      <div className="relative w-full max-w-md p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-slate-700/60 shadow-2xl shadow-emerald-500/10 text-center overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Laser Scanner Icon Animation */}
        <div className="relative mx-auto w-24 h-24 mb-6">
          {/* Circular Pulse Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30 animate-ping opacity-30"></div>
          <div className="absolute inset-1 rounded-full border border-cyan-500/40 animate-pulse"></div>

          {/* Central Sphere */}
          <div className="w-full h-full rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center shadow-inner relative overflow-hidden">
            <span className="text-3xl select-none animate-bounce">{current.icon}</span>

            {/* Scanning line animation */}
            <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#34d399] animate-[scan_2s_ease-in-out_infinite]"></div>
          </div>
        </div>

        {/* Phase Text */}
        <h3 className="text-lg font-bold text-white mb-1.5 tracking-tight">
          {current.title}
        </h3>
        <p className="text-xs text-slate-400 mb-6 max-w-xs mx-auto leading-relaxed">
          {current.subtitle}
        </p>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full h-2.5 rounded-full bg-slate-800/80 border border-slate-700/50 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-300 ease-out shadow-[0_0_12px_rgba(52,211,153,0.5)]"
              style={{ width: `${percent}%` }}
            ></div>
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
            <span>PROCESANDO_PIZARRON</span>
            <span className="text-emerald-400 font-bold">{percent}%</span>
          </div>
        </div>

        {/* Mini Step indicators */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-4 gap-2 text-[10px] text-slate-400">
          <div className={`p-1.5 rounded-lg border ${percent >= 25 ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-semibold' : 'border-slate-800 bg-slate-900/50'}`}>
            1. Escaneo
          </div>
          <div className={`p-1.5 rounded-lg border ${percent >= 50 ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-semibold' : 'border-slate-800 bg-slate-900/50'}`}>
            2. OCR
          </div>
          <div className={`p-1.5 rounded-lg border ${percent >= 75 ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-semibold' : 'border-slate-800 bg-slate-900/50'}`}>
            3. Solución
          </div>
          <div className={`p-1.5 rounded-lg border ${percent >= 95 ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-semibold' : 'border-slate-800 bg-slate-900/50'}`}>
            4. Prueba
          </div>
        </div>
      </div>
    </div>
  );
};
