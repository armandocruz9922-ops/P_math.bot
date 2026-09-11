export interface PedagogicalExplanation {
  whyWeDoThis: string;
  intuitiveConcept: string;
  commonMistakes: string[];
  keyTakeaway: string;
  exampleSnippet?: string;
}

export interface EquationStep {
  stepNumber: number;
  title: string;
  description: string;
  mathExpression: string; // KaTeX / LaTeX string
  ruleApplied?: string;
  highlightNote?: string;
  explanation?: PedagogicalExplanation;
}

export interface VerificationStep {
  title: string;
  description: string;
  substitutionMath: string;
  evaluationMath: string;
  isSatisfied: boolean;
}

export interface EquationVerification {
  originalFormula: string;
  testedValues: { variable: string; value: string }[];
  steps: VerificationStep[];
  conclusion: string;
  isValid: boolean;
}

export interface GraphKeyPoint {
  id: string;
  label: string;
  x: number;
  y: number;
  type: 'root' | 'vertex' | 'intercept' | 'intersection';
  color: string;
  description: string;
}

export interface GraphConfig {
  type: 'quadratic' | 'linear' | 'system' | 'custom';
  functionExpression: string; // e.g. "f(x) = 2x^2 + 5x - 3"
  latexExpression: string;
  a?: number;
  b?: number;
  c?: number;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  keyPoints: GraphKeyPoint[];
  axisOfSymmetry?: number;
  evaluateAt?: (x: number) => number;
}

export interface EquationSolution {
  id: string;
  originalImage: string; // Base64 data URL or sample image path
  croppedImage?: string;
  detectedLatex: string;
  confidenceScore: number; // e.g. 0.98 (98%)
  equationType: string;    // e.g. "Ecuación Cuadrática", "Ecuación Lineal"
  methodUsed: string;      // e.g. "Fórmula General de Bhaskara", "Despeje Algebraico"
  steps: EquationStep[];
  finalSolutions: string[]; // e.g. ["x_1 = \\frac{1}{2}", "x_2 = -3"]
  verification: EquationVerification;
  graphConfig?: GraphConfig;
  sourceType: 'upload' | 'camera' | 'sample';
  timestamp: string;
}

export interface HistoryEntry {
  id: string;
  timestamp: string;
  detectedLatex: string;
  equationType: string;
  thumbnail: string;
  solutions: string[];
  solution: EquationSolution;
}

export type ProcessingPhase = 
  | 'idle'
  | 'uploading'
  | 'scanning_board'
  | 'extracting_ocr'
  | 'solving_math'
  | 'verifying_proof'
  | 'completed'
  | 'error';

export interface SampleBlackboard {
  id: string;
  title: string;
  subtitle: string;
  latex: string;
  equationType: string;
  imagePath: string;
  badge: string;
}
