const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, '..', 'DOCUMENTACION_COMPLETA_PROYECTO_LAPLACE.pdf');
const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 50, bottom: 50, left: 50, right: 50 },
  bufferPages: true
});

const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

// Palette
const COLOR_PRIMARY = '#0f172a'; // Slate 900
const COLOR_CYAN = '#0284c7';    // Sky 600
const COLOR_GREEN = '#144128';   // Blackboard green
const COLOR_WOOD = '#6e4628';    // Wood frame
const COLOR_DARK = '#1e293b';    // Slate 800
const COLOR_TEXT = '#334155';    // Slate 700
const COLOR_MUTED = '#64748b';   // Slate 500
const COLOR_BG_CARD = '#f8fafc'; // Slate 50
const COLOR_LINE = '#cbd5e1';    // Slate 300

function addHeader(title, category = 'DOCUMENTO TÉCNICO DE INGENIERÍA') {
  doc.save();
  doc.fontSize(8).fillColor(COLOR_CYAN).font('Helvetica-Bold')
     .text(category.toUpperCase(), { align: 'left' });
  doc.fontSize(16).fillColor(COLOR_PRIMARY).font('Helvetica-Bold')
     .text(title, { align: 'left' });
  doc.moveDown(0.2);
  doc.strokeColor(COLOR_CYAN).lineWidth(1.5)
     .moveTo(doc.page.margins.left, doc.y)
     .lineTo(doc.page.width - doc.page.margins.right, doc.y)
     .stroke();
  doc.moveDown(0.8);
  doc.restore();
}

function addSubSection(title) {
  doc.save();
  doc.moveDown(0.5);
  doc.fontSize(12).fillColor(COLOR_WOOD).font('Helvetica-Bold')
     .text(title);
  doc.moveDown(0.3);
  doc.restore();
}

function addParagraph(text) {
  doc.save();
  doc.fontSize(9.5).fillColor(COLOR_TEXT).font('Helvetica')
     .text(text, { align: 'justify', lineGap: 3 });
  doc.moveDown(0.5);
  doc.restore();
}

function addBullet(title, desc) {
  doc.save();
  doc.fontSize(9.5).fillColor(COLOR_DARK).font('Helvetica-Bold')
     .text(`• ${title}: `, { continued: true })
     .font('Helvetica').fillColor(COLOR_TEXT)
     .text(desc, { align: 'justify', lineGap: 2 });
  doc.moveDown(0.3);
  doc.restore();
}

function addCodeBox(codeText, caption = '') {
  doc.save();
  const boxX = doc.page.margins.left;
  const boxWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const height = doc.heightOfString(codeText, { width: boxWidth - 20, font: 'Courier', size: 8 }) + 16;
  
  if (doc.y + height > doc.page.height - doc.page.margins.bottom - 20) {
    doc.addPage();
  }
  
  const boxY = doc.y;
  doc.rect(boxX, boxY, boxWidth, height)
     .fillAndStroke('#f1f5f9', '#94a3b8');
     
  doc.fillColor('#0f172a').font('Courier').fontSize(8)
     .text(codeText, boxX + 10, boxY + 8, { width: boxWidth - 20 });
     
  doc.y = boxY + height + 4;
  if (caption) {
    doc.fontSize(7.5).fillColor(COLOR_MUTED).font('Helvetica-Oblique')
       .text(caption, { align: 'center' });
  }
  doc.moveDown(0.5);
  doc.restore();
}

