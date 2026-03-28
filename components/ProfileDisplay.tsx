'use client';

import { GraduationCap, BookOpen, Briefcase, Award, Code, Globe, Star } from 'lucide-react';

interface Education {
  school: string;
  degree: string;
  major: string;
  gpa?: string;
  year?: string;
}

interface Research {
  title: string;
  description: string;
  duration?: string;
}

interface Publication {
  title: string;
  journal?: string;
  year?: string | number;
}

interface Internship {
  company: string;
  role: string;
  duration?: string;
  description?: string;
}

interface Language {
  language: string;
  level: string;
}

interface StudentProfile {
  name?: string;
  education?: Education[];
  gpa?: string;
  research?: Research[];
  publications?: Publication[];
  internships?: Internship[];
  skills?: string[];
  targetField?: string;
  languages?: Language[];
  awards?: string[];
  summary?: string;
}

interface ProfileDisplayProps {
  profile: StudentProfile;
}

export default function ProfileDisplay({ profile }: ProfileDisplayProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">{profile.name || '申请人'}</h3>
            <p className="text-blue-100 text-sm">{profile.targetField || '目标方向待定'}</p>
          </div>
          {profile.gpa && (
            <div className="ml-auto text-right">
              <div className="text-2xl font-bold">{profile.gpa}</div>
              <div className="text-blue-200 text-xs">GPA</div>
            </div>
          )}
        </div>
        {profile.summary && (
          <div className="mt-3 bg-white/10 rounded-lg p-3 text-sm text-blue-50">
            {profile.summary}
          </div>
        )}
      </div>

      <div className="p-6 space-y-5">
        {/* Education */}
        {profile.education && profile.education.length > 0 && (
          <Section icon={<GraduationCap className="w-4 h-4" />} title="教育背景">
            {profile.education.map((edu, idx) => (
              <div key={idx} className="flex items-start gap-3 py-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-800">{edu.school}</div>
                  <div className="text-sm text-gray-600">
                    {edu.degree} · {edu.major}
                    {edu.gpa && <span className="ml-2 text-blue-600 font-medium">GPA: {edu.gpa}</span>}
                    {edu.year && <span className="ml-2 text-gray-400">{edu.year}</span>}
                  </div>
                </div>
              </div>
            ))}
          </Section>
        )}

        {/* Research */}
        {profile.research && profile.research.length > 0 && (
          <Section icon={<BookOpen className="w-4 h-4" />} title="研究经历">
            {profile.research.map((res, idx) => (
              <div key={idx} className="flex items-start gap-3 py-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-800">{res.title}</div>
                  {res.description && (
                    <div className="text-sm text-gray-600 mt-0.5 line-clamp-2">{res.description}</div>
                  )}
                  {res.duration && (
                    <div className="text-xs text-gray-400 mt-0.5">{res.duration}</div>
                  )}
                </div>
              </div>
            ))}
          </Section>
        )}

        {/* Publications */}
        {profile.publications && profile.publications.length > 0 && (
          <Section icon={<Star className="w-4 h-4" />} title="发表论文">
            {profile.publications.map((pub, idx) => (
              <div key={idx} className="flex items-start gap-3 py-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-800 text-sm">{pub.title}</div>
                  {(pub.journal || pub.year) && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      {pub.journal}{pub.year && ` · ${pub.year}`}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </Section>
        )}

        {/* Internships */}
        {profile.internships && profile.internships.length > 0 && (
          <Section icon={<Briefcase className="w-4 h-4" />} title="实习/工作经历">
            {profile.internships.map((intern, idx) => (
              <div key={idx} className="flex items-start gap-3 py-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-800">{intern.company}</div>
                  <div className="text-sm text-gray-600">
                    {intern.role}
                    {intern.duration && <span className="ml-2 text-gray-400">{intern.duration}</span>}
                  </div>
                </div>
              </div>
            ))}
          </Section>
        )}

        {/* Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <Section icon={<Code className="w-4 h-4" />} title="技能">
            <div className="flex flex-wrap gap-2 mt-1">
              {profile.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Languages */}
        {profile.languages && profile.languages.length > 0 && (
          <Section icon={<Globe className="w-4 h-4" />} title="语言能力">
            <div className="flex flex-wrap gap-2 mt-1">
              {profile.languages.map((lang, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium"
                >
                  {lang.language}: {lang.level}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Awards */}
        {profile.awards && profile.awards.length > 0 && (
          <Section icon={<Award className="w-4 h-4" />} title="奖项荣誉">
            <div className="flex flex-wrap gap-2 mt-1">
              {profile.awards.map((award, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm"
                >
                  🏆 {award}
                </span>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
        <span className="text-blue-600">{icon}</span>
        {title}
      </div>
      <div className="pl-2">{children}</div>
    </div>
  );
}
