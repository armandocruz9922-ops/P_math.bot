import type { Metadata } from 'next';
import './globals.css';
import { EquationProvider } from '@/context/EquationContext';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'MathBoard AI | Solucionador de Ecuaciones de Pizarrón con Demostración',
  description: 'Aplicación web para capturar y resolver ecuaciones matemáticas manuscritas de pizarrón escolar con OCR, fórmulas KaTeX, pasos detallados y comprobación formal.',
  keywords: ['matemáticas', 'OCR', 'pizarrón', 'ecuaciones cuadráticas', 'KaTeX', 'demostración paso a paso', 'Next.js'],
  authors: [{ name: 'MathBoard AI Team' }]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark h-full">
      <body className="min-h-full flex flex-col bg-[#090d16] text-slate-100 bg-chalk-grid selection:bg-emerald-500 selection:text-slate-950">
        <EquationProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <footer className="border-t border-slate-900 bg-slate-950/60 py-8 text-center text-xs text-slate-400">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>MathBoard AI • Diseñado para Estudiantes y Docentes</span>
              </div>
              <p className="text-slate-400">
                Reconocimiento de Tiza en Pizarra • Renderizado KaTeX • Verificación Algebraica
              </p>
            </div>
          </footer>
        </EquationProvider>
      </body>
    </html>
  );
}