function addChalkboardBox(equationText, title = 'ENTORNO PIZARRÓN VERDE (tcolorbox)') {
  doc.save();
  const boxX = doc.page.margins.left;
  const boxWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const height = 65;
  
  if (doc.y + height > doc.page.height - doc.page.margins.bottom - 20) {
    doc.addPage();
  }
  
  const boxY = doc.y;
  // Outer wooden frame
  doc.rect(boxX, boxY, boxWidth, height)
     .fillAndStroke(COLOR_WOOD, '#451a03');
  // Inner green chalkboard
  doc.rect(boxX + 5, boxY + 5, boxWidth - 10, height - 10)
     .fillAndStroke(COLOR_GREEN, '#064e3b');
     
  doc.fillColor('#a7f3d0').font('Helvetica-Bold').fontSize(7.5)
     .text(title, boxX + 10, boxY + 10, { align: 'center', width: boxWidth - 20 });
     
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(12)
     .text(equationText, boxX + 10, boxY + 28, { align: 'center', width: boxWidth - 20 });
     
  doc.y = boxY + height + 8;
  doc.restore();
}

function addCallout(text, type = 'info') {
  doc.save();
  const boxX = doc.page.margins.left;
  const boxWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const height = doc.heightOfString(text, { width: boxWidth - 30, font: 'Helvetica', size: 9 }) + 14;
  
  if (doc.y + height > doc.page.height - doc.page.margins.bottom - 20) {
    doc.addPage();
  }
  
  const boxY = doc.y;
  const bgColor = type === 'alert' ? '#fff1f2' : type === 'success' ? '#f0fdf4' : '#f0f9ff';
  const borderColor = type === 'alert' ? '#f43f5e' : type === 'success' ? '#22c55e' : '#0284c7';
  const textColor = type === 'alert' ? '#881337' : type === 'success' ? '#14532d' : '#0c4a6e';
  
  doc.rect(boxX, boxY, boxWidth, height).fillAndStroke(bgColor, borderColor);
  doc.rect(boxX, boxY, 4, height).fill(borderColor);
  
  doc.fillColor(textColor).font('Helvetica-Bold').fontSize(8.5)
     .text(type.toUpperCase() + ': ', boxX + 12, boxY + 7, { continued: true })
     .font('Helvetica').fontSize(8.5)
     .text(text, { width: boxWidth - 25, lineGap: 2 });
     
  doc.y = boxY + height + 6;
  doc.restore();
}

// ==========================================
// PORTADA
// ==========================================
doc.rect(0, 0, doc.page.width, 180).fill(COLOR_PRIMARY);

doc.fillColor('#38bdf8').font('Helvetica-Bold').fontSize(11)
   .text('SISTEMA INTEGRAL DE CONTROL Y VISIÓN MATEMÁTICA', 50, 45);

doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(22)
   .text('Plataforma Web de Transformadas de Laplace,\nModelado RLC y Estabilidad Dinámica', 50, 65, { lineGap: 4 });

doc.fillColor('#94a3b8').font('Helvetica').fontSize(9.5)
   .text('Documentación Exhaustiva de Ingeniería, Arquitectura de Software y Guía de Defensa Oral', 50, 130);

doc.y = 205;

addCallout(
  'Este documento contiene la explicación completa de la lógica algorítmica, las matemáticas de control continuo, la estructura del código en Next.js y el guion técnico detallado para presentar y defender el proyecto ante tu profesor con solvencia absoluta.',
  'info'
);

// ==========================================
// SECCIÓN 1: RESUMEN EJECUTIVO Y PROBLEMA INGENIERIL
// ==========================================
addHeader('1. Resumen Ejecutivo y Planteamiento del Problema', 'MÓDULO I');

addParagraph(
  'En la formación de ingeniería mecatrónica, eléctrica y de control, la Transformada de Laplace es la herramienta matemática angular para convertir ecuaciones diferenciales del dominio temporal f(t) en ecuaciones algebraicas sencillas en el dominio de la frecuencia compleja F(s). Sin embargo, los estudiantes y profesionales enfrentan dos grandes cuellos de botella: (1) transcribir manualmente apuntes manuscritos de pizarrones o cuadernos a software simbólico, y (2) conectar la solución matemática abstracta con el comportamiento físico real del sistema (tiempo de asentamiento, polos, sobreimpulso y estabilidad).'
);

addParagraph(
  'La gran mayoría de las aplicaciones comerciales cometen dos errores metodológicos inaceptables en ingeniería:'
);

