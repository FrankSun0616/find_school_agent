'use client';

import { useState, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  GraduationCap,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import StepIndicator from '@/components/StepIndicator';
import CVUploader from '@/components/CVUploader';
import ProfileDisplay from '@/components/ProfileDisplay';
import SchoolCard from '@/components/SchoolCard';
import ProfessorCard from '@/components/ProfessorCard';
import DocumentEditor from '@/components/DocumentEditor';

const STEPS = [
  { id: 1, title: '上传简历', description: 'AI智能解析' },
  { id: 2, title: '设置偏好', description: '申请类型' },
  { id: 3, title: '获取推荐', description: '学校/导师' },
  { id: 4, title: '生成材料', description: '文书生成' },
];

interface StudentProfile {
  name?: string;
  education?: Array<{ school: string; degree: string; major: string; gpa?: string; year?: string }>;
  gpa?: string;
  research?: Array<{ title: string; description: string; duration?: string }>;
  publications?: Array<{ title: string; journal?: string; year?: string | number }>;
  internships?: Array<{ company: string; role: string; duration?: string; description?: string }>;
  skills?: string[];
  targetField?: string;
  languages?: Array<{ language: string; level: string }>;
  awards?: string[];
  summary?: string;
}

interface School {
  schoolName: string;
  schoolNameCn: string;
  programName: string;
  location?: string;
  ranking?: string;
  matchReason: string;
  tier: '保底' | '匹配' | '冲刺';
  deadline?: string;
  requirements?: string;
  website?: string;
}

interface Professor {
  professorName: string;
  university: string;
  universityCn: string;
  department?: string;
  researchArea: string;
  recentPapers?: Array<{ title: string; year?: string | number }>;
  matchReason: string;
  tier: '积极推荐' | '重点联系' | '大胆尝试';
  labWebsite?: string;
  emailHint?: string;
}

type DocType = 'ps' | 'sop' | 'resume' | 'email';

function ApplyPageContent() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type') as 'phd' | 'master' | null;


  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [applyType, setApplyType] = useState<'phd' | 'master'>(initialType || 'master');
  const [targetField, setTargetField] = useState('');
  const [targetCountry, setTargetCountry] = useState('美国/英国/加拿大/澳洲');
  const [schools, setSchools] = useState<School[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null);
  const [error, setError] = useState('');
  const [activeDocTab, setActiveDocTab] = useState<DocType>('ps');
  const [docContents, setDocContents] = useState<Record<DocType, string>>({
    ps: '',
    sop: '',
    resume: '',
    email: '',
  });
  const [streamingDoc, setStreamingDoc] = useState<DocType | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [researchInterests, setResearchInterests] = useState('');

  const handleProfileUpload = (uploadedProfile: object) => {
    setProfile(uploadedProfile as StudentProfile);
    if ((uploadedProfile as StudentProfile).targetField) {
      setTargetField((uploadedProfile as StudentProfile).targetField || '');
    }
    setCurrentStep(2);
  };

  const handleGetRecommendations = async () => {
    if (!profile || !targetField.trim()) {
      setError('请先上传简历并填写目标方向');
      return;
    }

    setLoadingRecommendations(true);
    setError('');

    try {
      if (applyType === 'master') {
        const res = await fetch('/api/match-schools', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile, targetField, country: targetCountry }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || '推荐失败');
        setSchools(data.schools || []);
      } else {
        const res = await fetch('/api/match-professors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile, targetField, country: targetCountry }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || '推荐失败');
        setProfessors(data.professors || []);
      }
      setCurrentStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取推荐失败，请重试');
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStreamingDoc(null);
  };

  const generateDocument = async (docType: DocType) => {
    if (!profile) return;

    // Cancel any in-progress stream before starting a new one
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setActiveDocTab(docType);
    setStreamingDoc(docType);
    setDocContents((prev) => ({ ...prev, [docType]: '' }));

    try {
      let endpoint = '';
      let body: Record<string, unknown> = { profile };

      if (docType === 'ps') {
        endpoint = '/api/generate-ps';
        body = {
          profile,
          schoolName: selectedSchool?.schoolName || selectedProfessor?.university || '目标学校',
          programName: selectedSchool?.programName || `${applyType === 'phd' ? 'PhD' : 'Master'} Program`,
          additionalInfo,
        };
      } else if (docType === 'sop') {
        endpoint = '/api/generate-sop';
        body = {
          profile,
          schoolName: selectedSchool?.schoolName || selectedProfessor?.university || '目标学校',
          programName: selectedSchool?.programName || `${applyType === 'phd' ? 'PhD' : 'Master'} Program`,
          researchInterests: researchInterests || targetField,
          professorName: selectedProfessor?.professorName,
        };
      } else if (docType === 'resume') {
        endpoint = '/api/optimize-resume';
        body = {
          profile,
          schoolName: selectedSchool?.schoolName || selectedProfessor?.university,
          programName: selectedSchool?.programName,
        };
      } else if (docType === 'email') {
        if (!selectedProfessor && applyType !== 'phd') {
          setError('请先在上一步选择一位导师');
          setStreamingDoc(null);
          return;
        }
        endpoint = '/api/generate-email';
        body = {
          profile,
          professorName: selectedProfessor?.professorName || '目标导师',
          university: selectedProfessor?.university || '目标大学',
          researchArea: selectedProfessor?.researchArea || targetField,
          recentPapers: selectedProfessor?.recentPapers || [],
        };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '生成失败');
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('流读取失败');

      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setDocContents((prev) => ({ ...prev, [docType]: accumulated }));
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // User stopped — not an error
        return;
      }
      setError(err instanceof Error ? err.message : '生成失败，请重试');
    } finally {
      abortControllerRef.current = null;
      setStreamingDoc(null);
    }
  };

  const filteredSchools =
    tierFilter === 'all' ? schools : schools.filter((s) => s.tier === tierFilter);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">返回首页</span>
          </Link>
          <div className="h-4 border-l border-gray-200" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-800">AI留学申请</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Step Indicator */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <StepIndicator steps={STEPS} currentStep={currentStep} />
        </div>

        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-red-700 text-sm">{error}</span>
            <button
              onClick={() => setError('')}
              className="ml-auto text-red-400 hover:text-red-600 text-lg leading-none"
            >
              ×
            </button>
          </div>
        )}

        {/* Step 1: Upload CV */}
        {currentStep === 1 && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">上传你的简历</h2>
                <p className="text-gray-500 mt-2">AI将在30秒内分析你的背景，提取关键申请信息</p>
              </div>

              <CVUploader
                onUploadComplete={handleProfileUpload}
                onError={(msg) => setError(msg)}
              />

              <div className="mt-6 bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
                <p className="font-medium mb-1">提示：</p>
                <ul className="space-y-1 text-blue-600">
                  <li>· 支持PDF格式（需可复制文字，非扫描件）</li>
                  <li>· 简历越详细，推荐结果越精准</li>
                  <li>· 包含GPA、科研经历、论文等信息效果最佳</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Configure Preferences */}
        {currentStep === 2 && profile && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">申请设置</h2>

              {/* Apply Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">申请类型</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setApplyType('phd')}
                    className={`py-4 px-4 rounded-xl border-2 font-medium transition-all ${
                      applyType === 'phd'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg mb-1">🎓</div>
                    <div>博士 (PhD)</div>
                    <div className="text-xs mt-1 opacity-70">推荐导师</div>
                  </button>
                  <button
                    onClick={() => setApplyType('master')}
                    className={`py-4 px-4 rounded-xl border-2 font-medium transition-all ${
                      applyType === 'master'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg mb-1">📚</div>
                    <div>硕士 (Master)</div>
                    <div className="text-xs mt-1 opacity-70">推荐学校</div>
                  </button>
                </div>
              </div>

              {/* Target Field */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  目标研究方向 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={targetField}
                  onChange={(e) => setTargetField(e.target.value)}
                  placeholder="例如：机器学习、计算机视觉、金融工程..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Target Country */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">目标国家/地区</label>
                <div className="relative">
                  <select
                    value={targetCountry}
                    onChange={(e) => setTargetCountry(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                  >
                    <option value="美国/英国/加拿大/澳洲">全球顶尖（美/英/加/澳）</option>
                    <option value="美国">美国</option>
                    <option value="英国">英国</option>
                    <option value="加拿大">加拿大</option>
                    <option value="澳大利亚">澳大利亚</option>
                    <option value="欧洲">欧洲（含德/荷/瑞士）</option>
                    <option value="新加坡/香港">新加坡/香港</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Additional Info */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  补充信息（可选）
                </label>
                <textarea
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="例如：特别感兴趣的子方向、职业规划、其他背景..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  上一步
                </button>
                <button
                  onClick={handleGetRecommendations}
                  disabled={loadingRecommendations || !targetField.trim()}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2.5 px-6 rounded-xl text-sm font-medium transition-colors"
                >
                  {loadingRecommendations ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      AI分析中...
                    </>
                  ) : (
                    <>
                      获取{applyType === 'phd' ? '导师' : '学校'}推荐
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {loadingRecommendations && (
                <div className="mt-4 bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-blue-600 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    AI正在深度分析你的背景，智能匹配最适合的{applyType === 'phd' ? '导师' : '学校'}...
                  </div>
                  <p className="text-xs text-blue-400 mt-1">通常需要15-30秒，请耐心等待</p>
                </div>
              )}
            </div>

            {/* Profile Preview */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-700">已解析的简历信息</h3>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  重新上传
                </button>
              </div>
              <ProfileDisplay profile={profile} />
            </div>
          </div>
        )}

        {/* Step 3: Recommendations */}
        {currentStep === 3 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {applyType === 'master' ? '推荐学校列表' : '推荐导师列表'}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  共找到 {applyType === 'master' ? schools.length : professors.length} 个推荐结果
                  {selectedSchool && (
                    <span className="ml-2 text-blue-600">· 已选择：{selectedSchool.schoolNameCn}</span>
                  )}
                  {selectedProfessor && (
                    <span className="ml-2 text-blue-600">· 已选择：Prof. {selectedProfessor.professorName}</span>
                  )}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  重新设置
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  生成申请材料
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tier Filter for Schools */}
            {applyType === 'master' && schools.length > 0 && (
              <div className="flex gap-2 mb-5">
                {['all', '保底', '匹配', '冲刺'].map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setTierFilter(tier)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      tierFilter === tier
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {tier === 'all' ? '全部' : tier}
                    {tier !== 'all' && (
                      <span className="ml-1 text-xs opacity-70">
                        ({schools.filter((s) => s.tier === tier).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Schools Grid */}
            {applyType === 'master' && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSchools.map((school, idx) => (
                  <SchoolCard
                    key={idx}
                    school={school}
                    onSelect={(s) => setSelectedSchool(s)}
                    isSelected={selectedSchool?.schoolName === school.schoolName}
                  />
                ))}
              </div>
            )}

            {/* Professors Grid */}
            {applyType === 'phd' && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {professors.map((prof, idx) => (
                  <ProfessorCard
                    key={idx}
                    professor={prof}
                    onSelect={(p) => setSelectedProfessor(p)}
                    isSelected={selectedProfessor?.professorName === prof.professorName}
                    onGenerateEmail={(p) => {
                      setSelectedProfessor(p);
                      setCurrentStep(4);
                      setTimeout(() => generateDocument('email'), 100);
                    }}
                  />
                ))}
              </div>
            )}

            {/* Bottom CTA */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setCurrentStep(4)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-colors shadow-lg"
              >
                进入文书生成
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Document Generation */}
        {currentStep === 4 && (
          <div className="grid lg:grid-cols-[320px,1fr] gap-6">
            {/* Left Panel: Controls */}
            <div className="space-y-4">
              {/* Selected Target */}
              {(selectedSchool || selectedProfessor) && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="text-xs text-blue-500 font-medium mb-1">当前选择</div>
                  {selectedSchool ? (
                    <>
                      <div className="font-semibold text-blue-800">{selectedSchool.schoolNameCn}</div>
                      <div className="text-sm text-blue-600">{selectedSchool.programName}</div>
                    </>
                  ) : selectedProfessor ? (
                    <>
                      <div className="font-semibold text-blue-800">Prof. {selectedProfessor.professorName}</div>
                      <div className="text-sm text-blue-600">{selectedProfessor.universityCn}</div>
                    </>
                  ) : null}
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="mt-2 text-xs text-blue-500 hover:text-blue-700 underline"
                  >
                    更换目标
                  </button>
                </div>
              )}

              {/* Research Interests for SOP */}
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  研究兴趣（用于SOP）
                </label>
                <textarea
                  value={researchInterests}
                  onChange={(e) => setResearchInterests(e.target.value)}
                  placeholder="描述你具体的研究兴趣和方向..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Document Type Buttons */}
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-700 text-sm">生成文书</h3>
                  {streamingDoc && (
                    <button
                      onClick={stopStreaming}
                      className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 border border-red-200 transition-colors"
                    >
                      停止生成
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {[
                    { key: 'ps' as DocType, label: '个人陈述 (PS)', desc: '展示个人经历和动机' },
                    { key: 'sop' as DocType, label: '研究计划 (SOP)', desc: '阐述研究方向和计划' },
                    { key: 'resume' as DocType, label: '简历优化', desc: '优化英文简历' },
                    ...(applyType === 'phd'
                      ? [{ key: 'email' as DocType, label: '陶瓷邮件', desc: '发送给目标教授' }]
                      : []),
                  ].map((doc) => (
                    <button
                      key={doc.key}
                      onClick={() => generateDocument(doc.key)}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                        activeDocTab === doc.key && streamingDoc === doc.key
                          ? 'border-blue-500 bg-blue-50'
                          : activeDocTab === doc.key
                          ? 'border-blue-400 bg-blue-50'
                          : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm text-gray-800">{doc.label}</div>
                          <div className="text-xs text-gray-500">{doc.desc}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          {streamingDoc === doc.key && (
                            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                          )}
                          {docContents[doc.key] && streamingDoc !== doc.key && (
                            <span className="w-2 h-2 bg-green-400 rounded-full" />
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setCurrentStep(3)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                返回推荐列表
              </button>
            </div>

            {/* Right Panel: Document Editor */}
            <div className="min-h-[600px] flex flex-col">
              {/* Tabs */}
              <div className="flex gap-1 bg-white rounded-xl border border-gray-100 p-1 mb-4">
                {(['ps', 'sop', 'resume', ...(applyType === 'phd' ? ['email'] : [])] as DocType[]).map((tab) => {
                  const labels: Record<DocType, string> = {
                    ps: '个人陈述',
                    sop: '研究计划',
                    resume: '简历优化',
                    email: '陶瓷邮件',
                  };
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveDocTab(tab)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        activeDocTab === tab
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {labels[tab]}
                      {docContents[tab] && activeDocTab !== tab && (
                        <span className="ml-1 w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex-1" style={{ minHeight: '500px' }}>
                <DocumentEditor
                  title={
                    activeDocTab === 'ps'
                      ? '个人陈述 (Personal Statement)'
                      : activeDocTab === 'sop'
                      ? '研究计划 (Statement of Purpose)'
                      : activeDocTab === 'resume'
                      ? '简历优化 (Resume)'
                      : '陶瓷邮件 (Cold Email)'
                  }
                  content={docContents[activeDocTab]}
                  isStreaming={streamingDoc === activeDocTab}
                  placeholder={
                    activeDocTab === 'email'
                      ? '选择一位教授后，点击左侧"陶瓷邮件"按钮生成'
                      : '点击左侧按钮开始生成文书'
                  }
                  onRegenerate={() => generateDocument(activeDocTab)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>加载中...</span>
        </div>
      </div>
    }>
      <ApplyPageContent />
    </Suspense>
  );
}
