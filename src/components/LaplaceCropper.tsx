'use client';

import React, { useState, useRef, useEffect, MouseEvent, TouchEvent } from 'react';
import { Crop, RotateCcw, Check, X, Move, Sparkles, Maximize2, Contrast } from 'lucide-react';

interface CropBox {
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  width: number; // percentage (0 - 100)
  height: number; // percentage (0 - 100)
}

interface LaplaceCropperProps {
  imageSrc: string;
  onCropComplete: (croppedDataUrl: string) => void;
  onCancel: () => void;
}

export const LaplaceCropper: React.FC<LaplaceCropperProps> = ({
  imageSrc,
  onCropComplete,
  onCancel
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Crop box in percentage of the image container
  const [cropBox, setCropBox] = useState<CropBox>({
    x: 10,
    y: 15,
    width: 80,
    height: 70
  });

  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ mouseX: number; mouseY: number; box: CropBox } | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'free' | '16:9' | '4:3' | '1:1'>('free');
  const [enhanceContrast, setEnhanceContrast] = useState<boolean>(true);

  // Handle pointer down on handles or inside crop box
  const startDrag = (e: MouseEvent | TouchEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setActiveHandle(handle);
    setDragStart({
      mouseX: clientX,
      mouseY: clientY,
      box: { ...cropBox }
    });
  };

  useEffect(() => {
    const handleMove = (e: globalThis.MouseEvent | globalThis.TouchEvent) => {
      if (!activeHandle || !dragStart || !containerRef.current) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const rect = containerRef.current.getBoundingClientRect();
      const deltaXPercent = ((clientX - dragStart.mouseX) / rect.width) * 100;
      const deltaYPercent = ((clientY - dragStart.mouseY) / rect.height) * 100;

      const { box } = dragStart;

      let newX = box.x;
      let newY = box.y;
      let newW = box.width;
      let newH = box.height;

      if (activeHandle === 'move') {
        newX = Math.max(0, Math.min(100 - box.width, box.x + deltaXPercent));
        newY = Math.max(0, Math.min(100 - box.height, box.y + deltaYPercent));
      } else if (activeHandle === 'se') {
        newW = Math.max(15, Math.min(100 - box.x, box.width + deltaXPercent));
        newH = Math.max(15, Math.min(100 - box.y, box.height + deltaYPercent));
      } else if (activeHandle === 'sw') {
        const potentialW = Math.max(15, box.width - deltaXPercent);
        newX = Math.max(0, box.x + (box.width - potentialW));
        newW = potentialW;
        newH = Math.max(15, Math.min(100 - box.y, box.height + deltaYPercent));
      } else if (activeHandle === 'ne') {
        newW = Math.max(15, Math.min(100 - box.x, box.width + deltaXPercent));
        const potentialH = Math.max(15, box.height - deltaYPercent);
        newY = Math.max(0, box.y + (box.height - potentialH));
        newH = potentialH;
      } else if (activeHandle === 'nw') {
        const potentialW = Math.max(15, box.width - deltaXPercent);
        newX = Math.max(0, box.x + (box.width - potentialW));
        newW = potentialW;
        const potentialH = Math.max(15, box.height - deltaYPercent);
        newY = Math.max(0, box.y + (box.height - potentialH));
        newH = potentialH;
      }

      // Maintain aspect ratio if not 'free'
      if (aspectRatio === '16:9') {
        newH = (newW * 9) / 16;
      } else if (aspectRatio === '4:3') {
        newH = (newW * 3) / 4;
      } else if (aspectRatio === '1:1') {
        newH = newW;
      }

      setCropBox({
        x: Math.min(Math.max(0, newX), 85),
        y: Math.min(Math.max(0, newY), 85),
        width: Math.min(newW, 100 - newX),
        height: Math.min(newH, 100 - newY)
      });
    };

    const handleEnd = () => {
      setActiveHandle(null);
      setDragStart(null);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [activeHandle, dragStart, aspectRatio]);

  const handleApplyCrop = () => {
    if (!imgRef.current) return;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const naturalWidth = image.naturalWidth || image.width || 800;
    const naturalHeight = image.naturalHeight || image.height || 500;

    const cropX = (cropBox.x / 100) * naturalWidth;
    const cropY = (cropBox.y / 100) * naturalHeight;
    const cropWidth = (cropBox.width / 100) * naturalWidth;
    const cropHeight = (cropBox.height / 100) * naturalHeight;

    canvas.width = cropWidth;
    canvas.height = cropHeight;

    if (enhanceContrast) {
      // Chalkboard/notebook contrast boost for OCR clarity
      ctx.filter = 'contrast(1.25) brightness(1.05)';
    }

    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.95);
    onCropComplete(croppedDataUrl);
  };

  const handleResetCrop = () => {
    setCropBox({ x: 5, y: 5, width: 90, height: 90 });
  };

  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-7 shadow-2xl space-y-5">
      {/* Header & Instructions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Crop className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Herramienta de Recorte de Laplace (LaplaceCropper)
            </h3>
            <p className="text-xs text-slate-400">
              Aísla la ecuación diferencial, transformada ℒ&#123;f(t)&#125; o función de transferencia G(s)
            </p>
          </div>
        </div>

        {/* Aspect Ratio Buttons & Contrast Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEnhanceContrast(!enhanceContrast)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs border transition ${
              enhanceContrast 
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-semibold' 
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
            title="Mejora el contraste de la tiza sobre el pizarrón"
          >
            <Contrast className="w-3.5 h-3.5 text-cyan-400" />
            <span>Contraste Tiza</span>
          </button>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <button
              onClick={() => setAspectRatio('free')}
              className={`px-2 py-0.5 rounded-lg transition ${
                aspectRatio === 'free' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Libre
            </button>
            <button
              onClick={() => setAspectRatio('16:9')}
              className={`px-2 py-0.5 rounded-lg transition ${
                aspectRatio === '16:9' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              16:9
            </button>
            <button
              onClick={() => setAspectRatio('4:3')}
              className={`px-2 py-0.5 rounded-lg transition ${
                aspectRatio === '4:3' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              4:3
            </button>
            <button
              onClick={() => setAspectRatio('1:1')}
              className={`px-2 py-0.5 rounded-lg transition ${
                aspectRatio === '1:1' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              1:1
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Crop Viewport */}
      <div className="relative rounded-2xl overflow-hidden bg-black/90 border border-slate-700/80 shadow-inner flex items-center justify-center select-none">
        <div ref={containerRef} className="relative w-full max-h-[460px] aspect-video flex items-center justify-center">
          <img
            ref={imgRef}
            src={imageSrc}
            alt="Pizarra o cuaderno con ecuación de Laplace"
            className="w-full h-full object-contain pointer-events-none"
            crossOrigin="anonymous"
          />

          {/* Dark Overlay Outside Crop Area */}
          <div
            className="absolute inset-0 bg-slate-950/70 pointer-events-none"
            style={{
              clipPath: `polygon(
                0% 0%, 0% 100%, 
                ${cropBox.x}% 100%, 
                ${cropBox.x}% ${cropBox.y}%, 
                ${cropBox.x + cropBox.width}% ${cropBox.y}%, 
                ${cropBox.x + cropBox.width}% ${cropBox.y + cropBox.height}%, 
                ${cropBox.x}% ${cropBox.y + cropBox.height}%, 
                ${cropBox.x}% 100%, 
                100% 100%, 100% 0%
              )`
            }}
          />

          {/* Active Crop Box */}
          <div
            className="absolute border-2 border-cyan-400 rounded-lg shadow-[0_0_18px_rgba(34,211,238,0.35)] cursor-move transition-shadow"
            style={{
              left: `${cropBox.x}%`,
              top: `${cropBox.y}%`,
              width: `${cropBox.width}%`,
              height: `${cropBox.height}%`
            }}
            onMouseDown={(e) => startDrag(e, 'move')}
            onTouchStart={(e) => startDrag(e, 'move')}
          >
            {/* Rule of Thirds Guides */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-30">
              <div className="border-r border-b border-white/60"></div>
              <div className="border-r border-b border-white/60"></div>
              <div className="border-b border-white/60"></div>
              <div className="border-r border-b border-white/60"></div>
              <div className="border-r border-b border-white/60"></div>
              <div className="border-b border-white/60"></div>
              <div className="border-r border-b border-white/60"></div>
              <div className="border-r border-b border-white/60"></div>
              <div></div>
            </div>

            {/* Centered Move Badge */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-2 rounded-xl bg-slate-950/85 border border-cyan-500/40 text-cyan-300 pointer-events-none backdrop-blur-sm opacity-85 group-hover:opacity-100 flex items-center gap-1.5 text-[11px] font-semibold">
              <Move className="w-3.5 h-3.5" />
              <span>Arrastra para mover encuadre</span>
            </div>

            {/* Corner Resize Handles */}
            <div
              className="absolute -top-2.5 -left-2.5 w-6 h-6 bg-cyan-400 border-2 border-slate-950 rounded-full cursor-nwse-resize shadow hover:scale-125 transition-transform"
              onMouseDown={(e) => startDrag(e, 'nw')}
              onTouchStart={(e) => startDrag(e, 'nw')}
            />
            <div
              className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-cyan-400 border-2 border-slate-950 rounded-full cursor-nesw-resize shadow hover:scale-125 transition-transform"
              onMouseDown={(e) => startDrag(e, 'ne')}
              onTouchStart={(e) => startDrag(e, 'ne')}
            />
            <div
              className="absolute -bottom-2.5 -left-2.5 w-6 h-6 bg-cyan-400 border-2 border-slate-950 rounded-full cursor-nesw-resize shadow hover:scale-125 transition-transform"
              onMouseDown={(e) => startDrag(e, 'sw')}
              onTouchStart={(e) => startDrag(e, 'sw')}
            />
            <div
              className="absolute -bottom-2.5 -right-2.5 w-6 h-6 bg-cyan-400 border-2 border-slate-950 rounded-full cursor-nwse-resize shadow hover:scale-125 transition-transform"
              onMouseDown={(e) => startDrag(e, 'se')}
              onTouchStart={(e) => startDrag(e, 'se')}
            />
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={handleResetCrop}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restablecer Área</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs hover:bg-slate-800 transition cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleApplyCrop}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 transition cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Confirmar Recorte y Analizar Laplace</span>
          </button>
        </div>
      </div>
    </div>
  );
};
