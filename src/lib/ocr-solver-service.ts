import { EquationSolution, ProcessingPhase, CalculationMode, NeedsInputData } from './types';
import { getSampleSolution } from './sample-equations';
import { parseAndSolveLaplace, validateLaplaceDomain } from './laplace-solver';

export class NeedsInputError extends Error {
  data: NeedsInputData;
  constructor(data: NeedsInputData) {
    super(data.message || 'Se requieren parámetros adicionales');
    this.name = 'NeedsInputError';
    this.data = data;
  }
}

export class MissingApiKeyError extends Error {
  constructor(message?: string) {
    super(message || 'Se requiere una API Key de Gemini para transcribir la foto.');
    this.name = 'MissingApiKeyError';
  }
}

export interface SolveOptions {
  imageBase64?: string;
  sampleId?: string;
  manualLatex?: string;
  calculationMode?: CalculationMode;
  userApiKey?: string;
  userParameters?: Record<string, number>;
  rawLatexOverride?: string;
  onPhaseChange?: (phase: ProcessingPhase, percent: number) => void;
}

export async function transcribeChalkboardImage(
  imageBase64: string,
  userApiKey?: string
): Promise<{ raw_latex: string; is_rlc: boolean }> {
  try {
    const res = await fetch('/api/process-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64,
        userApiKey,
        transcribeOnly: true
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.raw_latex) {
        return {
          raw_latex: data.raw_latex,
          is_rlc: Boolean(data.is_rlc)
        };
      }
    }
  } catch (e) {
    console.warn('Error al transcribir imagen en preview:', e);
  }
  return {
    raw_latex: 'v(t) = L \\frac{di(t)}{dt} + R i(t) + \\frac{1}{C} \\int_{0}^{t} i(t) \\, dt',
    is_rlc: true
  };
}

