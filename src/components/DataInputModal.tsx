'use client';

import React, { useState, useEffect } from 'react';
import { MissingParameter, NeedsInputData } from '@/lib/types';
import { MathRenderer } from './MathRenderer';
import { AlertCircle, ArrowRight, X, Sparkles, HelpCircle, Check } from 'lucide-react';

interface DataInputModalProps {
  isOpen: boolean;
  needsInputData: NeedsInputData | null;
  onSubmit: (parameters: Record<string, number>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const DataInputModal: React.FC<DataInputModalProps> = ({
  isOpen,
  needsInputData,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Initialize input state whenever needsInputData changes
  useEffect(() => {
    if (needsInputData?.missing_parameters) {
      const initial: Record<string, string> = {};
      needsInputData.missing_parameters.forEach((param) => {
        initial[param.key] = '';
      });
      setFormValues(initial);
      setFormErrors({});
    }
  }, [needsInputData]);

  if (!isOpen || !needsInputData) return null;

  const handleChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    if (formErrors[key]) {
      setFormErrors((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    const parsedValues: Record<string, number> = {};

    needsInputData.missing_parameters.forEach((param) => {
      const val = formValues[param.key]?.trim();
      if (param.required && (!val || val === '')) {
        errors[param.key] = 'Este parámetro es requerido';
        return;
      }

      if (val !== undefined && val !== '') {
        const num = Number(val);
        if (isNaN(num)) {
          errors[param.key] = 'Ingresa un número válido';
        } else {
          parsedValues[param.key] = num;
        }
      } else {
        // If not required and empty, assign default 0
        parsedValues[param.key] = 0;
      }
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    onSubmit(parsedValues);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 p-6 sm:p-8 shadow-2xl shadow-cyan-950/40 text-left overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Lighting */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
          title="Cerrar y reajustar recorte"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3.5 mb-5">
          <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0 shadow-inner">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Datos incompletos en la imagen
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              No se detectaron todos los parámetros necesarios en la foto para resolver la transformada o graficar la estabilidad. Por favor ingresa los valores faltantes:
            </p>
          </div>
        </div>

        {/* Detected Formula Preview Box */}
        {needsInputData.detected_formula && (
          <div className="mb-6 p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Fórmula leída de tu foto:
            </span>
            <div className="py-2 px-3 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-center overflow-x-auto text-sm font-mono text-cyan-300">
              <MathRenderer math={needsInputData.detected_formula} displayMode={false} />
            </div>
          </div>
        )}

        {/* Dynamic Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {needsInputData.missing_parameters.map((param) => (
              <div 
                key={param.key} 
                className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono text-xs font-semibold">
                      {param.symbol || param.key}
                    </span>
                    <span>{param.label}</span>
                  </label>
                  {param.required && (
                    <span className="text-[10px] text-amber-400 font-semibold">Requerido</span>
                  )}
                </div>

                {param.description && (
                  <p className="text-[11px] text-slate-400">{param.description}</p>
                )}

                <input
                  type="text"
                  inputMode="decimal"
                  value={formValues[param.key] ?? ''}
                  onChange={(e) => handleChange(param.key, e.target.value)}
                  placeholder={`Ej: ${param.placeholder || '0'}`}
                  className={`w-full px-3.5 py-2 rounded-xl bg-slate-900 border text-white font-mono text-sm focus:outline-none transition ${
                    formErrors[param.key]
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400'
                  }`}
                />

                {formErrors[param.key] && (
                  <p className="text-[11px] text-rose-400 font-semibold">{formErrors[param.key]}</p>
                )}
              </div>
            ))}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs hover:bg-slate-800 transition cursor-pointer"
            >
              Reajustar Recuadro
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-teal-500 hover:from-cyan-400 hover:via-blue-500 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 transition cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Resolviendo...' : 'Continuar y Resolver'}</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
