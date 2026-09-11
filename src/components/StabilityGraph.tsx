'use client';

import React, { useState, useMemo, useRef, MouseEvent } from 'react';
import { StabilityAnalysis, TimeResponsePoint, StabilityStatus, PoleZero } from '@/lib/types';
import { 
  Activity, 
  Target, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Eye, 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  Sliders, 
  Crosshair,
  TrendingUp,
  Clock
} from 'lucide-react';

interface StabilityGraphProps {
  stabilityAnalysis: StabilityAnalysis;
}

export const StabilityGraph: React.FC<StabilityGraphProps> = ({
  stabilityAnalysis
}) => {
  const {
    status,
    statusLabel,
    statusDescription,
    poles,
    zeros,
    metrics,
    timeResponseData,
    toleranceBand2Pct,
    toleranceBand5Pct,
    settlingPoint2Pct,
    peakPoint,
    transferFunctionLatex
  } = stabilityAnalysis;

  // View mode: 'time_response' (y(t) vs t) | 's_plane' (Poles & Zeros on s-plane)
  const [activeTab, setActiveTab] = useState<'time_response' | 's_plane'>('time_response');
  // Tolerance criterion: 2% or 5%
  const [toleranceCriterion, setToleranceCriterion] = useState<2 | 5>(2);
  // Hover crosshair state
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; t: number; yt: number } | null>(null);
  // Zoom state
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  const containerRef = useRef<HTMLDivElement>(null);

  const steadyState = metrics.steadyStateValue || 1.0;
  const activeTolerance = toleranceCriterion === 2 ? toleranceBand2Pct : toleranceBand5Pct;
  const activeSettlingTime = toleranceCriterion === 2 ? metrics.settlingTime2Pct : metrics.settlingTime5Pct;

  // SVG dimensions and padding
  const svgWidth = 840;
  const svgHeight = 420;
  const padding = { top: 40, right: 50, bottom: 50, left: 65 };

  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  // Domain calculations for Time Response
  const { minT, maxT, minY, maxY } = useMemo(() => {
    if (!timeResponseData || timeResponseData.length === 0) {
      return { minT: 0, maxT: 10, minY: 0, maxY: 2 };
    }

    const tValues = timeResponseData.map(d => d.t);
    const yValues = timeResponseData.map(d => d.y);

    const maxTBase = Math.max(...tValues, 5);
    const maxTZoomed = maxTBase / zoomLevel;

    const minYBase = Math.min(0, ...yValues);
    const maxYBase = Math.max(steadyState * 1.4, ...yValues, 1.2);

    return {
      minT: 0,
      maxT: maxTZoomed,
      minY: minYBase < -0.1 ? minYBase * 1.1 : 0,
      maxY: maxYBase * 1.15
    };
  }, [timeResponseData, steadyState, zoomLevel]);

  // Coordinate scales for Time Response
  const scaleX = (t: number) => padding.left + ((t - minT) / (maxT - minT)) * plotWidth;
  const scaleY = (y: number) => padding.top + plotHeight - ((y - minY) / (maxY - minY)) * plotHeight;

  // Generate SVG path for y(t)
  const pathD = useMemo(() => {
    if (!timeResponseData || timeResponseData.length === 0) return '';
    return timeResponseData
      .filter(d => d.t <= maxT)
      .map((d, index) => {
        const x = scaleX(d.t);
        const y = scaleY(d.y);
        return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(' ');
  }, [timeResponseData, maxT, scaleX, scaleY]);

  // Tolerance band coordinates
  const bandUpperY = scaleY(activeTolerance.upper);
  const bandLowerY = scaleY(activeTolerance.lower);
  const steadyY = scaleY(steadyState);

  // Settling Point coordinates
  const settlingX = scaleX(activeSettlingTime);
  const settlingY = scaleY(settlingPoint2Pct.y || steadyState);

  // Peak Point coordinates
  const peakX = peakPoint ? scaleX(peakPoint.t) : 0;
  const peakY = peakPoint ? scaleY(peakPoint.y) : 0;

  // Handle mouse move for interactive hover crosshair
  const handleMouseMove = (e: MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current || !timeResponseData.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Convert screen coordinates to SVG viewBox units
    const svgX = (mouseX / rect.width) * svgWidth;
    const svgY = (mouseY / rect.height) * svgHeight;

    if (svgX < padding.left || svgX > svgWidth - padding.right) {
      setHoveredPoint(null);
      return;
    }

    // Find closest data point in time
    const tVal = minT + ((svgX - padding.left) / plotWidth) * (maxT - minT);
    const closest = timeResponseData.reduce((prev, curr) =>
      Math.abs(curr.t - tVal) < Math.abs(prev.t - tVal) ? curr : prev
    );

    setHoveredPoint({
      x: scaleX(closest.t),
      y: scaleY(closest.y),
      t: closest.t,
      yt: closest.y
    });
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  // Status Styling Helpers
  const statusColor = 
    status === 'stable' 
      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' 
      : status === 'marginal' 
        ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' 
        : 'text-rose-400 bg-rose-500/10 border-rose-500/30';

  const statusIcon = 
    status === 'stable' ? <ShieldCheck className="w-5 h-5 text-emerald-400" /> :
    status === 'marginal' ? <AlertTriangle className="w-5 h-5 text-amber-400" /> :
    <XCircle className="w-5 h-5 text-rose-400" />;

  // Complex s-Plane coordinate mapping
  const sPlaneSize = 420;
  const sOriginX = sPlaneSize / 2;
  const sOriginY = sPlaneSize / 2;
  const sScale = 28; // pixels per unit

  return (
    <div className="rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-2xl p-5 sm:p-7 shadow-2xl space-y-6">
      {/* 1. Header & Dynamic Stability Status Card */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shadow-inner">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Análisis de Estabilidad y Respuesta Temporal
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Visualización de la convergencia y confinamiento dentro de la franja de tolerancia
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border ${statusColor} shadow-lg font-bold text-xs`}>
          {statusIcon}
          <span>{statusLabel}</span>
        </div>
      </div>

      {/* 2. Control Metrics KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Settling Time KPI */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-slate-300">Tiempo Asentamiento</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              t_s (±{toleranceCriterion}%)
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono">
            {activeSettlingTime > 0 ? `${activeSettlingTime}s` : 'No converge'}
          </div>
          <span className="text-[10px] text-slate-500 mt-1">
            Frontera exacta de tolerancia
          </span>
        </div>

        {/* Rise Time KPI */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-slate-300">Tiempo de Subida</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
              t_r (10%-90%)
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {metrics.riseTime > 0 ? `${metrics.riseTime}s` : 'N/A'}
          </div>
          <span className="text-[10px] text-slate-500 mt-1">
            Velocidad inicial de respuesta
          </span>
        </div>

        {/* Peak Overshoot KPI */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-slate-300">Sobrepico Máximo</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20">
              M_p (%)
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
            {metrics.peakOvershootPct > 0 && metrics.peakOvershootPct < 100 ? `${metrics.peakOvershootPct}%` : '0%'}
          </div>
          <span className="text-[10px] text-slate-500 mt-1">
            {peakPoint ? `Pico en t = ${peakPoint.t}s` : 'Sin sobreoscilación'}
          </span>
        </div>

        {/* Steady State KPI */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-slate-300">Valor Estado Estable</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
              y(∞)
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-300 font-mono">
            {steadyState.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-500 mt-1">
            Ganancia en estado permanente
          </span>
        </div>
      </div>

      {/* 3. Graph Tabs & Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('time_response')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition cursor-pointer ${
              activeTab === 'time_response'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Respuesta Temporal y(t) y Tiempo de Asentamiento</span>
          </button>

          <button
            onClick={() => setActiveTab('s_plane')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition cursor-pointer ${
              activeTab === 's_plane'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Crosshair className="w-4 h-4" />
            <span>Mapa de Polos y Ceros (Plano s)</span>
          </button>
        </div>

        {/* Secondary Controls: Criterion & Zoom */}
        {activeTab === 'time_response' && (
          <div className="flex items-center gap-2 text-xs">
            {/* 2% vs 5% Tolerance selector */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase px-1 font-bold">Banda:</span>
              <button
                onClick={() => setToleranceCriterion(2)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  toleranceCriterion === 2 ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400'
                }`}
              >
                ±2%
              </button>
              <button
                onClick={() => setToleranceCriterion(5)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  toleranceCriterion === 5 ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400'
                }`}
              >
                ±5%
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
              <button
                onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.3))}
                title="Acercar tiempo"
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel(prev => Math.max(0.6, prev - 0.3))}
                title="Alejar tiempo"
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel(1.0)}
                title="Restablecer zoom"
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Main Interactive Canvas Viewport */}
      {activeTab === 'time_response' ? (
        <div ref={containerRef} className="relative rounded-2xl bg-slate-950 border border-slate-800 p-2 sm:p-4 shadow-inner overflow-hidden select-none">
          {/* Informative Legend Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-cyan-400 rounded-full inline-block"></span>
                <span className="text-cyan-300 font-semibold">y(t) Respuesta</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-b-2 border-dashed border-emerald-400/80 inline-block"></span>
                <span>Banda ±{toleranceCriterion}% [{activeTolerance.lower.toFixed(2)}, {activeTolerance.upper.toFixed(2)}]</span>
              </span>
              {status === 'stable' && activeSettlingTime > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 ring-4 ring-cyan-500/30 inline-block animate-pulse"></span>
                  <span className="text-cyan-300 font-bold">t_s = {activeSettlingTime}s</span>
                </span>
              )}
            </div>

            <span className="text-[10px] text-slate-500">
              Desplaza el cursor sobre la gráfica para inspeccionar puntos
            </span>
          </div>

          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto max-h-[460px] overflow-visible"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              {/* Tolerance Band Corridor Gradient */}
              <linearGradient id="toleranceCorridor" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
                <stop offset="50%" stopColor="#10b981" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.12" />
              </linearGradient>

              {/* Curve Glow Filter */}
              <filter id="glowCyan" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#22d3ee" floodOpacity="0.6" />
              </filter>
            </defs>

            {/* Grid lines (Time Axis & Amplitude Axis) */}
            {[0, 0.25, 0.5, 0.75, 1.0].map((frac, i) => {
              const yVal = minY + frac * (maxY - minY);
              const yPos = scaleY(yVal);
              return (
                <g key={`grid-y-${i}`}>
                  <line
                    x1={padding.left}
                    y1={yPos}
                    x2={svgWidth - padding.right}
                    y2={yPos}
                    stroke="#1e293b"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padding.left - 10}
                    y={yPos + 4}
                    textAnchor="end"
                    fill="#64748b"
                    fontSize="11"
                    fontFamily="monospace"
                  >
                    {yVal.toFixed(2)}
                  </text>
                </g>
              );
            })}

            {/* Time Grid Ticks */}
            {[0, 0.25, 0.5, 0.75, 1.0].map((frac, i) => {
              const tVal = minT + frac * (maxT - minT);
              const xPos = scaleX(tVal);
              return (
                <g key={`grid-x-${i}`}>
                  <line
                    x1={xPos}
                    y1={padding.top}
                    x2={xPos}
                    y2={svgHeight - padding.bottom}
                    stroke="#1e293b"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={xPos}
                    y={svgHeight - padding.bottom + 20}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="11"
                    fontFamily="monospace"
                  >
                    {tVal.toFixed(1)}s
                  </text>
                </g>
              );
            })}

            {/* Axis Labels */}
            <text
              x={svgWidth / 2}
              y={svgHeight - 12}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="12"
              fontWeight="bold"
            >
              Tiempo t (segundos)
            </text>
            <text
              x={18}
              y={svgHeight / 2}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="12"
              fontWeight="bold"
              transform={`rotate(-90 18 ${svgHeight / 2})`}
            >
              Amplitud de Respuesta y(t)
            </text>

            {/* Tolerance Band Corridor (Shaded Rect) */}
            <rect
              x={padding.left}
              y={bandUpperY}
              width={plotWidth}
              height={Math.max(0, bandLowerY - bandUpperY)}
              fill="url(#toleranceCorridor)"
            />

            {/* Upper Tolerance Line (+2% or +5%) */}
            <line
              x1={padding.left}
              y1={bandUpperY}
              x2={svgWidth - padding.right}
              y2={bandUpperY}
              stroke="#34d399"
              strokeWidth="1.5"
              strokeDasharray="5 4"
            />
            {/* Lower Tolerance Line (-2% or -5%) */}
            <line
              x1={padding.left}
              y1={bandLowerY}
              x2={svgWidth - padding.right}
              y2={bandLowerY}
              stroke="#34d399"
              strokeWidth="1.5"
              strokeDasharray="5 4"
            />

            {/* Steady State Center Line y_ss */}
            <line
              x1={padding.left}
              y1={steadyY}
              x2={svgWidth - padding.right}
              y2={steadyY}
              stroke="#64748b"
              strokeWidth="1.2"
              strokeDasharray="2 2"
            />
            <text
              x={svgWidth - padding.right + 6}
              y={steadyY + 3}
              fill="#94a3b8"
              fontSize="10"
              fontFamily="monospace"
            >
              y_ss={steadyState.toFixed(2)}
            </text>

            {/* Curve of Step Response y(t) */}
            <path
              d={pathD}
              fill="none"
              stroke="#22d3ee"
              strokeWidth="2.8"
              filter="url(#glowCyan)"
            />

            {/* Settling Time Indicator Point (Pinpoint) */}
            {status === 'stable' && activeSettlingTime > 0 && activeSettlingTime <= maxT && (
              <g>
                {/* Vertical guideline from t axis */}
                <line
                  x1={settlingX}
                  y1={settlingY}
                  x2={settlingX}
                  y2={svgHeight - padding.bottom}
                  stroke="#38bdf8"
                  strokeWidth="1.8"
                  strokeDasharray="4 3"
                />

                {/* Glowing Aura */}
                <circle
                  cx={settlingX}
                  cy={settlingY}
                  r="12"
                  fill="#0284c7"
                  fillOpacity="0.3"
                  className="animate-ping"
                />

                {/* Highlight Circle Pin */}
                <circle
                  cx={settlingX}
                  cy={settlingY}
                  r="6"
                  fill="#38bdf8"
                  stroke="#082f49"
                  strokeWidth="2.5"
                />

                {/* Floating Settling Time Flag */}
                <g transform={`translate(${settlingX}, ${Math.max(padding.top + 15, settlingY - 26)})`}>
                  <rect
                    x="-45"
                    y="-18"
                    width="90"
                    height="24"
                    rx="6"
                    fill="#0f172a"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                  />
                  <text
                    x="0"
                    y="-2"
                    textAnchor="middle"
                    fill="#38bdf8"
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    t_s = {activeSettlingTime}s
                  </text>
                </g>
              </g>
            )}

            {/* Peak Overshoot Indicator Point */}
            {peakPoint && peakPoint.t <= maxT && (
              <g>
                <circle
                  cx={peakX}
                  cy={peakY}
                  r="5"
                  fill="#f59e0b"
                  stroke="#451a03"
                  strokeWidth="2"
                />
                <text
                  x={peakX}
                  y={peakY - 10}
                  textAnchor="middle"
                  fill="#fbbf24"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  M_p ({metrics.peakOvershootPct}%)
                </text>
              </g>
            )}

            {/* Interactive Crosshair and Inspection Tooltip on Hover */}
            {hoveredPoint && (
              <g>
                <line
                  x1={hoveredPoint.x}
                  y1={padding.top}
                  x2={hoveredPoint.x}
                  y2={svgHeight - padding.bottom}
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <line
                  x1={padding.left}
                  y1={hoveredPoint.y}
                  x2={svgWidth - padding.right}
                  y2={hoveredPoint.y}
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <circle
                  cx={hoveredPoint.x}
                  cy={hoveredPoint.y}
                  r="5"
                  fill="#ffffff"
                  stroke="#22d3ee"
                  strokeWidth="2.5"
                />

                {/* Floating tooltip box */}
                <g transform={`translate(${Math.min(svgWidth - 140, Math.max(10, hoveredPoint.x - 65))}, ${Math.max(15, hoveredPoint.y - 45)})`}>
                  <rect
                    x="0"
                    y="0"
                    width="130"
                    height="36"
                    rx="8"
                    fill="#020617"
                    stroke="#38bdf8"
                    strokeWidth="1.2"
                    fillOpacity="0.95"
                  />
                  <text x="8" y="15" fill="#94a3b8" fontSize="10">
                    t: <tspan fill="#ffffff" fontWeight="bold">{hoveredPoint.t.toFixed(2)}s</tspan>
                  </text>
                  <text x="8" y="29" fill="#94a3b8" fontSize="10">
                    y(t): <tspan fill="#38bdf8" fontWeight="bold">{hoveredPoint.yt.toFixed(3)}</tspan>
                  </text>
                </g>
              </g>
            )}
          </svg>
        </div>
      ) : (
        /* S-Plane Pole-Zero Map */
        <div className="rounded-2xl bg-slate-950 border border-slate-800 p-6 flex flex-col items-center justify-center space-y-4">
          <div className="text-center max-w-md">
            <h4 className="text-sm font-bold text-white">
              Diagrama de Polos (×) y Ceros (○) en el Plano s
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Verifica visualmente la frontera del semiplano izquierdo (Re &lt; 0) para estabilidad asintótica
            </p>
          </div>

          <div className="relative border border-slate-800 rounded-2xl bg-slate-900/60 p-4 shadow-inner">
            <svg width={sPlaneSize} height={sPlaneSize} className="overflow-visible">
              {/* Left-Half Plane (Stable Zone) */}
              <rect
                x="0"
                y="0"
                width={sOriginX}
                height={sPlaneSize}
                fill="#10b981"
                fillOpacity="0.08"
              />
              <text x="15" y="25" fill="#34d399" fontSize="11" fontWeight="bold" opacity="0.8">
                LHP: Zona Estable (Re &lt; 0)
              </text>

              {/* Right-Half Plane (Unstable Zone) */}
              <rect
                x={sOriginX}
                y="0"
                width={sOriginX}
                height={sPlaneSize}
                fill="#f43f5e"
                fillOpacity="0.08"
              />
              <text x={sPlaneSize - 165} y="25" fill="#fb7185" fontSize="11" fontWeight="bold" opacity="0.8">
                RHP: Zona Inestable (Re &gt; 0)
              </text>

              {/* Real Axis (Sigma) */}
              <line
                x1="0"
                y1={sOriginY}
                x2={sPlaneSize}
                y2={sOriginY}
                stroke="#64748b"
                strokeWidth="1.5"
              />
              <text x={sPlaneSize - 20} y={sOriginY - 8} fill="#94a3b8" fontSize="11" fontWeight="bold">
                σ
              </text>

              {/* Imaginary Axis (j Omega) */}
              <line
                x1={sOriginX}
                y1="0"
                x2={sOriginX}
                y2={sPlaneSize}
                stroke="#38bdf8"
                strokeWidth="2"
              />
              <text x={sOriginX + 8} y="15" fill="#38bdf8" fontSize="11" fontWeight="bold">
                jω
              </text>

              {/* Grid circles for constant natural frequency wn */}
              {[1, 2, 3, 4, 5].map((r, i) => (
                <circle
                  key={i}
                  cx={sOriginX}
                  cy={sOriginY}
                  r={r * sScale}
                  fill="none"
                  stroke="#334155"
                  strokeWidth="0.8"
                  strokeDasharray="2 3"
                />
              ))}

              {/* Plot Poles (X mark) */}
              {poles.map((pole, idx) => {
                const px = sOriginX + pole.real * sScale;
                const py = sOriginY - pole.imag * sScale;
                return (
                  <g key={`pole-${idx}`}>
                    <line
                      x1={px - 7}
                      y1={py - 7}
                      x2={px + 7}
                      y2={py + 7}
                      stroke={pole.real < 0 ? '#34d399' : '#f43f5e'}
                      strokeWidth="3.2"
                    />
                    <line
                      x1={px - 7}
                      y1={py + 7}
                      x2={px + 7}
                      y2={py - 7}
                      stroke={pole.real < 0 ? '#34d399' : '#f43f5e'}
                      strokeWidth="3.2"
                    />
                    <text
                      x={px + 10}
                      y={py + 4}
                      fill="#e2e8f0"
                      fontSize="11"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {pole.latex.split('=')[1] || pole.label}
                    </text>
                  </g>
                );
              })}

              {/* Plot Zeros (O mark) */}
              {zeros.map((zero, idx) => {
                const zx = sOriginX + zero.real * sScale;
                const zy = sOriginY - zero.imag * sScale;
                return (
                  <g key={`zero-${idx}`}>
                    <circle
                      cx={zx}
                      cy={zy}
                      r="6"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                    />
                    <text
                      x={zx + 10}
                      y={zy + 4}
                      fill="#38bdf8"
                      fontSize="11"
                      fontFamily="monospace"
                    >
                      {zero.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold text-sm">✕</span>
              <span>Polos en LHP (Estables)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-rose-400 font-bold text-sm">✕</span>
              <span>Polos en RHP (Inestables)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border-2 border-cyan-400 inline-block"></span>
              <span>Ceros del Sistema</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
