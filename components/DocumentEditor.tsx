'use client';

import { useState } from 'react';
import { Copy, Check, Download, Loader2 } from 'lucide-react';

interface DocumentEditorProps {
  title: string;
  content: string;
  isStreaming?: boolean;
  placeholder?: string;
  onRegenerate?: () => void;
}

export default function DocumentEditor({
  title,
  content,
  isStreaming,
  placeholder,
  onRegenerate,
}: DocumentEditorProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-gray-700">{title}</h4>
          {isStreaming && (
            <div className="flex items-center gap-1 text-xs text-blue-500">
              <Loader2 className="w-3 h-3 animate-spin" />
              生成中...
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onRegenerate && !isStreaming && (
            <button
              onClick={onRegenerate}
              className="text-xs text-gray-500 hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
            >
              重新生成
            </button>
          )}
          {content && (
            <>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-blue-600 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200 hover:border-blue-200"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-500" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    复制
                  </>
                )}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-blue-600 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200 hover:border-blue-200"
              >
                <Download className="w-3.5 h-3.5" />
                下载
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {content ? (
          <div className="font-mono text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
            {content}
            {isStreaming && (
              <span className="inline-block w-0.5 h-4 bg-blue-500 animate-pulse ml-0.5 align-text-bottom" />
            )}
          </div>
        ) : isStreaming ? (
          <div className="flex items-center gap-3 text-gray-400 mt-4">
            <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
            <span>AI 正在为您生成文档，请稍候...</span>
          </div>
        ) : (
          <div className="text-gray-400 text-sm mt-4 text-center">
            {placeholder || '点击生成按钮开始创建文档'}
          </div>
        )}
      </div>

      {content && (
        <div className="border-t border-gray-100 px-4 py-2 bg-gray-50">
          <span className="text-xs text-gray-400">
            约 {content.split(/\s+/).length} 词 · {content.length} 字符
          </span>
        </div>
      )}
    </div>
  );
}
