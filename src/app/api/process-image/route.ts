import { NextRequest, NextResponse } from 'next/server';
import { parseAndSolveLaplace, validateLaplaceDomain, solveTransferFunction } from '@/lib/laplace-solver';
import { CalculationMode, EquationSolution, MissingParameter } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64, userApiKey, calculationMode, userParameters, rawLatexOverride } = body;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return NextResponse.json(
        { 
          success: false, 
          status: 'ERROR',
          error: 'No se pudo interpretar la fórmula en la imagen recortada. Por favor reajusta el recuadro' 
        },
        { status: 400 }
      );
    }

    let rawLatex = rawLatexOverride || '';
    let laplaceLatex = '';

    // If rawLatex was not already provided from a previous step, perform OCR via Vision Model
    if (!rawLatex) {
      const effectiveKey = userApiKey?.trim() || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

      if (!effectiveKey) {
        return NextResponse.json(
          {
            success: false,
            status: 'MISSING_API_KEY',
            error: 'Se requiere una API Key de Gemini (o OpenAI) para transcribir fotos manuscritas automáticamente.'
          },
          { status: 400 }
        );
      }

      // Clean base64
      const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
      const mimeTypeMatch = imageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';

      // Required Vision Prompt
      const visionPrompt = `Eres un sistema experto en visión por computadora y OCR matemático especializado en transcribir ecuaciones manuscritas en notación LaTeX.
Sigue estrictamente este procedimiento de interpretación visual:
1. FILTRADO DE FONDO:
   - Ignora por completo las líneas horizontales o cuadrículas del cuaderno, manchas y sombras.
   - Concéntrate exclusivamente en los trazos de tinta o lápiz.
2. ANÁLISIS CONTEXTUAL Y DE INGENIERÍA:
   - Identifica el dominio científico (ej. circuitos RLC con inductancia L, resistencia R y capacitancia C; ecuaciones diferenciales; control y transformada de Laplace).
   - Utiliza el contexto para resolver ambigüedades en letras y símbolos (ejemplo: diferenciar la letra 't' del signo '+', identificar derivadas d/dt o di/dt, e interpretar correctamente funciones y subíndices como i(t)).
3. RECONOCIMIENTO DE ESTRUCTURA:
   - Identifica fracciones, derivadas, integrales con sus límites (ej. de 0 a t) y subíndices.
   - Si un trazo parece borroneado o corregido sobre el papel, interpreta la intención lógica del término en la ecuación.

Devuelve estrictamente un objeto JSON con:
1. "raw_latex": La transcripción literal exacta en código LaTeX de la ecuación matemática transcrita.
2. "laplace_latex": La expresión en el dominio de frecuencia compleja s si aplica.
3. "is_valid": true si la imagen contiene una expresión matemática legible.`;

      let parsedResult: { raw_latex?: string; laplace_latex?: string; is_valid?: boolean } | null = null;
      const isOpenAI = effectiveKey.startsWith('sk-');

      if (isOpenAI) {
        const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${effectiveKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            response_format: { type: 'json_object' },
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: visionPrompt },
                  { type: 'image_url', image_url: { url: `data:${mimeType};base64,${cleanBase64}` } }
                ]
              }
            ],
            max_tokens: 1000
          })
        });

        if (!openAiRes.ok) {
          const errText = await openAiRes.text();
          console.error('Error de OpenAI API:', openAiRes.status, errText);
          let userMsg = 'Error al comunicarse con la API de OpenAI.';
          try {
            const errObj = JSON.parse(errText);
            if (errObj.error?.message) {
              userMsg = `Error de OpenAI API (${openAiRes.status}): ${errObj.error.message}`;
            }
          } catch (e) {}
          return NextResponse.json(
            { success: false, status: 'ERROR', error: userMsg },
            { status: 400 }
          );
        }

        const data = await openAiRes.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          try {
            parsedResult = JSON.parse(content);
          } catch (e) {
            parsedResult = { raw_latex: content.replace(/```json|```/g, '').trim(), is_valid: true };
          }
        }
      } else {
        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${effectiveKey}`;
        const geminiRes = await fetch(geminiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: visionPrompt },
                  { inline_data: { mime_type: mimeType, data: cleanBase64 } }
                ]
              }
            ],
            generationConfig: { response_mime_type: 'application/json' }
          })
        });

        if (!geminiRes.ok) {
          const errText = await geminiRes.text();
          console.error('Error de Gemini API:', geminiRes.status, errText);
          let userMsg = 'Error al comunicarse con la API de Google Gemini.';
          try {
            const errObj = JSON.parse(errText);
            if (errObj.error?.message) {
              userMsg = `Error de Gemini API (${geminiRes.status}): ${errObj.error.message}`;
            }
          } catch (e) {}

          return NextResponse.json(
            { success: false, status: 'ERROR', error: userMsg },
            { status: 400 }
          );
        }

        const data = await geminiRes.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          try {
            const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
            parsedResult = JSON.parse(cleanJson);
          } catch (jsonErr) {
            console.warn('Fallback extrayendo LaTeX del texto de Gemini:', rawText);
            parsedResult = {
              raw_latex: rawText.replace(/```latex|```/g, '').trim(),
              is_valid: true
            };
          }
        }
      }

      // Check if image produced any recognizable text
      if (!parsedResult || (!parsedResult.raw_latex && !parsedResult.laplace_latex)) {
        return NextResponse.json(
          { 
            success: false, 
            status: 'ERROR',
            error: 'No se pudo reconocer una expresión matemática en la imagen. Por favor reajusta el recuadro sobre los trazos de la fórmula.' 
          },
          { status: 400 }
        );
      }

      rawLatex = (parsedResult.raw_latex || parsedResult.laplace_latex || '').trim();
      // If starts with = prefix with v(t)
      if (rawLatex.startsWith('=')) {
        rawLatex = 'v(t) ' + rawLatex;
      }
      laplaceLatex = parsedResult.laplace_latex?.trim() || rawLatex;
    }

    // -------------------------------------------------------------
    // AUDIT FOR MISSING DATA (Zero Assumptions)
    // -------------------------------------------------------------
    const lowerRaw = rawLatex.toLowerCase();
    const isDifferential = 
      lowerRaw.includes("y''") || 
      lowerRaw.includes("y'") || 
      lowerRaw.includes('\\frac{d^2') || 
      lowerRaw.includes('\\frac{d}') || 
      lowerRaw.includes('\\ddot') || 
      lowerRaw.includes('\\dot');

    const hasInitialConditions = 
      lowerRaw.includes('y(0)') || 
      lowerRaw.includes("y'(0)") || 
      (lowerRaw.includes('y_0') && lowerRaw.includes('y_1'));

    // Check if differential equation is missing initial conditions and user has not yet supplied them
    if (isDifferential && !hasInitialConditions && !userParameters) {
      const missing_parameters: MissingParameter[] = [
        {
          key: 'y0',
          label: 'Condición inicial y(0)',
          symbol: 'y(0)',
          placeholder: '0',
          type: 'number',
          required: true,
          description: 'Valor de la función en el instante inicial t = 0'
        },
        {
          key: 'yPrime0',
          label: "Condición inicial y'(0)",
          symbol: "y'(0)",
          placeholder: '0',
          type: 'number',
          required: true,
          description: 'Velocidad o derivada inicial en t = 0'
        }
      ];

      return NextResponse.json({
        success: false,
        status: 'NEEDS_INPUT',
        raw_latex: rawLatex,
        detected_formula: rawLatex,
        missing_parameters,
        message: 'No se detectaron las condiciones iniciales en la foto para resolver la ecuación diferencial.'
      });
    }

    // Check if equation is an RLC circuit: contains L, R, C or d_i/dt or \int i
    const isRlcCircuit = 
      (lowerRaw.includes('di') || lowerRaw.includes('d_i') || lowerRaw.includes('i(t)') || lowerRaw.includes('\\int')) &&
      (rawLatex.includes('L') || rawLatex.includes('R') || rawLatex.includes('C'));

    if (isRlcCircuit && (!userParameters || userParameters.R === undefined || userParameters.L === undefined || userParameters.C === undefined)) {
      const missing_parameters: MissingParameter[] = [
        {
          key: 'R',
          label: 'Resistencia (R)',
          symbol: 'R (Ω)',
          placeholder: '10',
          type: 'number',
          required: true,
          description: 'Valor de la resistencia en Ohmios (Ω)'
        },
        {
          key: 'L',
          label: 'Inductancia (L)',
          symbol: 'L (H)',
          placeholder: '1',
          type: 'number',
          required: true,
          description: 'Valor del inductor en Henrios (H)'
        },
        {
          key: 'C',
          label: 'Capacitancia (C)',
          symbol: 'C (F)',
          placeholder: '0.04',
          type: 'number',
          required: true,
          description: 'Valor del condensador en Faradios (ej: 0.04 o 0.001)'
        },
        {
          key: 'i0',
          label: 'Corriente inicial i(0)',
          symbol: 'i(0)',
          placeholder: '0',
          type: 'number',
          required: false,
          description: 'Corriente a través del inductor en t = 0 (por defecto 0 A)'
        },
        {
          key: 'v',
          label: 'Voltaje de excitación V',
          symbol: 'V (Voltios)',
          placeholder: '1',
          type: 'number',
          required: false,
          description: 'Amplitud de la fuente de tensión aplicada (ej. escalón de 1 V)'
        }
      ];

      return NextResponse.json({
        success: false,
        status: 'NEEDS_INPUT',
        raw_latex: rawLatex,
        detected_formula: rawLatex,
        missing_parameters,
        message: 'Se detectó un circuito RLC en la foto. Para calcular la transformada y graficar la estabilidad, por favor ingresa los valores de los componentes:'
      });
    }

    // Check for undefined symbolic constant K (e.g. G(s) = K / (s^2 + ...))
    const hasSymbolicK = /[^\w]K[^\w]|^K[^\w]|[^\w]K$/.test(rawLatex) && !lowerRaw.includes('k=') && !lowerRaw.includes('k =');
    if (hasSymbolicK && (!userParameters || userParameters.k === undefined)) {
      const missing_parameters: MissingParameter[] = [
        {
          key: 'k',
          label: 'Ganancia o constante K',
          symbol: 'K',
          placeholder: '10',
          type: 'number',
          required: true,
          description: 'Valor numérico de la constante K del sistema'
        }
      ];

      return NextResponse.json({
        success: false,
        status: 'NEEDS_INPUT',
        raw_latex: rawLatex,
        detected_formula: rawLatex,
        missing_parameters,
        message: 'La ecuación contiene la constante simbólica K sin valor numérico especificado.'
      });
    }

    // -------------------------------------------------------------
    // SOLVE COMBINING IMAGE DATA + USER INPUTTED PARAMETERS
    // -------------------------------------------------------------
    let effectiveLatexToSolve = laplaceLatex || rawLatex;

    // If user provided RLC parameters, build exact control transfer function
    if (userParameters && userParameters.R !== undefined && userParameters.L !== undefined && userParameters.C !== undefined) {
      const R = Number(userParameters.R);
      const L = Number(userParameters.L);
      const C = Number(userParameters.C);
      const V = userParameters.v !== undefined ? Number(userParameters.v) : 1;
      const i0 = userParameters.i0 !== undefined ? Number(userParameters.i0) : 0;

      const a2 = 1;
      const a1 = Number((R / L).toFixed(4));
      const a0 = Number((1 / (L * C)).toFixed(4));
      const num = Number((V / L).toFixed(4));

      effectiveLatexToSolve = `G(s) = \\frac{${num}}{s^2 + ${a1}s + ${a0}}`;
      rawLatex = `v(t) = L \\frac{di}{dt} + R i(t) + \\frac{1}{C} \\int_0^t i(\\tau) d\\tau, \\quad R=${R}\\Omega, \\; L=${L}H, \\; C=${C}F, \\; i(0)=${i0}A`;
    }

    // If user provided initial conditions, combine explicitly
    if (userParameters && (userParameters.y0 !== undefined || userParameters.yPrime0 !== undefined)) {
      const y0 = userParameters.y0 ?? 0;
      const yPrime0 = userParameters.yPrime0 ?? 0;
      // Append initial conditions to formula for transparency
      rawLatex = `${rawLatex}, \\quad y(0) = ${y0}, \\; y'(0) = ${yPrime0}`;
    }

    // If user provided constant K, replace in formula
    if (userParameters && userParameters.k !== undefined) {
      effectiveLatexToSolve = effectiveLatexToSolve.replace(/\bK\b/g, String(userParameters.k));
    }

    const domainCheck = validateLaplaceDomain(effectiveLatexToSolve || rawLatex);

    const solution: EquationSolution = parseAndSolveLaplace(
      effectiveLatexToSolve,
      imageBase64,
      calculationMode,
      'upload'
    );

    solution.timeDomainLatex = rawLatex;
    solution.frequencyDomainLatex = solution.detectedLatex || effectiveLatexToSolve;
    solution.domainValidation = domainCheck;
    solution.domainTransitionExplanation = 
      'La Transformada de Laplace \\mathcal{L}\\{f(t)\\} convierte ecuaciones del dominio del tiempo (t) al dominio de la frecuencia compleja (s = \\sigma + j\\omega). Este cambio convierte ecuaciones diferenciales complejas en multiplicaciones algebraicas sencillas, lo que permite analizar la estabilidad del sistema, sus polos, ceros y el tiempo de asentamiento (t_s).';

    return NextResponse.json({
      success: true,
      status: 'SUCCESS',
      raw_latex: rawLatex,
      laplace_latex: solution.frequencyDomainLatex,
      is_valid: true,
      solution
    });

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Error al procesar la imagen recortada';
    console.error('Error en /api/process-image:', error);
    return NextResponse.json(
      { 
        success: false, 
        status: 'ERROR',
        error: 'No se pudo interpretar la fórmula en la imagen recortada. Por favor reajusta el recuadro' 
      },
      { status: 400 }
    );
  }
}
