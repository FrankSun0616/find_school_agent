import { NextRequest } from 'next/server';
import { chatStream, resolveConfig } from '@/lib/ai-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile, schoolName, programName, provider, apiKey } = body;

    const config = resolveConfig(provider, apiKey);
    if (!config.apiKey) {
      return new Response(JSON.stringify({ error: '请先在设置中配置 API Key' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (!profile) {
      return new Response(JSON.stringify({ error: '缺少必要参数' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const system = `You are an expert resume consultant specializing in graduate school applications.
Create an optimized academic CV/resume in a clean, professional format.
Use action verbs, quantify achievements where possible, and tailor content to the target program.
Format with clear sections: Education, Research Experience, Publications, Work Experience, Skills, Awards.
Write in English. Make it ATS-friendly and academically appropriate.`;

    const userMessage = `Create an optimized academic resume/CV for this student${schoolName ? ` applying to ${programName} at ${schoolName}` : ''}.

Student Profile:
${JSON.stringify(profile, null, 2)}

Please:
1. First provide 3-5 key optimization suggestions in Chinese
2. Then write "---RESUME---"
3. Then provide the complete optimized resume in English

Format the resume with clear sections and bullet points.`;

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
    console.error('Resume optimization error:', error);
    return new Response(JSON.stringify({ error: '优化失败，请稍后重试' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
