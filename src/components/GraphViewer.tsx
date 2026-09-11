'use client';

import React, { useState, useMemo } from 'react';
import { GraphConfig, GraphKeyPoint } from '@/lib/types';
import { LineChart, ZoomIn, ZoomOut, RotateCcw, Info, Eye, Layers } from 'lucide-react';

interface GraphViewerProps {
  config?: GraphConfig;
}

export const GraphViewer: React.FC<GraphViewerProps> = ({ config }) => {
  // Graph viewport state (scale and center)
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredPoint, setHoveredPoint] = useState<GraphKeyPoint | null>(null);
  const [showRoots, setShowRoots] = useState(true);
  const [showVertex, setShowVertex] = useState(true);
  const [showSymmetry, setShowSymmetry] = useState(true);

  if (!config) {
    return null;
  }

  // Canvas / SVG Dimensions
  const svgWidth = 720;
  const svgHeight = 400;
  const padding = 50;

  // Compute zoomed bounds
  const xSpan = (config.xMax - config.xMin) / zoomLevel;
  const ySpan = (config.yMax - config.yMin) / zoomLevel;
  const xCenter = (config.xMax + config.xMin) / 2;
  const yCenter = (config.yMax + config.yMin) / 2;

  const currentXMin = xCenter - xSpan / 2;
  const currentXMax = xCenter + xSpan / 2;
  const currentYMin = yCenter - ySpan / 2;
  const currentYMax = yCenter + ySpan / 2;

  // Coordinate transforms (math space -> SVG pixels)
  const mathToSvgX = (x: number): number => {
    return padding + ((x - currentXMin) / (currentXMax - currentXMin)) * (svgWidth - 2 * padding);
  };

  const mathToSvgY = (y: number): number => {
    return svgHeight - padding - ((y - currentYMin) / (currentYMax - currentYMin)) * (svgHeight - 2 * padding);
  };

  // Safe function evaluation that works even after JSON deserialization from sessionStorage/API
  const evaluateFunction = (x: number): number => {
    if (typeof config.evaluateAt === 'function') {
      try {
        return config.evaluateAt(x);
      } catch {
        // Fallback to algebraic evaluation
      }
    }

    if (config.type === 'quadratic' || typeof config.c === 'number') {
      const a = typeof config.a === 'number' ? config.a : 1;
      const b = typeof config.b === 'number' ? config.b : 0;
      const c = typeof config.c === 'number' ? config.c : 0;
      return a * x * x + b * x + c;
    }

    if (config.type === 'linear') {
      const a = typeof config.a === 'number' ? config.a : 1;
      const b = typeof config.b === 'number' ? config.b : 0;
      return a * x + b;
    }

    if (config.type === 'system') {
      return 7 - 2 * x;
    }

    return 0;
  };

  // Generate curve path points
  const pathD = useMemo(() => {
    const pointsCount = 180;
    const step = (currentXMax - currentXMin) / pointsCount;
    let d = '';

    for (let i = 0; i <= pointsCount; i++) {
      const x = currentXMin + i * step;
      const y = evaluateFunction(x);

      // Clamp y within bounds to prevent SVG explosion
      const clampedY = Math.max(currentYMin - 20, Math.min(currentYMax + 20, y));
      const px = mathToSvgX(x);
      const py = mathToSvgY(clampedY);

      if (i === 0) {
        d += `M ${px.toFixed(1)} ${py.toFixed(1)}`;
      } else {
        d += ` L ${px.toFixed(1)} ${py.toFixed(1)}`;
      }
    }
    return d;
  }, [currentXMin, currentXMax, currentYMin, currentYMax, config]);

  // Compute Grid lines
  const gridLines = useMemo(() => {
    const lines: { type: 'x' | 'y'; val: number; svgCoord: number }[] = [];
    const xStep = Math.max(1, Math.round((currentXMax - currentXMin) / 8));
    const yStep = Math.max(1, Math.round((currentYMax - currentYMin) / 6));

    for (let x = Math.ceil(currentXMin); x <= Math.floor(currentXMax); x += xStep) {
      if (x !== 0) lines.push({ type: 'x', val: x, svgCoord: mathToSvgX(x) });
    }
    for (let y = Math.ceil(currentYMin); y <= Math.floor(currentYMax); y += yStep) {
      if (y !== 0) lines.push({ type: 'y', val: y, svgCoord: mathToSvgY(y) });
    }
    return lines;
  }, [currentXMin, currentXMax, currentYMin, currentYMax]);

  const originX = mathToSvgX(0);
  const originY = mathToSvgY(0);

  return (
    <div className="rounded-3xl bg-slate-900/90 border border-slate-800/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
      {/* Header & Graph Function */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-400">
            <LineChart className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Representación Gráfica de la Curva
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/10 text-teal-300 border border-teal-500/30">
                Plano Cartesiano 2D
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Función: <strong className="text-emerald-300 font-mono">{config.functionExpression}</strong>
            </p>
          </div>
        </div>

        {/* View Controls & Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoomLevel((z) => Math.min(2.5, z * 1.25))}
            title="Acercar Zoom"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.6, z / 1.25))}
            title="Alejar Zoom"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            title="Restablecer Vista"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SVG Canvas Coordinate Plane */}
      <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-2 sm:p-4 overflow-hidden shadow-inner flex items-center justify-center">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto max-h-[440px] select-none"
        >
          <defs>
            {/* Grid Pattern */}
            <linearGradient id="curveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>

            <filter id="pointGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid Lines */}
          {gridLines.map((line, idx) =>
            line.type === 'x' ? (
              <g key={`gx_${idx}`}>
                <line
                  x1={line.svgCoord}
                  y1={padding}
                  x2={line.svgCoord}
                  y2={svgHeight - padding}
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <text
                  x={line.svgCoord}
                  y={Math.min(svgHeight - 20, Math.max(padding + 12, originY + 14))}
                  fill="#64748b"
                  fontSize="10"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {line.val}
                </text>
              </g>
            ) : (
              <g key={`gy_${idx}`}>
                <line
                  x1={padding}
                  y1={line.svgCoord}
                  x2={svgWidth - padding}
                  y2={line.svgCoord}
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <text
                  x={Math.max(25, Math.min(svgWidth - 25, originX - 10))}
                  y={line.svgCoord + 3}
                  fill="#64748b"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {line.val}
                </text>
              </g>
            )
          )}

          {/* Main X Axis (y = 0) */}
          <line
            x1={padding}
            y1={originY}
            x2={svgWidth - padding}
            y2={originY}
            stroke="#475569"
            strokeWidth="2"
          />
          <text
            x={svgWidth - padding + 15}
            y={originY + 4}
            fill="#94a3b8"
            fontSize="12"
            fontWeight="bold"
          >
            X
          </text>

          {/* Main Y Axis (x = 0) */}
          <line
            x1={originX}
            y1={padding}
            x2={originX}
            y2={svgHeight - padding}
            stroke="#475569"
            strokeWidth="2"
          />
          <text
            x={originX}
            y={padding - 10}
            fill="#94a3b8"
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
          >
            Y
          </text>

          {/* Axis of Symmetry (for quadratic) */}
          {showSymmetry && config.axisOfSymmetry !== undefined && (
            <line
              x1={mathToSvgX(config.axisOfSymmetry)}
              y1={padding}
              x2={mathToSvgX(config.axisOfSymmetry)}
              y2={svgHeight - padding}
              stroke="#0284c7"
              strokeWidth="1.5"
              strokeDasharray="4,3"
              opacity="0.6"
            />
          )}

          {/* Plotted Function Curve */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#curveGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="drop-shadow(0 0 6px rgba(52,211,153,0.3))"
          />

          {/* Key Points Markers */}
          {config.keyPoints.map((pt) => {
            if (pt.type === 'root' && !showRoots) return null;
            if (pt.type === 'vertex' && !showVertex) return null;

            const px = mathToSvgX(pt.x);
            const py = mathToSvgY(pt.y);

            // Hide point if it falls outside view
            if (px < padding || px > svgWidth - padding || py < padding || py > svgHeight - padding) {
              return null;
            }

            const isHovered = hoveredPoint?.id === pt.id;

            return (
              <g
                key={pt.id}
                className="cursor-pointer transition-transform"
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Outer halo */}
                <circle
                  cx={px}
                  cy={py}
                  r={isHovered ? 12 : 8}
                  fill={pt.color}
                  opacity={isHovered ? 0.4 : 0.2}
                  className="animate-pulse"
                />

                {/* Core dot */}
                <circle
                  cx={px}
                  cy={py}
                  r={isHovered ? 6 : 5}
                  fill={pt.color}
                  stroke="#020617"
                  strokeWidth="2"
                  filter="url(#pointGlow)"
                />

                {/* Point Label Badge */}
                <g transform={`translate(${px}, ${py - 14})`}>
                  <rect
                    x="-35"
                    y="-16"
                    width="70"
                    height="18"
                    rx="4"
                    fill="#090d16"
                    stroke={pt.color}
                    strokeWidth="1"
                    opacity="0.9"
                  />
                  <text
                    x="0"
                    y="-4"
                    fill="#f8fafc"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    ({pt.x.toFixed(1)}, {pt.y.toFixed(1)})
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip info on hover */}
        {hoveredPoint && (
          <div className="absolute top-4 left-4 p-3 rounded-xl bg-slate-900/95 border border-slate-700 text-xs shadow-2xl backdrop-blur-md max-w-xs animate-fade-in">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hoveredPoint.color }}></span>
              <strong className="text-white font-bold">{hoveredPoint.label}</strong>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {hoveredPoint.description}
            </p>
          </div>
        )}
      </div>

      {/* Key Points Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
        {config.keyPoints.map((pt) => (
          <div
            key={pt.id}
            onMouseEnter={() => setHoveredPoint(pt)}
            onMouseLeave={() => setHoveredPoint(null)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              hoveredPoint?.id === pt.id
                ? 'bg-slate-800 border-emerald-400 scale-[1.02]'
                : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {pt.type === 'root' ? 'Raíz / Corte X' : pt.type === 'vertex' ? 'Vértice' : 'Intersección'}
              </span>
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pt.color }}></span>
            </div>

            <p className="text-sm font-bold text-white font-mono">
              ({pt.x.toFixed(2)}, {pt.y.toFixed(2)})
            </p>

            <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
              {pt.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
