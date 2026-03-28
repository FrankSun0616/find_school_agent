import { NextRequest } from 'next/server';
import { chatStream, resolveConfig } from '@/lib/ai-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile, schoolName, programName, researchInterests, professorName, provider, apiKey } = body;

    const config = resolveConfig(provider, apiKey);
    if (!config.apiKey) {
      return new Response(JSON.stringify({ error: '请先在设置中配置 API Key' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (!profile || !schoolName || !programName) {
      return new Response(JSON.stringify({ error: '缺少必要参数' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const system = `You are an expert PhD/Master's application consultant who writes outstanding Statements of Purpose.
Write in first-person, formal academic English. The SOP should be approximately 700-900 words.
Structure: Research motivation → Academic background → Specific research experiences → Research interests and questions → Why this program/professor → Career goals → Closing.
Be specific about research interests, methodologies, and how they align with the program. For PhD applications, mention specific professors if provided.
Make it intellectual, focused, and demonstrate deep understanding of the field.`;

    const userMessage = `Write a Statement of Purpose for the following student applying to ${programName} at ${schoolName}.

Student Profile:
${JSON.stringify(profile, null, 2)}

Research Interests: ${researchInterests || profile.targetField || 'Not specified'}
${professorName ? `Target Professor: ${professorName}` : ''}

Write a complete, compelling SOP that demonstrates research potential and fit with the program.`;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of chatStream(config, system, userMessage, 2500)) {
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('SOP generation error:', error);
    return new Response(JSON.stringify({ error: '生成失败，请稍后重试' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
