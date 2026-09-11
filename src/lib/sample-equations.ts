import { SampleBlackboard, EquationSolution } from './types';
import { solveTransferFunction, solveInverseLaplace, solveDirectLaplace } from './laplace-solver';

export const SAMPLE_EQUATIONS: SampleBlackboard[] = [
  {
    id: 'circuito_rlc',
    title: 'Circuito RLC Integro-Diferencial',
    subtitle: 'v(t) = L di/dt + R i + (1/C) ∫ i dt',
    latex: 'v(t) = L \\frac{di(t)}{dt} + R i(t) + \\frac{1}{C} \\int_{0}^{t} i(t) \\, dt',
    calculationMode: 'transfer_function',
    equationType: 'Circuito Eléctrico RLC',
    imagePath: '/samples/cuaderno-rlc.jpg',
    badge: 'RLC Serie',
    stabilityStatus: 'stable'
  },
  {
    id: 'tf_subamortiguado',
    title: 'Función de Transferencia 2° Orden',
    subtitle: 'G(s) = 25 / (s² + 4s + 25)',
    latex: 'G(s) = \\frac{25}{s^2 + 4s + 25}',
    calculationMode: 'transfer_function',
    equationType: 'Sistema Subamortiguado',
    imagePath: '/samples/pizarron-rlc.svg',
    badge: 'Estable (ζ = 0.4)',
    stabilityStatus: 'stable'
  },
  {
    id: 'laplace_inversa',
    title: 'Transformada Inversa Fracciones Parciales',
    subtitle: 'F(s) = (3s + 5) / ((s+1)(s+2))',
    latex: 'F(s) = \\frac{3s + 5}{(s+1)(s+2)}',
    calculationMode: 'inverse',
    equationType: 'Antitransformada ℒ⁻¹',
    imagePath: '/samples/pizarron-cuadratica.svg',
    badge: 'Heaviside',
    stabilityStatus: 'stable'
  },
  {
    id: 'laplace_directa',
    title: 'Transformada Directa con Traslación',
    subtitle: 'f(t) = 4e⁻²ᵗ sen(3t) + 2t²',
    latex: 'f(t) = 4e^{-2t}\\sin(3t) + 2t^2',
    calculationMode: 'direct',
    equationType: 'Transformada Directa ℒ',
    imagePath: '/samples/pizarron-lineal.svg',
    badge: '1er Teorema',
    stabilityStatus: 'stable'
  },
  {
    id: 'tf_inestable',
    title: 'Sistema Dinámico Inestable (RHP)',
    subtitle: 'G(s) = 10 / (s² - 2s + 10)',
    latex: 'G(s) = \\frac{10}{s^2 - 2s + 10}',
    calculationMode: 'transfer_function',
    equationType: 'Plano s Derecho',
    imagePath: '/samples/pizarron-factorizacion.svg',
    badge: 'Inestable (Re > 0)',
    stabilityStatus: 'unstable'
  },
  {
    id: 'tf_marginal',
    title: 'Sistema Marginalmente Estable',
    subtitle: 'G(s) = 9 / (s² + 9)',
    latex: 'G(s) = \\frac{9}{s^2 + 9}',
    calculationMode: 'transfer_function',
    equationType: 'Oscilador Puro (jω)',
    imagePath: '/samples/pizarron-sistema.svg',
    badge: 'Marginal (Re = 0)',
    stabilityStatus: 'marginal'
  }
];

export function getSampleSolution(sampleId: string): EquationSolution {
  switch (sampleId) {
    case 'circuito_rlc': {
      const sol = solveTransferFunction(1, 1, 10, 25, '/samples/pizarron-rlc.svg', 'sample', 'G(s) = \\frac{s}{s^2 + 10s + 25}');
      sol.timeDomainLatex = '= L \\frac{di(t)}{dt} + R i(t) + \\frac{1}{C} \\int_{0}^{t} i(t) \\, dt, \\quad R=10\\Omega, \\; L=1H, \\; C=0.04F';
      sol.equationType = 'Circuito RLC Integro-Diferencial';
      return sol;
    }
    case 'laplace_inversa':
      return solveInverseLaplace('3s + 5', -1, -2, '/samples/pizarron-cuadratica.svg', 'sample');
    case 'laplace_directa':
      return solveDirectLaplace('f(t) = 4e^{-2t}\\sin(3t) + 2t^2', '/samples/pizarron-lineal.svg', 'sample');
    case 'tf_inestable':
      return solveTransferFunction(10, 1, -2, 10, '/samples/pizarron-factorizacion.svg', 'sample', 'G(s) = \\frac{10}{s^2 - 2s + 10}');
    case 'tf_marginal':
      return solveTransferFunction(9, 1, 0, 9, '/samples/pizarron-sistema.svg', 'sample', 'G(s) = \\frac{9}{s^2 + 9}');
    case 'tf_subamortiguado':
    default:
      return solveTransferFunction(25, 1, 4, 25, '/samples/pizarron-rlc.svg', 'sample', 'G(s) = \\frac{25}{s^2 + 4s + 25}');
  }
}
