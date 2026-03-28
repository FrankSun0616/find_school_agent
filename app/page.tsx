import Link from 'next/link';
import {
  GraduationCap,
  FileText,
  Search,
  Mail,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  BookOpen,
  Globe,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">留学AI助手</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/apply"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              开始申请
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white">
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-400 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-blue-300 rounded-full blur-3xl opacity-20" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 sm:py-32">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              由 Claude AI 强力驱动
            </div>

            <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight mb-6">
              AI留学申请助手
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mb-4">
              上传简历，AI智能分析你的背景，精准推荐学校/教授，一键生成申请材料
            </p>
            <p className="text-lg text-blue-200 max-w-xl mb-10">
              支持 PhD 博士 & 硕士申请 · 美国/英国/加拿大/澳洲
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/apply?type=phd"
                className="group flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 font-bold py-4 px-8 rounded-xl text-lg transition-all shadow-lg hover:shadow-xl"
              >
                <GraduationCap className="w-5 h-5" />
                申请博士 (PhD)
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/apply?type=master"
                className="group flex items-center gap-2 bg-blue-500/30 hover:bg-blue-500/40 border border-white/30 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all"
              >
                <BookOpen className="w-5 h-5" />
                申请硕士 (Master)
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L1440 80L1440 30C1200 80 900 10 720 40C540 70 240 10 0 30L0 80Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">一站式AI留学申请</h2>
          <p className="text-gray-500 text-lg">从简历分析到材料生成，全程AI智能辅助</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<FileText className="w-6 h-6" />}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            title="智能简历解析"
            description="上传PDF简历，AI自动提取教育背景、GPA、科研经历、发表论文等关键信息"
          />
          <FeatureCard
            icon={<Search className="w-6 h-6" />}
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
            title="精准学校匹配"
            description="根据你的背景，AI推荐15-20所保底/匹配/冲刺学校，含专业、截止日期、申请要求"
          />
          <FeatureCard
            icon={<Users className="w-6 h-6" />}
            iconBg="bg-green-100"
            iconColor="text-green-600"
            title="导师智能推荐"
            description="PhD申请专属，匹配10-15位方向契合的顶尖导师，含研究领域和邮件建议"
          />
          <FeatureCard
            icon={<Mail className="w-6 h-6" />}
            iconBg="bg-orange-100"
            iconColor="text-orange-600"
            title="材料一键生成"
            description="AI流式生成PS、SOP、简历优化和陶瓷邮件，专业英文，直接可用"
          />
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">三步开始你的申请</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: '上传简历',
                desc: '上传你的PDF或TXT格式简历，AI在30秒内完成智能解析',
                color: 'bg-blue-600',
              },
              {
                step: '02',
                title: '获取推荐',
                desc: '选择PhD或硕士，输入目标方向，AI为你推荐最匹配的学校和导师',
                color: 'bg-purple-600',
              },
              {
                step: '03',
                title: '生成材料',
                desc: '一键生成申请所需的所有文书材料，包括PS、SOP、陶瓷邮件',
                color: 'bg-green-600',
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center">
                <div
                  className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg`}
                >
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">为什么选择AI留学助手？</h2>
            <div className="space-y-4">
              {[
                '节省数周的前期调研时间',
                '覆盖美国/英国/加拿大/澳洲顶尖大学',
                'AI深度分析，推荐比传统中介更精准',
                '文书质量媲美专业留学顾问',
                '支持PhD和硕士两种申请路径',
                '免费使用，无额外收费',
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
            <Link
              href="/apply"
              className="mt-8 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
            >
              立即免费使用
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: <Globe className="w-8 h-8" />, label: '覆盖国家', value: '4+', color: 'bg-blue-50 text-blue-600' },
              { icon: <GraduationCap className="w-8 h-8" />, label: '推荐学校', value: '20所', color: 'bg-purple-50 text-purple-600' },
              { icon: <Users className="w-8 h-8" />, label: '推荐导师', value: '15位', color: 'bg-green-50 text-green-600' },
              { icon: <FileText className="w-8 h-8" />, label: '生成文书', value: '4类', color: 'bg-orange-50 text-orange-600' },
            ].map((stat, idx) => (
              <div key={idx} className={`${stat.color} rounded-2xl p-6 text-center`}>
                <div className="flex justify-center mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm font-medium mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-16 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">准备好开始你的留学申请了吗？</h2>
          <p className="text-blue-100 mb-8 text-lg">上传简历，3分钟获取个性化申请方案</p>
          <Link
            href="/apply"
            className="inline-flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 font-bold py-4 px-8 rounded-xl text-lg transition-all shadow-lg"
          >
            <Sparkles className="w-5 h-5" />
            开始AI申请分析
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-gray-400 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-600">留学AI助手</span>
        </div>
        <p>由 Claude AI 提供支持 · 专为留学申请设计</p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  iconBg,
  iconColor,
  title,
  description,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 ${iconBg} ${iconColor} rounded-xl flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}
