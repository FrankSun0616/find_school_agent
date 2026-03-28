'use client';

import { useState, useEffect } from 'react';
import { Settings, X, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { AIProvider, PROVIDERS } from '@/lib/ai-client';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
}

const STORAGE_KEY = 'ai_config';

function isValidApiKey(key: string): boolean {
  if (!key || key.trim().length < 8) return false;
  return [...key].every(c => c.charCodeAt(0) <= 127);
}

export function loadAIConfig(): AIConfig {
  if (typeof window === 'undefined') return { provider: 'anthropic', apiKey: '' };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AIConfig;
      // If the stored key contains non-ASCII characters it's corrupted — discard it
      if (parsed.apiKey && !isValidApiKey(parsed.apiKey)) {
        localStorage.removeItem(STORAGE_KEY);
        return { provider: parsed.provider || 'anthropic', apiKey: '' };
      }
      return parsed;
    }
  } catch {
    // ignore
  }
  return { provider: 'anthropic', apiKey: '' };
}

export function saveAIConfig(config: AIConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

interface AISettingsProps {
  config: AIConfig;
  onConfigChange: (config: AIConfig) => void;
}

export default function AISettings({ config, onConfigChange }: AISettingsProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<AIConfig>(config);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    setDraft(config);
  }, [config]);

  const handleSave = () => {
    saveAIConfig(draft);
    onConfigChange(draft);
    setOpen(false);
  };

  const hasKey = !!config.apiKey;

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <Settings className="w-4 h-4" />
        <span className="hidden sm:inline">{PROVIDERS[config.provider].name}</span>
        {hasKey ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
        ) : (
          <span className="w-2 h-2 rounded-full bg-red-400" />
        )}
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-lg">AI 模型设置</h2>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Provider selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">选择 AI 提供商</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(PROVIDERS) as AIProvider[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setDraft((d) => ({ ...d, provider: p }))}
                      className={`px-3 py-2.5 rounded-xl border-2 text-sm font-medium text-left transition-all ${
                        draft.provider === p
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {PROVIDERS[p].name}
                      <div className="text-xs opacity-60 mt-0.5 font-normal">{PROVIDERS[p].defaultModel}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* API Key input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={draft.apiKey}
                    onChange={(e) => setDraft((d) => ({ ...d, apiKey: e.target.value }))}
                    placeholder={`输入你的 ${PROVIDERS[draft.provider].name} API Key`}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">API Key 仅存储在浏览器本地，不会上传到服务器</p>
              </div>

              {/* Provider hints */}
              <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 space-y-1">
                {draft.provider === 'anthropic' && <p>从 <span className="font-medium">console.anthropic.com</span> 获取 API Key</p>}
                {draft.provider === 'openai' && <p>从 <span className="font-medium">platform.openai.com</span> 获取 API Key</p>}
                {draft.provider === 'deepseek' && <p>从 <span className="font-medium">platform.deepseek.com</span> 获取 API Key</p>}
                {draft.provider === 'gemini' && <p>从 <span className="font-medium">aistudio.google.com</span> 获取 API Key</p>}
              </div>
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={!draft.apiKey.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
