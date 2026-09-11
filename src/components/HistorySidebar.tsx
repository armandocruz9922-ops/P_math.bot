'use client';

import React from 'react';
import { HistoryEntry } from '@/lib/types';
import { MathRenderer } from './MathRenderer';
import { 
  History, 
  X, 
  Trash2, 
  ArrowRight, 
  Clock, 
  CheckCircle2,
  Layers
} from 'lucide-react';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryEntry[];
  onSelectEntry: (entry: HistoryEntry) => void;
  onClearHistory: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isOpen,
  onClose,
  history,
  onSelectEntry,
  onClearHistory
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="absolute inset-0"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Historial de Ecuaciones
                </h3>
                <p className="text-xs text-slate-400">
                  {history.length} {history.length === 1 ? 'ecuación registrada' : 'ecuaciones registradas'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Content / List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
                  <History className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Sin historial aún</h4>
                <p className="text-xs text-slate-400 max-w-xs">
                  Las ecuaciones que escanees o resuelvas en esta sesión aparecerán aquí para consultarlas en 1 clic.
                </p>
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectEntry(item);
                    onClose();
                  }}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-950/80 transition-all cursor-pointer group space-y-2.5"
                >
                  {/* Top Bar with Badge and Timestamp */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="px-2 py-0.5 rounded-md font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {item.equationType}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3" />
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Thumbnail & Formula */}
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-12 rounded-lg overflow-hidden border border-slate-800 bg-slate-900 shrink-0">
                      <img
                        src={item.thumbnail}
                        alt="Miniatura"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="text-xs font-bold text-white truncate">
                        <MathRenderer math={item.detectedLatex} displayMode={false} />
                      </div>
                      <p className="text-[11px] font-mono text-emerald-300 truncate mt-0.5">
                        Sol: {item.solutions.join(', ')}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer with Clear option */}
          {history.length > 0 && (
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <button
                type="button"
                onClick={onClearHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-rose-400 hover:text-rose-300 text-xs hover:bg-rose-950/30 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vaciar Historial</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