addBullet(
  '1. Ambigüedad y Suposición de Datos',
  'Si una ecuación manuscrita carece de condiciones iniciales (como y(0) o y\'(0)) o valores de componentes (como R, L o C), los sistemas tradicionales "inventan" valores por defecto (como 0 o 25). Esto desvirtúa el cálculo y engaña al estudiante.'
);

addBullet(
  '2. Desconexión con la Teoría de Control',
  'Se limitan a dar una fórmula estática sin evaluar si el sistema es físicamente estable, dónde residen sus polos en el plano s, o cuánto tarda la respuesta en estabilizarse (criterio del 2% del tiempo de asentamiento ts).'
);

addParagraph(
  'Esta plataforma fue diseñada para erradicar estos dos problemas: ofrece reconocimiento inteligente de libreta/pizarrón (filtrando cuadrículas y manchas), auditoría estricta de parámetros con "Cero Suposiciones", motor algebraico de funciones de transferencia de segundo orden, graficación dinámica de estabilidad en Canvas/SVG y exportación académica en LaTeX con entorno Pizarrón Verde (tcolorbox).'
);

// ==========================================
// SECCIÓN 2: ARQUITECTURA GENERAL DEL SISTEMA
// ==========================================
doc.addPage();
addHeader('2. Arquitectura de Software y Tecnologías', 'MÓDULO II');

addParagraph(
  'El proyecto fue construido bajo una arquitectura modular y reactiva empleando las tecnologías más avanzadas del ecosistema web para cálculo científico:'
);

addBullet('Next.js 15+ (App Router)', 'Manejo de rutas híbridas cliente-servidor (/ y /resultado), Server Actions y Serverless API Endpoints (/api/process-image y /api/solve-equation).');
addBullet('TypeScript 5', 'Tipado estricto de extremo a extremo que previene errores en tiempo de compilación para estructuras matemáticas complejas (EquationSolution, StabilityAnalysis, ComplexPole).');
addBullet('KaTeX 0.18', 'Motor tipográfico de altísima velocidad para renderizado de fórmulas matemáticas LaTeX directamente en el navegador del cliente sin depender de conexiones externas.');
addBullet('Tailwind CSS 4', 'Sistema de diseño visual de vanguardia con efectos de cristal esmerilado (glassmorphism), modo oscuro de alto contraste y microinteracciones de ingeniería.');
addBullet('HTML5 Canvas / SVG Vectorial', 'Motor de renderizado geométrico de alta precisión para graficar el plano complejo s (polos en el LHP/RHP) y la curva temporal y(t) con franja de tolerancia de ±2%.');
addBullet('Google Gemini Vision 1.5 Flash / GPT-4o Vision', 'Modelos multimodales para la transcripción de texto matemático manuscrito complementados con un motor heurístico offline de ingeniería.');

addSubSection('Diagrama de Flujo del Pipeline de Datos');

addCodeBox(
`[ FOTO DE LIBRETA / CUADERNO ]
              │
              ▼
[ LaplaceCropper: Selección del área útil ]
              │
              ▼
[ API /api/process-image (Modo transcribeOnly) ]
   ├── Filtrado de cuadrículas, manchas y sombras
   └── Análisis de contexto de ingeniería (RLC vs Dif. Eq.)
              │
              ▼
[ Pantalla 1: Despliegue Inmediato de Doble Salida ]
   ├── 1. Código LaTeX puro (fórmula exacta)
   └── 2. Pizarrón Verde compilable en LaTeX (tcolorbox)
              │
              ▼
[ Auditoría de Parámetros: Zero Assumptions ]
   ¿Faltan componentes físicos (R, L, C) o cond. iniciales?
        ├── SI ──> Despliega campos interactivos (R, L, C, i0, V)
        └── NO ──> Pasa directo a cálculo
              │
              ▼
[ Motor de Laplace y Control: laplace-solver.ts ]
   ├── Deducción de función de transferencia G(s)
   ├── Ecuación característica: s² + 2ζωₙs + ωₙ² = 0
   ├── Cálculo de polos (fórmula general de segundo orden)
   ├── Clasificación: Subamortiguado, Crítico o Sobreamortiguado
   └── Tiempo de asentamiento: ts ≈ 4 / (ζ * ωₙ)
              │
              ▼
[ Pantalla 2 /resultado ]
   ├── Tarjeta superior Pizarrón Escolar
   ├── Explicación de cambio de dominio: t ──> s
   ├── Pasos matemáticos desglosados (KaTeX)
   ├── Mapa de polos en el plano s (LHP / RHP)
   └── Gráfica interactiva de respuesta al escalón temporal`,
  'Figura 1. Flujo completo de ejecución y procesamiento de datos en MathBoard AI'
);

