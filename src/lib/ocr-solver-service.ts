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
    onPhaseChange?.('solving_math', 85);
    await new Promise(r => setTimeout(r, 250));

    const domain = validateLaplaceDomain(manualLatex);
    const solution = parseAndSolveLaplace(
      manualLatex,
      imageBase64 || '/samples/pizarron-rlc.svg',
      calculationMode,
      imageBase64 ? 'upload' : 'sample'
    );
    solution.domainValidation = domain;
    solution.timeDomainLatex = manualLatex;
    solution.frequencyDomainLatex = solution.detectedLatex;
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
      if (err instanceof NeedsInputError) {
        throw err;
      }
      const msg = err instanceof Error ? err.message : 'No se pudo interpretar la fórmula en la imagen recortada. Por favor reajusta el recuadro';
      throw new Error(msg);
    }
  }

  throw new Error('No se ha proporcionado ninguna imagen ni fórmula para procesar.');
}
