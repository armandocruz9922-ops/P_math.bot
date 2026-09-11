import { NextRequest, NextResponse } from 'next/server';
import { getSampleSolution } from '@/lib/sample-equations';
import { parseAndSolveLaplace, solveTransferFunction, validateLaplaceDomain } from '@/lib/laplace-solver';
import { EquationSolution } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64, sampleId, manualLatex, calculationMode, userApiKey } = body;

    // 1. Si es un ejemplo de pizarra de control seleccionado directamente
    if (sampleId) {
      const solution = getSampleSolution(sampleId);
      return NextResponse.json({
        success: true,
        source: 'sample_preset',
        solution
      });
    }

    // 2. Si el usuario ingresó o editó una fórmula LaTeX directamente
    if (manualLatex && manualLatex.trim().length > 0) {
      const domain = validateLaplaceDomain(manualLatex);
      
      const solution = parseAndSolveLaplace(
        manualLatex,
        imageBase64 || '/samples/pizarron-rlc.svg',
        calculationMode,
        imageBase64 ? 'upload' : 'sample'
      );
      solution.domainValidation = domain;

      return NextResponse.json({
        success: true,
        source: 'manual_latex_solved',
        solution
      });
    }

    // 3. Si hay API Key para Gemini Vision (del entorno o pasada por el usuario)
    const effectiveGeminiKey = userApiKey || process.env.GEMINI_API_KEY;

    if (effectiveGeminiKey && imageBase64) {
      try {
        const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
        const mimeTypeMatch = imageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,/);
        const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';

        const prompt = `Eres un asistente de élite en OCR de fórmulas matemáticas manuscritas en pizarrón de clase y libretas universitarias especializado EXCLUSIVAMENTE en Transformadas de Laplace y Teoría de Control (G(s), F(s), f(t), polos, tiempo de asentamiento).
Analiza con total fidelidad la fórmula escrita a mano en la imagen (ej: G(s) = 25/(s^2+4s+25), L{4e^-2t sin 3t}, L^-1{3s+5/((s+1)(s+2))}, ecuaciones diferenciales en el dominio s).

Debes responder ÚNICAMENTE con un objeto JSON válido (sin markdown exterior) con la siguiente estructura:
{
  "detectedLatex": "LaTeX fiel de la fórmula (ej: G(s) = \\\\frac{25}{s^2 + 4s + 25})",
  "calculationMode": "transfer_function | direct | inverse",
  "equationType": "Tipo (ej: Función de Transferencia de Segundo Orden)",
  "methodUsed": "Método (ej: Análisis en el Plano s y Polos Complejos)",
  "confidenceScore": 0.98
}`;

        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${effectiveGeminiKey}`;

        const geminiRes = await fetch(geminiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: cleanBase64
                    }
                  }
                ]
              }
            ],
            generationConfig: {
              response_mime_type: 'application/json'
            }
          })
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            const detected = parsed.detectedLatex?.trim();
            if (!detected) {
              return NextResponse.json(
                { success: false, error: 'No se pudo interpretar la fórmula en la imagen recortada. Por favor reajusta el recuadro' },
                { status: 400 }
              );
            }
            const domain = validateLaplaceDomain(detected);

            const solution = parseAndSolveLaplace(
              detected,
              imageBase64,
              parsed.calculationMode || calculationMode,
              'upload'
            );
            solution.confidenceScore = parsed.confidenceScore || 0.98;
            solution.domainValidation = domain;

            return NextResponse.json({
              success: true,
              source: 'gemini_vision_ai',
              solution
            });
          }
        }
      } catch (aiError) {
        console.warn('Fallo llamada Gemini AI, utilizando motor Laplace analítico local:', aiError);
      }
    }

    // Si no se pudo procesar la imagen con el modelo de visión ni es manual
    return NextResponse.json(
      { 
        success: false, 
        error: 'No se pudo interpretar la fórmula en la imagen recortada. Por favor reajusta el recuadro' 
      },
      { status: 400 }
    );

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido al procesar ecuación';
    console.error('Error en /api/solve-equation:', error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