// ==========================================
// SECCIÓN 3: LA POLÍTICA DE "CERO SUPOSICIONES"
// ==========================================
doc.addPage();
addHeader('3. La Filosofía de "Cero Suposiciones" (Zero Assumptions)', 'MÓDULO III');

addCallout(
  'Principio Fundamental: Una herramienta para ingenieros jamás debe inventar condiciones iniciales, constantes libres o valores numéricos de componentes que no estén explícitamente presentes en el problema.',
  'alert'
);

addParagraph(
  'Uno de los mayores defectos de la inteligencia artificial convencional es el "relleno por conveniencia": cuando ve una ecuación diferencial como y\'\' + 4y\' + 13y = 0 o un circuito integro-diferencial v(t) = L di/dt + Ri + 1/C ∫ i dt, tiende a asumir arbitrariamente que y(0)=0, y\'(0)=0 o que los componentes valen 1 o 25.'
);

addParagraph(
  'En nuestro sistema, la arquitectura implementa una compuerta de validación rigurosa en el backend y frontend:'
);

addSubSection('1. Detección de Fórmulas Incompletas');
addParagraph(
  'Cuando el modelo de visión o el usuario ingresa una expresión, el servicio ejecuta una inspección léxica:'
);
addBullet('Ecuaciones diferenciales de 2° orden', 'Verifica si la expresión contiene términos de derivada (y\'\', y\', d²y/dt²) pero carece de condiciones en la frontera y(0) y y\'(0).');
addBullet('Circuitos RLC integro-diferenciales', 'Verifica si aparecen las letras simbólicas L, R y C acompañadas de derivadas o integrales de corriente i(t).');
addBullet('Constantes arbitrarias no numéricas', 'Verifica si existe una constante de ganancia K o coeficientes algebraicos sin valor numérico asignado.');

addSubSection('2. Interrupción Limpia y Solicitud de Parámetros (Status: NEEDS_INPUT)');
addParagraph(
  'Si se detecta que faltan datos, el servidor NO ejecuta una solución arbitraria. Responde con el estado HTTP 200 pero con payload JSON status: "NEEDS_INPUT", listando exactamente los campos requeridos con su significado físico y unidades:'
);

addCodeBox(
`// Respuesta generada por /api/process-image cuando faltan datos:
{
  "success": false,
  "status": "NEEDS_INPUT",
  "raw_latex": "v(t) = L \\\\frac{di}{dt} + R i + \\\\frac{1}{C}\\\\int i dt",
  "missing_parameters": [
    { "key": "R", "label": "Resistencia", "symbol": "R (Ω)", "placeholder": "10" },
    { "key": "L", "label": "Inductancia", "symbol": "L (H)", "placeholder": "1" },
    { "key": "C", "label": "Capacitancia", "symbol": "C (F)", "placeholder": "0.04" },
    { "key": "i0", "label": "Corriente inicial", "symbol": "i(0)", "placeholder": "0" },
    { "key": "v", "label": "Voltaje aplicado", "symbol": "V (V)", "placeholder": "1" }
  ],
  "message": "Se detectó un circuito RLC serie. Ingrese los valores reales..."
}`,
  'Listado 1. Estructura JSON de solicitud de datos en modo Zero-Assumptions'
);

