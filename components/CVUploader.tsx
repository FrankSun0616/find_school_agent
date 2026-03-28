'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, Loader2 } from 'lucide-react';

interface CVUploaderProps {
  onUploadComplete: (profile: object) => void;
  onError: (error: string) => void;
}

export default function CVUploader({ onUploadComplete, onError }: CVUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState('');

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setUploadedFile(file);
      setUploading(true);
      setProgress('正在上传文件...');

      try {
        const formData = new FormData();
        formData.append('cv', file);

        setProgress('AI正在分析简历内容...');

        const response = await fetch('/api/analyze-cv', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '上传失败');
        }

        setProgress('分析完成！');
        onUploadComplete(data.profile);
      } catch (err) {
        const message = err instanceof Error ? err.message : '上传失败，请重试';
        onError(message);
        setUploadedFile(null);
      } finally {
        setUploading(false);
        setProgress('');
      }
    },
    [onUploadComplete, onError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: uploading,
  });

  const removeFile = () => {
    setUploadedFile(null);
  };

  if (uploading) {
    return (
      <div className="border-2 border-dashed border-blue-300 rounded-xl p-10 text-center bg-blue-50">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
        <p className="text-blue-600 font-medium">{progress}</p>
        <p className="text-sm text-blue-400 mt-2">请稍候，AI正在智能解析您的简历...</p>
        <div className="mt-4 bg-blue-200 rounded-full h-2 w-48 mx-auto overflow-hidden">
          <div className="bg-blue-600 h-full rounded-full animate-pulse" style={{ width: '70%' }} />
        </div>
      </div>
    );
  }

  if (uploadedFile) {
    return (
      <div className="border-2 border-green-300 rounded-xl p-6 bg-green-50 flex items-center gap-4">
        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <FileText className="w-6 h-6 text-green-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-green-800 truncate">{uploadedFile.name}</p>
          <p className="text-sm text-green-600">
            {(uploadedFile.size / 1024).toFixed(1)} KB · 已分析完成
          </p>
        </div>
        <button
          onClick={removeFile}
          className="p-2 hover:bg-green-200 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-green-600" />
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
        isDragActive
          ? 'border-blue-500 bg-blue-50 scale-105'
          : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center ${
            isDragActive ? 'bg-blue-100' : 'bg-gray-100'
          }`}
        >
          <Upload
            className={`w-8 h-8 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`}
          />
        </div>
        <div>
          <p className="font-semibold text-gray-700">
            {isDragActive ? '释放文件即可上传' : '拖拽简历到此处，或点击上传'}
          </p>
          <p className="text-sm text-gray-500 mt-1">支持 PDF、TXT 格式，最大 10MB</p>
        </div>
        <div className="flex gap-2 mt-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            PDF
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            TXT
          </span>
        </div>
      </div>
    </div>
  );
}
