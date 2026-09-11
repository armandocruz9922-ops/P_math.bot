'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { EquationSolution, ProcessingPhase, HistoryEntry, EquationStep, CalculationMode } from '@/lib/types';
import { processChalkboardImage } from '@/lib/ocr-solver-service';
import { useRouter } from 'next/navigation';

interface EquationContextType {
  currentImage: string | null;
  croppedImage: string | null;
  currentSolution: EquationSolution | null;
  calculationMode: CalculationMode;
  isProcessing: boolean;
  processingPhase: ProcessingPhase;
  processingPercent: number;
  userApiKey: string;
  history: HistoryEntry[];
  isHistoryOpen: boolean;
  explainingStep: EquationStep | null;
  setCalculationMode: (mode: CalculationMode) => void;
  setUserApiKey: (key: string) => void;
  setCurrentImage: (image: string | null) => void;
  setCroppedImage: (image: string | null) => void;
  setCurrentSolution: (solution: EquationSolution | null) => void;
  setIsHistoryOpen: (open: boolean) => void;
  setExplainingStep: (step: EquationStep | null) => void;
  solveEquation: (
    imageBase64?: string, 
    sampleId?: string, 
    manualLatex?: string, 
    croppedData?: string, 
    modeOverride?: CalculationMode
  ) => Promise<boolean>;
  loadHistoryEntry: (entry: HistoryEntry) => void;
  clearHistory: () => void;
  resetState: () => void;
}

const EquationContext = createContext<EquationContextType | undefined>(undefined);

const STORAGE_SOLUTION_KEY = 'mathboard_laplace_solution';
const STORAGE_IMAGE_KEY = 'mathboard_laplace_image';
const STORAGE_CROPPED_KEY = 'mathboard_laplace_cropped_image';
const STORAGE_API_KEY = 'mathboard_user_api_key';
const STORAGE_HISTORY_KEY = 'mathboard_laplace_history';
const STORAGE_MODE_KEY = 'mathboard_laplace_mode';