addParagraph(
  'El usuario puede ingresar sus valores específicos en el formulario de la primera pantalla o utilizar los valores típicos de laboratorio (R=10 Ω, L=1 H, C=0.04 F) con un solo clic. Una vez provistos, la solución se calcula exclusivamente con los datos del usuario.'
);

// ==========================================
// SECCIÓN 4: MODELADO MATEMÁTICO DEL CIRCUITO RLC
// ==========================================
doc.addPage();
addHeader('4. Deducción Matemática Rigurosa: Circuito RLC Serie', 'MÓDULO IV');

addParagraph(
  'A continuación se presenta la deducción matemática exacta que realiza el motor simbólico al recibir la ecuación manuscrita del cuaderno:'
);

addChalkboardBox('v(t) = L \\frac{di(t)}{dt} + R i(t) + \\frac{1}{C} \\int_{0}^{t} i(\\tau) d\\tau', 'ECUACIÓN ORIGINAL TRANCRITA DE LA LIBRETA');

addSubSection('Paso 1: Aplicación de la Transformada Unilateral de Laplace');
addParagraph(
  'Aplicando la propiedad de linealidad de la transformada de Laplace L{·} a cada término de la ecuación integro-diferencial en el tiempo:'
);
addBullet('Derivada de la corriente', 'L{ L * di(t)/dt } = L * [ s * I(s) - i(0) ]');
addBullet('Término resistivo', 'L{ R * i(t) } = R * I(s)');
addBullet('Término capacitivo', 'L{ (1/C) * ∫ i(τ) dτ } = (1 / (C * s)) * I(s) + vc(0) / s');

addParagraph(
  'Asumiendo condiciones iniciales nulas para la obtención de la Función de Transferencia (o incorporando i(0) en la respuesta forzada total):'
);

addCodeBox(
`V(s) = L * s * I(s) + R * I(s) + (1 / (C * s)) * I(s)
V(s) = [ L * s + R + 1 / (C * s) ] * I(s)`,
  'Ecuación en el dominio de la frecuencia compleja s'
);

addSubSection('Paso 2: Obtención de la Función de Transferencia G(s)');
addParagraph(
  'Multiplicando la expresión entre corchetes por s/L para normalizar el polinomio característico a la forma mónico-canónica:'
);

addCodeBox(
`G(s) = I(s) / V(s) = ( (1/L) * s ) / ( s² + (R/L)*s + (1 / (L*C)) )

Si se analiza el voltaje en bornes del capacitor Vc(s) = (1 / (C*s)) * I(s):
G_c(s) = V_c(s) / V(s) = ( 1 / (L*C) ) / ( s² + (R/L)*s + (1 / (L*C)) )`,
  'Funciones de transferencia canónicas del sistema RLC'
);

addSubSection('Paso 3: Mapeo a la Ecuación Canónica de Segundo Orden');
addParagraph(
  'En teoría de control, todo sistema de segundo orden se describe mediante la ecuación:'
);

addCodeBox(
`Denominador D(s) = s² + 2 * ζ * ωₙ * s + ωₙ² = 0

Comparando coeficientes término a término:
1) Término independiente:   ωₙ² = 1 / (L * C)         ==>  ωₙ = 1 / √(L * C)  [rad/s]
2) Término lineal:          2 * ζ * ωₙ = R / L       ==>  ζ = R / (2 * L * ωₙ) = (R/2) * √(C / L)`,
  'Frecuencia natural no amortiguada (ωn) y Factor de amortiguamiento (ζ)'
);

// ==========================================
// SECCIÓN 5: ANÁLISIS DE ESTABILIDAD Y TIEMPO DE ASENTAMIENTO
// ==========================================
doc.addPage();
addHeader('5. Polos, Estabilidad y Tiempo de Asentamiento (ts)', 'MÓDULO V');

addSubSection('1. Cálculo y Ubicación de los Polos en el Plano s');
addParagraph(
  'Las raíces del polinomio característico D(s) = s² + (R/L)s + 1/(LC) = 0 determinan de forma unívoca la estabilidad y el tipo de respuesta transitoria del sistema:'
);

