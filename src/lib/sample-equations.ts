import { SampleBlackboard } from './types';
import { solveQuadratic, solveLinear, solveFactoring, solveSystem2x2, solveRLCIntegroDifferential } from './local-solver';
import { EquationSolution } from './types';

export const SAMPLE_EQUATIONS: SampleBlackboard[] = [
  {
    id: 'rlc',
    title: 'Ecuación Íntegro-Diferencial RLC',
    subtitle: '= L di(t)/dt + R i(t) + 1/C ∫ i(t) dt',
    latex: 'v(t) = L \\frac{di(t)}{dt} + R i(t) + \\frac{1}{C} \\int_0^t i(\\tau) \\, d\\tau',
    equationType: 'Cálculo / Física',
    imagePath: '/samples/pizarron-rlc.svg',
    badge: 'Destacado'
  },
  {
    id: 'cuadratica',
    title: 'Ecuación Cuadrática Completa',
    subtitle: '2x² + 5x - 3 = 0',
    latex: '2x^2 + 5x - 3 = 0',
    equationType: 'Segundo Grado',
    imagePath: '/samples/pizarron-cuadratica.svg',
    badge: 'Popular'
  },
  {
    id: 'lineal',
    title: 'Ecuación Lineal con Despeje',
    subtitle: '3x - 7 = 14',
    latex: '3x - 7 = 14',
    equationType: 'Primer Grado',
    imagePath: '/samples/pizarron-lineal.svg',
    badge: 'Básico'
  },
  {
    id: 'factorizacion',
    title: 'Trinomio Factorizable',
    subtitle: 'x² - 6x + 8 = 0',
    latex: 'x^2 - 6x + 8 = 0',
    equationType: 'Factorización',
    imagePath: '/samples/pizarron-factorizacion.svg',
    badge: 'Álgebra'
  },
  {
    id: 'sistema',
    title: 'Sistema de Ecuaciones 2×2',
    subtitle: '2x + y = 7  |  x - y = 2',
    latex: '\\begin{cases} 2x + y = 7 \\\\ x - y = 2 \\end{cases}',
    equationType: 'Sistema 2x2',
    imagePath: '/samples/pizarron-sistema.svg',
    badge: 'Simultáneo'
  }
];

export function getSampleSolution(sampleId: string): EquationSolution {
  switch (sampleId) {
    case 'rlc':
      return solveRLCIntegroDifferential('/samples/pizarron-rlc.svg', 'sample');
    case 'lineal':
      return solveLinear(3, -7, 14, '/samples/pizarron-lineal.svg', 'sample');
    case 'factorizacion':
      return solveFactoring('/samples/pizarron-factorizacion.svg', 'sample');
    case 'sistema':
      return solveSystem2x2('/samples/pizarron-sistema.svg', 'sample');
    case 'cuadratica':
    default:
      return solveQuadratic(2, 5, -3, '/samples/pizarron-cuadratica.svg', 'sample');
  }
}
