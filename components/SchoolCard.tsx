'use client';

import { MapPin, Clock, ChevronRight, ExternalLink } from 'lucide-react';

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

interface SchoolCardProps {
  school: School;
  onSelect: (school: School) => void;
  isSelected?: boolean;
}

const tierConfig = {
  保底: {
    color: 'bg-green-100 text-green-700 border-green-200',
    badge: 'bg-green-500',
    border: 'border-green-200 hover:border-green-400',
    ring: 'ring-green-400',
  },
  匹配: {
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    badge: 'bg-blue-500',
    border: 'border-blue-200 hover:border-blue-400',
    ring: 'ring-blue-400',
  },
  冲刺: {
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    badge: 'bg-orange-500',
    border: 'border-orange-200 hover:border-orange-400',
    ring: 'ring-orange-400',
  },
};

export default function SchoolCard({ school, onSelect, isSelected }: SchoolCardProps) {
  const config = tierConfig[school.tier] || tierConfig['匹配'];

  return (
    <div
      className={`bg-white rounded-xl border-2 p-5 cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected
          ? `${config.border} ring-2 ${config.ring} shadow-md`
          : `${config.border}`
      }`}
      onClick={() => onSelect(school)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${config.color}`}>
              {school.tier}
            </span>
            {school.ranking && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {school.ranking}
              </span>
            )}
          </div>
          <h3 className="font-bold text-gray-900 mt-2 text-lg leading-tight">
            {school.schoolNameCn}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">{school.schoolName}</p>
          <p className="text-sm font-medium text-blue-600 mt-1">{school.programName}</p>
        </div>
        <ChevronRight
          className={`w-5 h-5 flex-shrink-0 mt-1 transition-transform ${
            isSelected ? 'rotate-90 text-blue-600' : 'text-gray-300'
          }`}
        />
      </div>

      <p className="text-sm text-gray-600 mt-3 line-clamp-2">{school.matchReason}</p>

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
        {school.location && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {school.location}
          </span>
        )}
        {school.deadline && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            截止: {school.deadline}
          </span>
        )}
      </div>

      {school.requirements && (
        <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
          <span className="font-medium text-gray-600">要求：</span>
          {school.requirements}
        </div>
      )}

      {school.website && (
        <a
          href={school.website}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="mt-2 inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          官方网站
        </a>
      )}
    </div>
  );
}