addCodeBox(
`s₁,₂ = - (R / (2*L)) ± √( (R / (2*L))² - 1 / (L*C) )
s₁,₂ = - ζ * ωₙ ± ωₙ * √( ζ² - 1 )`,
  'Fórmula general de los polos de segundo orden'
);

addParagraph('El valor del factor de amortiguamiento ζ define tres regímenes físicos:');
addBullet('Subamortiguado (0 < ζ < 1)', 'Polos complejos conjugados s = -σ ± jωd, donde σ = ζωn y ωd = ωn√(1 - ζ²). La respuesta temporal presenta oscilaciones amortiguadas.');
addBullet('Críticamente Amortiguado (ζ = 1)', 'Dos polos reales e idénticos en s = -ωn. Es la respuesta más rápida posible sin sobreimpulso oscilatorio.');
addBullet('Sobreamortiguado (ζ > 1)', 'Dos polos reales negativos distintos s₁, s₂ < 0. La respuesta es lenta y sin oscilaciones.');
addBullet('Inestable (ζ < 0 o Polos en RHP)', 'Si la parte real de algún polo es positiva (Re{s} > 0), la respuesta temporal diverge exponencialmente hacia el infinito.');

addSubSection('2. Deducción Rigurosa del Tiempo de Asentamiento (Criterio del 2%)');
addParagraph(
  'El tiempo de asentamiento ts es el tiempo requerido para que la respuesta temporal y(t) entre y permanezca dentro de una banda de tolerancia alrededor de su valor final en estado estacionario yss.'
);

addParagraph(
  'Para un escalón unitario en un sistema subamortiguado, la respuesta temporal analítica es:'
);

addCodeBox(
`y(t) = 1 - ( e^(-ζ * ωₙ * t) / √(1 - ζ²) ) * sen( ω_d * t + θ )`,
  'Respuesta analítica temporal al escalón unitario'
);

addParagraph(
  'La velocidad a la que decaen las oscilaciones está gobernada exclusivamente por la envolvente exponencial e^(-ζ * ωn * t). Para el criterio de tolerancia del ±2%:'
);

addCodeBox(
`e^(-ζ * ωₙ * t_s) = 0.02
-ζ * ωₙ * t_s = ln(0.02)
-ζ * ωₙ * t_s ≈ -3.912

Despejando ts:
t_s ≈ 3.912 / (ζ * ωₙ) ≈ 4 / (ζ * ωₙ) = 4 / σ`,
  'Deducción analítica de la fórmula de asentamiento al 2%'
);

addCallout(
  'Ejemplo con valores de laboratorio: R = 10 Ω, L = 1 H, C = 0.04 F:\n' +
  '• ωn = 1 / √(1 * 0.04) = 1 / 0.2 = 5 rad/s\n' +
  '• ζ = (10 / 2) * √(0.04 / 1) = 5 * 0.2 = 1.0 (Sistema Críticamente Amortiguado)\n' +
  '• Polos: s₁,₂ = -5 (Polo doble en el eje real negativo)\n' +
  '• Función de transferencia: G(s) = 1 / (s² + 10s + 25)\n' +
  '• Tiempo de asentamiento estimado: ts ≈ 4 / 5 = 0.8 segundos.',
  'success'
);

// ==========================================
// SECCIÓN 6: CÓDIGO LATEX Y ENTORNO PIZARRÓN VERDE
// ==========================================
doc.addPage();
addHeader('6. Implementación del Entorno LaTeX: Pizarrón Verde', 'MÓDULO VI');

addParagraph(
  'Tanto en la primera pantalla como en la vista de resultados, el sistema ofrece la exportación estandarizada en LaTeX utilizando el paquete tcolorbox con una paleta cromática que emula una pizarra escolar de tiza:'
);

