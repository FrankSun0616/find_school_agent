import { NextRequest, NextResponse } from 'next/server';
import { chatComplete, resolveConfig, AIProvider } from '@/lib/ai-client';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('cv') as File;
    const provider = formData.get('provider') as AIProvider | undefined;
    const apiKey = formData.get('apiKey') as string | undefined;
    const config = resolveConfig(provider, apiKey);

    if (!config.apiKey) {
      return NextResponse.json({ error: '请先在设置中配置 API Key' }, { status: 400 });
    }
    if (!file) {
      return NextResponse.json({ error: '请上传简历文件' }, { status: 400 });
    }

    let cvText = '';

    if (file.type === 'application/pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require('pdf-parse');
        const pdfData = await pdfParse(buffer);
        cvText = pdfData.text;
      } catch (pdfErr) {
        console.error('PDF parse error:', pdfErr);
        return NextResponse.json({ error: 'PDF解析失败，请尝试上传文本格式的简历' }, { status: 400 });
      }
    } else if (file.type === 'text/plain') {
      cvText = await file.text();
    } else {
      return NextResponse.json({ error: '仅支持PDF或TXT格式的简历' }, { status: 400 });
    }

    if (!cvText || cvText.trim().length < 50) {
      return NextResponse.json({ error: '无法从文件中提取文本，请确保PDF不是扫描件' }, { status: 400 });
    }

    const system = `你是一位专业的留学顾问助手。请从以下简历文本中提取关键信息，返回严格的JSON格式，不要包含任何其他文字。

提取以下字段：
- name: 姓名（字符串）
- education: 教育背景（数组，每项包含school, degree, major, gpa, year）
- gpa: 最高学历GPA（字符串，如 "3.8/4.0"）
- research: 研究经历（数组，每项包含title, description, duration）
- publications: 发表论文（数组，每项包含title, journal, year）
- internships: 实习/工作经历（数组，每项包含company, role, duration, description）
- skills: 技能（数组，字符串列表）
- targetField: 目标研究方向（字符串，基于简历内容推断）
- languages: 语言能力（数组，每项包含language, level）
- awards: 奖项荣誉（数组，字符串列表）
- summary: 申请优势总结（字符串，中文，100字以内）

返回格式示例：
{
  "name": "张三",
  "education": [{"school": "北京大学", "degree": "本科", "major": "计算机科学", "gpa": "3.8/4.0", "year": "2024"}],
  "gpa": "3.8/4.0",
  "research": [{"title": "深度学习研究", "description": "研究描述", "duration": "2022-2023"}],
  "publications": [],
  "internships": [],
  "skills": ["Python", "Machine Learning"],
  "targetField": "人工智能/机器学习",
  "languages": [{"language": "中文", "level": "母语"}, {"language": "英语", "level": "托福105"}],
  "awards": [],
  "summary": "申请优势总结"
}`;

    const text = await chatComplete(
      config,
      system,
      `请分析以下简历内容并提取信息：\n\n${cvText}`,
      2000,
    );

    let profile;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');
      profile = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json({ error: '简历解析失败，请重试' }, { status: 500 });
    }

    return NextResponse.json({ profile, rawText: cvText.substring(0, 500) });
  } catch (error) {
    console.error('CV analysis error:', error);
    return NextResponse.json({ error: '服务器错误，请稍后重试' }, { status: 500 });
  }
}
