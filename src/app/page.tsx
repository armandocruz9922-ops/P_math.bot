'use client';

import React from 'react';
import { ImageUploader } from '@/components/ImageUploader';
import { Sparkles, Scan, Sigma, Activity, Clock, ShieldCheck, Compass } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative overflow-hidden pt-6 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Background Decorative Lighting */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[380px] bg-gradient-to-tr from-cyan-500/15 via-blue-500/10 to-teal-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Hero Header */}
      <div className="max-w-4xl mx-auto text-center pt-6 pb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-6 shadow-lg shadow-cyan-500/10 animate-fade-in">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Especializado en Transformadas de Laplace & Teoría de Control</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
          Del Pizarrón a Laplace Paso a Paso y{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">
            Tiempo de Asentamiento
          </span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Sube o toma una foto de cualquier función temporal $f(t)$, expresión $F(s)$ o función de transferencia $G(s)$. 
          Obtén el procedimiento matemático con KaTeX, cálculo de polos y ceros, y la gráfica interactiva del tiempo de asentamiento ($t_s$).
        </p>

        {/* Feature Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-300 font-medium">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/70 border border-slate-800 shadow-sm">
            <Scan className="w-4 h-4 text-cyan-400" />
            <span>Recorte LaplaceCropper</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/70 border border-slate-800 shadow-sm">
            <Activity className="w-4 h-4 text-teal-400" />
            <span>Polos en el Plano s (LHP / RHP)</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/70 border border-slate-800 shadow-sm">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>Tiempo de Asentamiento t_s (±2%)</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Panel (Screen 1: Captura, Recorte y Edición LaTeX) */}
      <section className="relative">
        <ImageUploader />
      </section>

      {/* Pedagogical 3-Step Process Flow for Laplace & Stability */}
      <section className="max-w-5xl mx-auto mt-24 pt-12 border-t border-slate-900/80">
        <div className="text-center mb-12">
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            ¿Cómo funciona el motor de Laplace y Estabilidad?
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Diseñado exclusivamente para el análisis riguroso de sistemas dinámicos y cálculo en el dominio de la frecuencia compleja
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-cyan-500/30 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-lg mb-4 group-hover:scale-105 transition-transform">
              1
            </div>
            <h4 className="text-base font-bold text-white mb-2">Captura y Recorte Selectivo</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Encuadra la zona exacta de la ecuación en el pizarrón con LaplaceCropper. El sistema aísla los trazos de tiza y verifica que pertenezca al dominio de Laplace.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-teal-500/30 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-lg mb-4 group-hover:scale-105 transition-transform">
              2
            </div>
            <h4 className="text-base font-bold text-white mb-2">Solución Paso a Paso y Fracciones</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Aplicación de tablas de Laplace, propiedades de traslación, derivadas y expansión en fracciones parciales por Heaviside formateada en KaTeX.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-blue-500/30 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-lg mb-4 group-hover:scale-105 transition-transform">
              3
            </div>
            <h4 className="text-base font-bold text-white mb-2">Respuesta Temporal y Estabilidad</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Graficación de la respuesta al escalón y(t), franja de tolerancia (±2%), indicador destacado en el tiempo de asentamiento ($t_s$) y mapa de polos en el plano s.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
