'use client';

import { ExternalLink, Mail, BookOpen, ChevronRight } from 'lucide-react';

interface Paper {
  title: string;
  year?: string | number;
}

interface Professor {
  professorName: string;
  university: string;
  universityCn: string;
  department?: string;
  researchArea: string;
  recentPapers?: Paper[];
  matchReason: string;
  tier: '积极推荐' | '重点联系' | '大胆尝试';
  labWebsite?: string;
  emailHint?: string;
}

interface ProfessorCardProps {
  professor: Professor;
  onGenerateEmail: (professor: Professor) => void;
  onSelect: (professor: Professor) => void;
  isSelected?: boolean;
}

const tierConfig = {
  积极推荐: {
    color: 'bg-green-100 text-green-700 border-green-200',
    border: 'border-green-200 hover:border-green-400',
    ring: 'ring-green-400',
  },
  重点联系: {
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    border: 'border-blue-200 hover:border-blue-400',
    ring: 'ring-blue-400',
  },
  大胆尝试: {
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    border: 'border-purple-200 hover:border-purple-400',
    ring: 'ring-purple-400',
  },
};

export default function ProfessorCard({
  professor,
  onGenerateEmail,
  onSelect,
  isSelected,
}: ProfessorCardProps) {
  const config = tierConfig[professor.tier] || tierConfig['重点联系'];

  return (
    <div
      className={`bg-white rounded-xl border-2 p-5 cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected
          ? `${config.border} ring-2 ${config.ring} shadow-md`
          : config.border
      }`}
      onClick={() => onSelect(professor)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${config.color}`}>
              {professor.tier}
            </span>
          </div>
          <h3 className="font-bold text-gray-900 mt-2 text-lg">
            Prof. {professor.professorName}
          </h3>
          <p className="text-sm font-medium text-blue-600">{professor.universityCn}</p>
          <p className="text-xs text-gray-500">{professor.university}</p>
          {professor.department && (
            <p className="text-xs text-gray-500">{professor.department}</p>
          )}
        </div>
        <ChevronRight
          className={`w-5 h-5 flex-shrink-0 mt-1 transition-transform ${
            isSelected ? 'rotate-90 text-blue-600' : 'text-gray-300'
          }`}
        />
      </div>

      <div className="mt-3">
        <div className="text-xs font-medium text-gray-500 mb-1">研究方向</div>
        <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">
          {professor.researchArea}
        </p>
      </div>

      {professor.recentPapers && professor.recentPapers.length > 0 && (
        <div className="mt-3">
          <div className="flex items-center gap-1 text-xs font-medium text-gray-500 mb-1">
            <BookOpen className="w-3 h-3" />
            近期论文
          </div>
          {professor.recentPapers.slice(0, 2).map((paper, idx) => (
            <div key={idx} className="text-xs text-gray-600 mt-1 line-clamp-1">
              · {paper.title}{paper.year && ` (${paper.year})`}
            </div>
          ))}
        </div>
      )}

      <p className="text-sm text-gray-600 mt-3 line-clamp-2">{professor.matchReason}</p>

      {professor.emailHint && (
        <div className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 border border-amber-200">
          <span className="font-medium">邮件建议：</span>
          {professor.emailHint}
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onGenerateEmail(professor);
          }}
          className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
        >
          <Mail className="w-4 h-4" />
          生成陶瓷邮件
        </button>
        {professor.labWebsite && (
          <a
            href={professor.labWebsite}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 border border-blue-200 rounded-lg px-3 py-2 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            主页
          </a>
        )}
      </div>
    </div>
  );
}
