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

    const system = `你是专业的PhD申请顾问，熟悉各领域${targetCountry}顶尖教授的研究方向。
根据学生背景和研究兴趣，推荐合适的博士导师，并说明匹配原因。
返回严格的JSON格式，不要包含任何其他文字。

推荐10-15位教授，每位教授包含：
- professorName: 教授姓名
- university: 所在大学（英文）
- universityCn: 所在大学（中文）
- department: 所在院系
- researchArea: 研究方向（中文描述）
- recentPapers: 近期代表论文（数组，1-2篇，包含title和year）
- matchReason: 匹配原因（中文，50字以内）
- tier: 申请难度（"积极推荐" | "重点联系" | "大胆尝试"）
- labWebsite: 实验室/个人主页（真实或示例链接格式）
- emailHint: 陶瓷邮件建议（中文，提示如何写邮件切入点）

返回格式：
{
  "professors": [...]
}`;

    const text = await chatComplete(
      config,
      system,
      `学生背景信息：\n${profileSummary}\n\n目标方向：${targetField}\n\n申请类型：博士(PhD)\n\n请推荐合适的博士导师。`,
      6000,
      config.provider === 'anthropic',
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
    console.error('Professor matching error:', error);
    return NextResponse.json({ error: '服务器错误，请稍后重试' }, { status: 500 });
  }
}