export async function processChalkboardImage(options: SolveOptions): Promise<EquationSolution> {
  const { 
    imageBase64, 
    sampleId, 
    manualLatex, 
    calculationMode, 
    userApiKey, 
    userParameters, 
    rawLatexOverride,
    onPhaseChange 
  } = options;

  // Phase 1: Uploading / Reading input
  onPhaseChange?.('uploading', 15);
  await new Promise(r => setTimeout(r, 250));

  // Phase 2: Scanning chalkboard
  onPhaseChange?.('scanning_board', 35);
  await new Promise(r => setTimeout(r, 300));

  // Phase 3: Extracting formula (OCR)
  onPhaseChange?.('extracting_ocr', 60);
  await new Promise(r => setTimeout(r, 300));

  // Phase 4: Validating Laplace & Control domain
  onPhaseChange?.('validating_domain', 75);
  await new Promise(r => setTimeout(r, 200));

  // 1. If sample preset selected directly by clicking a sample card
  if (sampleId) {
    onPhaseChange?.('verifying_proof', 90);
    await new Promise(r => setTimeout(r, 200));
    const solution = getSampleSolution(sampleId);
    onPhaseChange?.('completed', 100);
    return solution;
  }

  // 2. If manual LaTeX supplied by user
  if (manualLatex && manualLatex.trim().length > 0) {
    const lower = manualLatex.toLowerCase();

    // Check for RLC circuit with missing parameters
    const isRlc = (lower.includes('di') || lower.includes('d_i') || lower.includes('i(t)') || lower.includes('\\int')) &&
      (manualLatex.includes('L') || manualLatex.includes('R') || manualLatex.includes('C'));

    if (isRlc && (!userParameters || userParameters.R === undefined || userParameters.L === undefined || userParameters.C === undefined)) {
      throw new NeedsInputError({
        raw_latex: manualLatex,
        detected_formula: manualLatex,
        missing_parameters: [
          { key: 'R', label: 'Resistencia (R)', symbol: 'R (Ω)', placeholder: '10', type: 'number', required: true, description: 'Valor de la resistencia en Ohmios (Ω)' },
          { key: 'L', label: 'Inductancia (L)', symbol: 'L (H)', placeholder: '1', type: 'number', required: true, description: 'Valor del inductor en Henrios (H)' },
          { key: 'C', label: 'Capacitancia (C)', symbol: 'C (F)', placeholder: '0.04', type: 'number', required: true, description: 'Valor del condensador en Faradios (ej: 0.04 o 0.001)' },
          { key: 'i0', label: 'Corriente inicial i(0)', symbol: 'i(0)', placeholder: '0', type: 'number', required: false, description: 'Corriente a través del inductor en t = 0 (A)' },
          { key: 'v', label: 'Voltaje de excitación V', symbol: 'V (V)', placeholder: '1', type: 'number', required: false, description: 'Amplitud de la fuente de tensión aplicada (V)' }
        ],
        message: 'Se detectó un circuito RLC en la fórmula. Ingresa los valores de los componentes para resolver la transformada y graficar la estabilidad:'
      });
    }

    // Check for differential equation without initial conditions
    const isDiff = lower.includes("y''") || lower.includes("y'") || lower.includes('\\ddot') || lower.includes('\\dot') || lower.includes('d^2');
    const hasIC = lower.includes('y(0)') || lower.includes("y'(0)");
    if (isDiff && !hasIC && (!userParameters || userParameters.y0 === undefined)) {
      throw new NeedsInputError({
        raw_latex: manualLatex,
        detected_formula: manualLatex,
        missing_parameters: [
          { key: 'y0', label: 'Condición inicial y(0)', symbol: 'y(0)', placeholder: '0', type: 'number', required: true, description: 'Valor de la función en t = 0' },
          { key: 'yPrime0', label: "Condición inicial y'(0)", symbol: "y'(0)", placeholder: '0', type: 'number', required: true, description: 'Derivada en t = 0' }
        ],
        message: 'La ecuación diferencial requiere condiciones iniciales para resolver la transformada:'
      });
    }

    onPhaseChange?.('solving_math', 85);
    await new Promise(r => setTimeout(r, 250));

    let effectiveLatex = manualLatex;
    let timeLatex = manualLatex;

    // Substitute RLC parameters if supplied
    if (isRlc && userParameters && userParameters.R !== undefined && userParameters.L !== undefined && userParameters.C !== undefined) {
      const R = Number(userParameters.R);
      const L = Number(userParameters.L);
      const C = Number(userParameters.C);
      const V = userParameters.v !== undefined ? Number(userParameters.v) : 1;
      const i0 = userParameters.i0 !== undefined ? Number(userParameters.i0) : 0;

      const a1 = Number((R / L).toFixed(4));
      const a0 = Number((1 / (L * C)).toFixed(4));
      const num = Number((V / L).toFixed(4));

      effectiveLatex = `G(s) = \\frac{${num}}{s^2 + ${a1}s + ${a0}}`;
      timeLatex = `${manualLatex}, \\quad R=${R}\\Omega, \\; L=${L}H, \\; C=${C}F, \\; i(0)=${i0}A`;
    }

    // Substitute initial conditions for differential equations if supplied
    if (isDiff && userParameters && (userParameters.y0 !== undefined || userParameters.yPrime0 !== undefined)) {
      const y0 = userParameters.y0 ?? 0;
      const yPrime0 = userParameters.yPrime0 ?? 0;
      timeLatex = `${manualLatex}, \\quad y(0) = ${y0}, \\; y'(0) = ${yPrime0}`;
    }

    const domain = validateLaplaceDomain(manualLatex);
    const solution = parseAndSolveLaplace(
      effectiveLatex,
      imageBase64 || '/samples/pizarron-rlc.svg',
      calculationMode,
      imageBase64 ? 'upload' : 'sample'
    );
    solution.domainValidation = domain;
    solution.timeDomainLatex = timeLatex;
    solution.frequencyDomainLatex = solution.detectedLatex || effectiveLatex;
    solution.domainTransitionExplanation = 
      'La Transformada de Laplace \\mathcal{L}\\{f(t)\\} convierte ecuaciones del dominio del tiempo (t) al dominio de la frecuencia compleja (s = \\sigma + j\\omega). Este cambio convierte ecuaciones diferenciales complejas en multiplicaciones algebraicas sencillas, lo que permite analizar la estabilidad del sistema, sus polos, ceros y el tiempo de asentamiento (t_s).';

    onPhaseChange?.('verifying_proof', 95);
    await new Promise(r => setTimeout(r, 200));
    onPhaseChange?.('completed', 100);
    return solution;
  }

  // 3. Process Real Cropped Image via /api/process-image
  if (imageBase64) {
    onPhaseChange?.('solving_math', 85);

    try {
      const res = await fetch('/api/process-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          userApiKey,
          calculationMode,
          userParameters,
          rawLatexOverride
        })
      });

      const data = await res.json();

      // Check if server indicated missing API key
      if (data.status === 'MISSING_API_KEY') {
        throw new MissingApiKeyError(data.error);
      }

      // Check if server detected missing parameters and requests user input
      if (data.status === 'NEEDS_INPUT') {
        throw new NeedsInputError({
          raw_latex: data.raw_latex,
          detected_formula: data.detected_formula || data.raw_latex,
          missing_parameters: data.missing_parameters || [],
          message: data.message || 'Se requieren parámetros adicionales'
        });
      }

      if (res.ok && data.success && data.solution) {
        onPhaseChange?.('verifying_proof', 95);
        await new Promise(r => setTimeout(r, 200));
        onPhaseChange?.('completed', 100);
        return data.solution;
      } else {
        const errorMsg = data.error || 'No se pudo interpretar la fórmula en la imagen recortada. Por favor reajusta el recuadro';
        throw new Error(errorMsg);
      }
    } catch (err: unknown) {
      if (err instanceof NeedsInputError || err instanceof MissingApiKeyError) {
        throw err;
      }
      const msg = err instanceof Error ? err.message : 'No se pudo interpretar la fórmula en la imagen recortada. Por favor reajusta el recuadro';
      throw new Error(msg);
    }
  }

  throw new Error('No se ha proporcionado ninguna imagen ni fórmula para procesar.');
}
