import { NextRequest } from 'next/server';
import { chatStream, resolveConfig } from '@/lib/ai-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile, schoolName, programName, additionalInfo, provider, apiKey } = body;

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

    const system = `You are an expert college application consultant who writes compelling Personal Statements for graduate school applications.
Write in first-person, formal academic English. The PS should be approximately 600-800 words.
Structure: Opening hook → Academic journey → Research experience → Why this program/school → Future goals → Closing.
Make it personal, specific, and compelling. Avoid clichés. Show don't tell.`;

    const userMessage = `Write a Personal Statement for the following student applying to ${programName} at ${schoolName}.

Student Profile:
${JSON.stringify(profile, null, 2)}

${additionalInfo ? `Additional Information: ${additionalInfo}` : ''}

Write a complete, polished Personal Statement that highlights their strengths and fits the program perfectly.`;

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
    console.error('PS generation error:', error);
    return new Response(JSON.stringify({ error: '生成失败，请稍后重试' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
