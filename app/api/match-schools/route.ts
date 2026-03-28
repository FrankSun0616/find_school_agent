import { NextRequest, NextResponse } from 'next/server';
import { chatComplete, resolveConfig } from '@/lib/ai-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile, targetField, country, provider, apiKey } = body;

    const config = resolveConfig(provider, apiKey);
    if (!config.apiKey) {
      return NextResponse.json({ error: '请先在设置中配置 API Key' }, { status: 400 });
    }
    if (!profile || !targetField) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }
    const profileSummary = JSON.stringify(profile, null, 2);
    const targetCountry = country || '美国/英国/加拿大/澳洲';

    const system = `你是顶级留学申请顾问，有丰富的${targetCountry}顶尖大学申请经验。
根据学生背景推荐适合的硕士学校和项目，分为保底/匹配/冲刺三个层次。
返回严格的JSON格式，不要包含任何其他文字。

推荐15-20所学校，每所学校包含：
- schoolName: 学校名称（英文）
- schoolNameCn: 学校中文名
- programName: 项目名称
- location: 地区（如 "美国·麻省"）
- ranking: 排名信息（如 "QS全球第5"）
- matchReason: 推荐理由（中文，50字以内）
- tier: 难度层次（"保底" | "匹配" | "冲刺"）
- deadline: 申请截止时间（如 "12月1日"）
- requirements: 主要要求（如 "GRE 320+, GPA 3.5+"）
- website: 官网链接（真实链接）

返回格式：
{
  "schools": [...]
}`;

    const text = await chatComplete(
      config,
      system,
      `学生背景信息：\n${profileSummary}\n\n目标方向：${targetField}\n\n申请类型：硕士(Master)\n\n请推荐合适的学校和项目。`,
      6000,
      config.provider === 'anthropic', // useThinking only for Anthropic
    );

    let result;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');
      result = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json({ error: '推荐结果解析失败，请重试' }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('School matching error:', error);
    return NextResponse.json({ error: '服务器错误，请稍后重试' }, { status: 500 });
  }
}
