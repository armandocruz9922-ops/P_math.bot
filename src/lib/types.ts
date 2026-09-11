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
  type: 'root' | 'vertex' | 'intercept' | 'intersection' | 'settling' | 'peak';
  color: string;
  description: string;
}

export interface GraphConfig {
  type: 'quadratic' | 'linear' | 'system' | 'laplace_response' | 'custom';
  functionExpression: string;
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

// -------------------------------------------------------------
// Specialized Laplace & Control Theory Types
// -------------------------------------------------------------

export type CalculationMode = 
  | 'direct'            // L{f(t)} -> F(s)
  | 'inverse'           // L^-1{F(s)} -> f(t)
  | 'transfer_function'; // G(s) Step Response & Stability Analysis

export type StabilityStatus = 
  | 'stable'    // All poles in strict Left-Half Plane (Re < 0)
  | 'marginal'  // Simple non-repeated poles on imaginary axis (Re = 0)
  | 'unstable'; // Any pole in Right-Half Plane (Re > 0) or multiple on Re = 0

export interface PoleZero {
  real: number;
  imag: number;
  type: 'pole' | 'zero';
  label: string;
  latex: string;
}

export interface ControlMetrics {
  settlingTime2Pct: number;    // ts (2% error criterion)
  settlingTime5Pct: number;    // ts (5% error criterion)
  riseTime: number;            // tr (rise time)
  peakOvershootPct: number;    // Mp (percentage peak overshoot)
  peakTime: number;            // tp (time to peak)
  steadyStateValue: number;    // y_ss (final steady state value)
  naturalFreq?: number;        // wn (undamped natural frequency rad/s)
  dampingRatio?: number;       // zeta (damping ratio)
  dampedFreq?: number;         // wd (damped natural frequency rad/s)
}

export interface TimeResponsePoint {
  t: number;
  y: number;
}

export interface ToleranceBand {
  lower: number;
  upper: number;
  steadyState: number;
  percentage: number; // e.g. 2 or 5
}

export interface StabilityAnalysis {
  status: StabilityStatus;
  statusLabel: string;
  statusDescription: string;
  poles: PoleZero[];
  zeros: PoleZero[];
  metrics: ControlMetrics;
  timeResponseData: TimeResponsePoint[];
  toleranceBand2Pct: ToleranceBand;
  toleranceBand5Pct: ToleranceBand;
  settlingPoint2Pct: { t: number; y: number };
  peakPoint?: { t: number; y: number };
  transferFunctionLatex: string;
  characteristicPolynomialLatex: string;
  stepResponseLatex: string;
}

export interface DomainValidationResult {
  isValid: boolean;
  detectedDomain: 'laplace_direct' | 'laplace_inverse' | 'transfer_function' | 'differential' | 'invalid';
  message: string;
  suggestedCategory?: CalculationMode;
  suggestedCorrection?: string;
}

export interface AppliedProperty {
  name: string;
  formula: string;
  description: string;
}

export interface PartialFractionTerm {
  termLatex: string;
  residue: string;
  inverseLatex: string;
  method: string;
}

export interface LaplaceResult {
  timeDomainLatex: string;        // Ej: "f(t) = e^{-2t} \cos(3t)"
  frequencyDomainLatex: string;   // Ej: "F(s) = \frac{s+2}{(s+2)^2 + 9}"
  explanation: string;            // Explicación de la propiedad aplicada
}

export interface EquationSolution {
  id: string;
  originalImage: string;
  croppedImage?: string;
  detectedLatex: string;
  timeDomainLatex?: string;
  frequencyDomainLatex?: string;
  domainTransitionExplanation?: string;
  confidenceScore: number;
  equationType: string;
  methodUsed: string;
  calculationMode?: CalculationMode;
  domainValidation?: DomainValidationResult;
  appliedProperties?: AppliedProperty[];
  partialFractions?: PartialFractionTerm[];
  stabilityAnalysis?: StabilityAnalysis;
  steps: EquationStep[];
  finalSolutions: string[];
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
  calculationMode?: CalculationMode;
  stabilityStatus?: StabilityStatus;
  thumbnail: string;
  solutions: string[];
  solution: EquationSolution;
}

export interface MissingParameter {
  key: string;            // e.g. "y0", "yPrime0", "k", "omega"
  label: string;          // e.g. "Condición inicial y(0)"
  symbol: string;         // e.g. "y(0)"
  placeholder: string;    // e.g. "0"
  type: 'number' | 'text';
  required: boolean;
  description?: string;
}

export interface NeedsInputData {
  raw_latex: string;
  detected_formula: string;
  missing_parameters: MissingParameter[];
  message: string;
}

export type ProcessingPhase = 
  | 'idle'
  | 'uploading'
  | 'scanning_board'
  | 'extracting_ocr'
  | 'validating_domain'
  | 'needs_input'
  | 'solving_math'
  | 'verifying_proof'
  | 'completed'
  | 'error';

export interface SampleBlackboard {
  id: string;
  title: string;
  subtitle: string;
  latex: string;
  calculationMode: CalculationMode;
  equationType: string;
  imagePath: string;
  badge: string;
  stabilityStatus?: StabilityStatus;
}
