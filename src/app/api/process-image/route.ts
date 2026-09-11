import { NextRequest, NextResponse } from 'next/server';
import { parseAndSolveLaplace, validateLaplaceDomain } from '@/lib/laplace-solver';
import { CalculationMode, EquationSolution } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64, userApiKey, calculationMode } = body;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No se pudo interpretar la fórmula en la imagen recortada. Por favor reajusta el recuadro' 
        },
        { status: 400 }
      );
    }

    const effectiveKey = userApiKey?.trim() || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    if (!effectiveKey) {
      // ZERO MOCKS: If no key is provided, explain how to add Gemini or OpenAI API Key
      return NextResponse.json(
        {
          success: false,
          error: 'No se pudo interpretar la fórmula en la imagen recortada. Por favor configura tu API Key de Visión (Gemini u OpenAI) en Configuración (icono ⚙️) para transcribir fotos manuscritas.'
        },
        { status: 400 }
      );
    }

    // Clean base64
    const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    const mimeTypeMatch = imageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';

    // Exact required vision prompt
    const visionPrompt = `Analiza la imagen manuscrita provista. Transcribe con total precisión el texto matemático escrito en la imagen a código LaTeX. Si la imagen contiene una función o ecuación en el dominio del tiempo f(t), transcríbela tal cual y calcula su Transformada de Laplace L{f(t)}=F(s). Retorna un objeto JSON con: 1) raw_latex (lo que dice la foto), 2) laplace_latex (la transformada obtenida en s), y 3) is_valid (booleano).`;

    let parsedResult: { raw_latex?: string; laplace_latex?: string; is_valid?: boolean } | null = null;

    // Check if key is OpenAI or Gemini
    const isOpenAI = effectiveKey.startsWith('sk-');

    if (isOpenAI) {
      // Call OpenAI GPT-4o Vision
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
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${mimeType};base64,${cleanBase64}`
                  }
                }
              ]
            }
          ],
          max_tokens: 1000
        })
      });

      if (openAiRes.ok) {
        const data = await openAiRes.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          parsedResult = JSON.parse(content);
        }
      }
    } else {
      // Call Google Gemini Vision (Gemini 1.5 Flash / 2.0 Flash)
      const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${effectiveKey}`;

      const geminiRes = await fetch(geminiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: visionPrompt },
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
        const data = await geminiRes.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          parsedResult = JSON.parse(rawText);
        }
      }
    }

    // Strict validation: if not readable or incomplete crop, return 400 error (NO MOCK FALLBACK!)
    if (!parsedResult || !parsedResult.is_valid || (!parsedResult.raw_latex && !parsedResult.laplace_latex)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No se pudo interpretar la fórmula en la imagen recortada. Por favor reajusta el recuadro' 
        },
        { status: 400 }
      );
    }

    const rawLatex = parsedResult.raw_latex?.trim() || '';
    const laplaceLatex = parsedResult.laplace_latex?.trim() || rawLatex;

    // Verify domain
    const domainCheck = validateLaplaceDomain(laplaceLatex || rawLatex);

    // Compute dynamic mathematical solution specifically for this equation
    const solution: EquationSolution = parseAndSolveLaplace(
      laplaceLatex,
      imageBase64,
      calculationMode,
      'upload'
    );

    // Map dynamic fields explicitly
    solution.timeDomainLatex = rawLatex;
    solution.frequencyDomainLatex = laplaceLatex;
    solution.detectedLatex = laplaceLatex;
    solution.domainValidation = domainCheck;
    solution.domainTransitionExplanation = 
      'La Transformada de Laplace \\mathcal{L}\\{f(t)\\} convierte ecuaciones del dominio del tiempo (t) al dominio de la frecuencia compleja (s = \\sigma + j\\omega). Este cambio convierte ecuaciones diferenciales complejas en multiplicaciones algebraicas sencillas, lo que permite analizar la estabilidad del sistema, sus polos, ceros y el tiempo de asentamiento (t_s).';

    return NextResponse.json({
      success: true,
      raw_latex: rawLatex,
      laplace_latex: laplaceLatex,
      is_valid: true,
      solution
    });

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Error al procesar la imagen recortada';
    console.error('Error en /api/process-image:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'No se pudo interpretar la fórmula en la imagen recortada. Por favor reajusta el recuadro' 
      },
      { status: 400 }
    );
  }
}