addBullet('Color de fondo (verdePizarron)', 'RGB: 20, 65, 40 (#144128) - Verde oscuro mate tipo pizarra');
addBullet('Color del marco (marcoMadera)', 'RGB: 110, 70, 40 (#6e4628) - Madera barnizada simulada');
addBullet('Tipografía de tiza', 'Texto blanco con tamaño \\Large y centrado geométrico');

addCodeBox(
`\\documentclass{article}
\\usepackage{amsmath, amsfonts, amssymb}
\\usepackage[most]{tcolorbox}
\\usepackage{xcolor}

% Configuración del estilo Pizarrón Verde
\\definecolor{verdePizarron}{RGB}{20, 65, 40}
\\definecolor{marcoMadera}{RGB}{110, 70, 40}

\\newtcolorbox{pizarron}{
  colback=verdePizarron,
  colframe=marcoMadera,
  coltext=white,
  fontupper=\\Large,
  halign=center,
  arc=2mm,
  boxrule=3mm,
  drop shadow
}

\\begin{document}

\\begin{pizarron}
\\[
  v(t) = L \\frac{di(t)}{dt} + R i(t) + \\frac{1}{C} \\int_{0}^{t} i(t) \\, dt
\\]
\\end{pizarron}

\\end{document}`,
  'Documento LaTeX completo compilable generado por la aplicación'
);

addParagraph(
  'En la interfaz web, este entorno está renderizado en tiempo real con CSS moderno (border de 8px color madera, fondo verde pizarron con sombras interiores y KaTeX en blanco), permitiendo copiar el código con 1 clic o descargar el archivo .tex listo para Overleaf o TeXShop.'
);

// ==========================================
// SECCIÓN 7: GUÍA PARA EXPLICÁRSELO A TU PROFESOR
// ==========================================
doc.addPage();
addHeader('7. Guía de Defensa Oral ante el Profesor', 'MÓDULO VII');

addCallout(
  'Tu profesor sabe que hiciste "vibe coding". Eso no es algo malo: el vibe coding es la forma moderna en que los ingenieros aceleran el desarrollo con IA. Lo que el profesor evaluará es si realmente comprendes la ingeniería, el flujo de datos y las matemáticas detrás del proyecto.',
  'info'
);

addSubSection('1. El "Elevator Pitch" (Tu Discurso de Entrada de 60 Segundos)');
addParagraph(
  '"Profesor, desarrollé una plataforma web orientada al análisis dinámico de sistemas en el dominio de Laplace. La meta fue resolver un problema real: cuando tomamos fotos de ecuaciones en la libreta o pizarrón, los modelos de IA comunes inventan datos o se equivocan con las cuadrículas. Mi sistema filtra el fondo, extrae la ecuación con precisión en LaTeX y, lo más importante, aplica una política de CERO SUPOSICIONES: si la fórmula es un circuito RLC o una ecuación diferencial y le faltan parámetros o condiciones iniciales, el software no inventa nada; despliega un formulario interactivo para que el usuario ingrese los valores de laboratorio. Con ellos, deduce la función de transferencia canónica G(s), evalúa la ubicación de los polos en el plano s, clasifica el tipo de amortiguamiento y calcula el tiempo de asentamiento con el criterio del 2%, graficando la respuesta al escalón en tiempo real."'
);

addSubSection('2. Demostración en Vivo en 3 Pasos Clave');
addBullet(
  'Paso 1: Muestra el Reconocimiento y el Pizarrón Verde',
  'Carga la foto del cuaderno del circuito RLC. Muéstrale que la app no se rompe: reconoce v(t) = L di/dt + Ri + (1/C)∫i dt y despliega de inmediato el Código LaTeX y el Pizarrón Verde.'
);
addBullet(
  'Paso 2: Enfatiza el Principio de Cero Suposiciones',
  'Dile: "Mire profe, la foto tiene variables simbólicas L, R y C. Mi sistema no asume ningún número falso. Me pide la resistencia en Ohmios, inductancia en Henrios y capacitancia en Faradios". Haz clic en "Valores Típicos" (R=10, L=1, C=0.04).'
);
addBullet(
  'Paso 3: Muestra la Estabilidad y el Tiempo de Asentamiento',
  'Presiona "Calcular". En la pantalla /resultado, muéstrale cómo G(s) = 1/(s² + 10s + 25), los polos en s = -5, y la gráfica donde la línea de tolerancia ±2% cruza exactamente en el tiempo de asentamiento ts.'
);

