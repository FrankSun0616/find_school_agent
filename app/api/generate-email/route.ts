import { NextRequest } from 'next/server';
import { chatStream, resolveConfig } from '@/lib/ai-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile, professorName, university, researchArea, recentPapers, provider, apiKey } = body;

    const config = resolveConfig(provider, apiKey);
    if (!config.apiKey) {
      return new Response(JSON.stringify({ error: '请先在设置中配置 API Key' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (!profile || !professorName || !university) {
      return new Response(JSON.stringify({ error: '缺少必要参数' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const system = `You are an expert at writing cold emails (陶瓷邮件) to professors for PhD applications.
Write concise, professional, personalized cold emails.
The email should be: specific to the professor's research, show genuine interest, highlight relevant background, and end with a clear ask.
Length: 200-300 words. Subject line included. Professional but approachable tone.`;

    const papersText = recentPapers
      ? `Recent Papers: ${Array.isArray(recentPapers) ? recentPapers.map((p: { title?: string; year?: number }) => `"${p.title}" (${p.year})`).join(', ') : recentPapers}`
      : '';

    const userMessage = `Write a cold email (陶瓷邮件) to Professor ${professorName} at ${university}.

Student Profile:
${JSON.stringify(profile, null, 2)}

Professor's Research Area: ${researchArea}
${papersText}

Write a complete cold email with:
1. Subject line
2. Professional greeting
3. Brief self-introduction with most relevant background
4. Specific connection to professor's research (mention a paper if provided)
5. Your research interest alignment
6. Clear ask (potential PhD supervision)
7. Professional closing

Make it genuine, specific, and compelling.`;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of chatStream(config, system, userMessage, 1000)) {
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
    console.error('Email generation error:', error);
    return new Response(JSON.stringify({ error: '生成失败，请稍后重试' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
