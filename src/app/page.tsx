'use client';

import React from 'react';
import { ImageUploader } from '@/components/ImageUploader';
import { Sparkles, Scan, Sigma, CheckCircle, ShieldCheck, ArrowDown } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative overflow-hidden pt-6 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Background Decorative Lighting */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Hero Header */}
      <div className="max-w-4xl mx-auto text-center pt-6 pb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-6 shadow-lg shadow-emerald-500/10 animate-fade-in">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Inteligencia Artificial para el Aula de Matemáticas</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
          De la Foto del Pizarrón a la{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Demostración Paso a Paso
          </span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Toma una foto de cualquier ecuación matemática escrita a mano con tiza en el pizarrón. 
          Extraemos la fórmula en LaTeX, resolvemos cada paso algebraico y demostramos formalmente su validez.
        </p>

        {/* Feature Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-300 font-medium">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <Scan className="w-4 h-4 text-emerald-400" />
            <span>OCR de Tiza Manuscrita</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <Sigma className="w-4 h-4 text-teal-400" />
            <span>Renderizado KaTeX Elegante</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Comprobación Formal LHS = RHS</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Panel (Screen 1) */}
      <section className="relative">
        <ImageUploader />
      </section>

      {/* Pedagogical 3-Step Process Flow */}
      <section className="max-w-5xl mx-auto mt-24 pt-12 border-t border-slate-900/80">
        <div className="text-center mb-12">
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            ¿Cómo funciona MathBoard AI?
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Diseñado para transformar fotos reales de clase en explicaciones matemáticas completas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-emerald-500/30 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg mb-4 group-hover:scale-105 transition-transform">
              1
            </div>
            <h4 className="text-base font-bold text-white mb-2">Captura de Pizarra</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sube una foto o captura directamente con la cámara del teléfono o laptop. El sistema aísla los trazos de tiza sin importar el reflejo.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-teal-500/30 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-lg mb-4 group-hover:scale-105 transition-transform">
              2
            </div>
            <h4 className="text-base font-bold text-white mb-2">Segmentación & KaTeX</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              El motor identifica los símbolos y exponentes (x², ±, raíces, fracciones e igualdades) transcribiéndolos a código LaTeX tipográficamente perfecto.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-cyan-500/30 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-lg mb-4 group-hover:scale-105 transition-transform">
              3
            </div>
            <h4 className="text-base font-bold text-white mb-2">Resolución con Demostración</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Obtén la explicación de cada paso con su regla algebraica y una sección de comprobación formal que sustituye los resultados para verificar la igualdad.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