export function EquationProvider({ children }: { children: ReactNode }) {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [currentSolution, setCurrentSolution] = useState<EquationSolution | null>(null);
  const [calculationMode, setCalculationMode] = useState<CalculationMode>('transfer_function');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPhase, setProcessingPhase] = useState<ProcessingPhase>('idle');
  const [processingPercent, setProcessingPercent] = useState(0);
  const [userApiKey, setUserApiKey] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [explainingStep, setExplainingStep] = useState<EquationStep | null>(null);

  const router = useRouter();

  // Load persisted state from storage
  useEffect(() => {
    try {
      const savedSol = sessionStorage.getItem(STORAGE_SOLUTION_KEY);
      const savedImg = sessionStorage.getItem(STORAGE_IMAGE_KEY);
      const savedCrop = sessionStorage.getItem(STORAGE_CROPPED_KEY);
      const savedMode = sessionStorage.getItem(STORAGE_MODE_KEY) as CalculationMode;
      const savedKey = localStorage.getItem(STORAGE_API_KEY);
      const savedHistory = localStorage.getItem(STORAGE_HISTORY_KEY);

      if (savedSol) {
        setCurrentSolution(JSON.parse(savedSol));
      }
      if (savedImg) {
        setCurrentImage(savedImg);
      }
      if (savedCrop) {
        setCroppedImage(savedCrop);
      }
      if (savedMode) {
        setCalculationMode(savedMode);
      }
      if (savedKey) {
        setUserApiKey(savedKey);
      }
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error('Error al cargar datos locales:', e);
    }
  }, []);

  const handleSetCalculationMode = (mode: CalculationMode) => {
    setCalculationMode(mode);
    try {
      sessionStorage.setItem(STORAGE_MODE_KEY, mode);
    } catch (e) {
      // Ignorable
    }
  };

  const saveApiKey = (key: string) => {
    setUserApiKey(key);
    try {
      if (key) {
        localStorage.setItem(STORAGE_API_KEY, key);
      } else {
        localStorage.removeItem(STORAGE_API_KEY);
      }
    } catch (e) {
      console.error('Error al guardar API key:', e);
    }
  };

  const addHistoryItem = (solution: EquationSolution, imgThumbnail: string) => {
    const entry: HistoryEntry = {
      id: solution.id || 'hist_' + Date.now(),
      timestamp: solution.timestamp || new Date().toISOString(),
      detectedLatex: solution.detectedLatex,
      equationType: solution.equationType,
      calculationMode: solution.calculationMode,
      stabilityStatus: solution.stabilityAnalysis?.status,
      thumbnail: imgThumbnail,
      solutions: solution.finalSolutions,
      solution
    };

    setHistory((prev) => {
      const filtered = prev.filter((p) => p.detectedLatex !== solution.detectedLatex);
      const updated = [entry, ...filtered].slice(0, 20); // Keep last 20
      try {
        localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('No se pudo guardar historial en localStorage:', e);
      }
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_HISTORY_KEY);
    } catch (e) {
      console.error('Error al borrar historial:', e);
    }
  };

  const loadHistoryEntry = (entry: HistoryEntry) => {
    setCurrentSolution(entry.solution);
    setCurrentImage(entry.thumbnail);
    if (entry.solution.calculationMode) {
      setCalculationMode(entry.solution.calculationMode);
    }
    try {
      sessionStorage.setItem(STORAGE_SOLUTION_KEY, JSON.stringify(entry.solution));
      sessionStorage.setItem(STORAGE_IMAGE_KEY, entry.thumbnail);
    } catch (e) {
      console.warn('Error al persistir item de historial:', e);
    }
    router.push('/resultado');
  };

  const solveEquation = async (
    imageBase64?: string,
    sampleId?: string,
    manualLatex?: string,
    croppedData?: string,
    modeOverride?: CalculationMode
  ): Promise<boolean> => {
    setIsProcessing(true);
    setProcessingPhase('uploading');
    setProcessingPercent(10);

    const activeImage = croppedData || imageBase64 || croppedImage || currentImage || undefined;
    const activeMode = modeOverride || calculationMode;

    try {
      const solution = await processChalkboardImage({
        imageBase64: activeImage,
        sampleId,
        manualLatex,
        calculationMode: activeMode,
        userApiKey: userApiKey.trim() || undefined,
        onPhaseChange: (phase, percent) => {
          setProcessingPhase(phase);
          setProcessingPercent(percent);
        }
      });

      if (croppedData) {
        solution.croppedImage = croppedData;
        setCroppedImage(croppedData);
      }

      setCurrentSolution(solution);
      if (activeImage) {
        setCurrentImage(activeImage);
      }

      // Add to history
      addHistoryItem(solution, activeImage || '/samples/pizarron-rlc.svg');

      // Save to sessionStorage
      try {
        sessionStorage.setItem(STORAGE_SOLUTION_KEY, JSON.stringify(solution));
        if (activeImage) {
          sessionStorage.setItem(STORAGE_IMAGE_KEY, activeImage);
        }
        if (croppedData) {
          sessionStorage.setItem(STORAGE_CROPPED_KEY, croppedData);
        }
      } catch (e) {
        console.warn('No se pudo persistir en sessionStorage:', e);
      }

      await new Promise((r) => setTimeout(r, 300));
      setIsProcessing(false);
      setProcessingPhase('idle');
      setProcessingPercent(0);

      router.push('/resultado');
      return true;
    } catch (error) {
      console.error('Error al resolver la transformada de Laplace:', error);
      setIsProcessing(false);
      setProcessingPhase('error');
      setProcessingPercent(0);
      return false;
    }
  };

  const resetState = () => {
    setCurrentImage(null);
    setCroppedImage(null);
    setCurrentSolution(null);
    setIsProcessing(false);
    setProcessingPhase('idle');
    setProcessingPercent(0);
    try {
      sessionStorage.removeItem(STORAGE_SOLUTION_KEY);
      sessionStorage.removeItem(STORAGE_IMAGE_KEY);
      sessionStorage.removeItem(STORAGE_CROPPED_KEY);
    } catch (e) {
      console.error('Error al limpiar sessionStorage:', e);
    }
  };

  return (
    <EquationContext.Provider
      value={{
        currentImage,
        croppedImage,
        currentSolution,
        calculationMode,
        isProcessing,
        processingPhase,
        processingPercent,
        userApiKey,
        history,
        isHistoryOpen,
        explainingStep,
        setCalculationMode: handleSetCalculationMode,
        setUserApiKey: saveApiKey,
        setCurrentImage,
        setCroppedImage,
        setCurrentSolution,
        setIsHistoryOpen,
        setExplainingStep,
        solveEquation,
        loadHistoryEntry,
        clearHistory,
        resetState
      }}
    >
      {children}
    </EquationContext.Provider>
  );
}

export function useEquation() {
  const context = useContext(EquationContext);
  if (!context) {
    throw new Error('useEquation debe usarse dentro de un EquationProvider');
  }
  return context;
}