addSubSection('3. Preguntas Típicas del Profesor y Respuestas Magistrales');

addParagraph(
  'Pregunta 1: "¿Por qué utilizaste la transformada unilateral de Laplace y no la bilateral?"\n' +
  'Respuesta recomendada: "Porque en ingeniería de control los sistemas físicos son causales; la excitación inicia en t = 0 (t ≥ 0). La transformada unilateral incorpora de forma natural las condiciones iniciales del sistema en t = 0- como i(0) o vc(0), lo que es indispensable para el análisis transitorio."'
);

addParagraph(
  'Pregunta 2: "¿Cómo calculas el tiempo de asentamiento ts en el código?"\n' +
  'Respuesta recomendada: "A partir de los coeficientes del denominador D(s) = s² + a₁s + a₀, identifico ωn = √a₀ y ζ = a₁ / (2ωn). Para sistemas subamortiguados y críticamente amortiguados, empleo la aproximación canónica de la envolvente exponencial al 2%, que es ts ≈ 4 / (ζ * ωn). Adicionalmente, el graficador en Canvas calcula numéricamente la respuesta paso a paso y valida el último instante en que la curva entra y se queda dentro del rango [0.98, 1.02]."'
);

addParagraph(
  'Pregunta 3: "¿Cómo resolviste el problema de que la cámara confunda una t con un signo + o se pierdan subíndices?"\n' +
  'Respuesta recomendada: "Diseñé un prompt de visión estructurado con tres etapas: (1) Filtrado de cuadrículas y manchas, (2) Análisis contextual de ingeniería (reconociendo que en un circuito con L y C, la variable independiente es el tiempo t y los diferenciales son di/dt), y (3) Reconocimiento de límites de integrales de 0 a t. Además, integré un editor manual de LaTeX por si el usuario desea ajustar cualquier símbolo antes de calcular."'
);

addParagraph(
  'Pregunta 4: "¿Por qué elegiste Next.js con TypeScript en vez de hacer un script simple en Python?"\n' +
  'Respuesta recomendada: "Quería crear un producto de ingeniería accesible desde cualquier dispositivo (celular o laptop en el laboratorio) sin instalar dependencias como NumPy o SymPy en la máquina del usuario. Con Next.js, KaTeX renderiza las fórmulas en milisegundos en el navegador y el usuario puede exportar directamente su reporte a Overleaf con el código tcolorbox que generamos."'
);

// ==========================================
// PIE DE PÁGINA GLOBAL (NUMERACIÓN)
// ==========================================
const pages = doc.bufferedPageRange();
for (let i = 0; i < pages.count; i++) {
  doc.switchToPage(i);
  doc.save();
  const footerY = doc.page.height - 35;
  
  doc.strokeColor(COLOR_LINE).lineWidth(0.5)
     .moveTo(doc.page.margins.left, footerY - 5)
     .lineTo(doc.page.width - doc.page.margins.right, footerY - 5)
     .stroke();
     
  doc.fontSize(7.5).fillColor(COLOR_MUTED).font('Helvetica')
     .text('Plataforma Web de Laplace y Teoría de Control  |  Documento Técnico', doc.page.margins.left, footerY);
     
  doc.fontSize(7.5).fillColor(COLOR_MUTED).font('Helvetica-Bold')
     .text(`Página ${i + 1} de ${pages.count}`, doc.page.margins.left, footerY, {
       align: 'right',
       width: doc.page.width - doc.page.margins.left - doc.page.margins.right
     });
  doc.restore();
}

doc.end();
stream.on('finish', () => {
  console.log(`Documento PDF generado exitosamente en: ${outputPath}`);
  console.log(`Tamaño final: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
});
