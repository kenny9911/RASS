import { CandidateProfile } from '../../types';
import { User, Briefcase, GraduationCap, Sparkles, Target, Heart } from 'lucide-react';

interface CandidateProfileCardProps {
  profile: CandidateProfile;
}

export function CandidateProfileCard({ profile }: CandidateProfileCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-primary-900 to-primary-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">理想候选人画像</h2>
            <p className="text-sm text-white/70">基于AI分析的最佳匹配人选特征</p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* 概述 */}
        {profile.summary && (
          <div className="p-4 bg-accent-50 rounded-xl border border-accent-100">
            <p className="text-slate-700 leading-relaxed">{profile.summary}</p>
          </div>
        )}

        {/* 理想背景 */}
        {profile.idealBackground && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-accent-600" />
              <h3 className="font-medium text-slate-900">理想背景</h3>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed pl-6">
              {profile.idealBackground}
            </p>
          </div>
        )}

        {/* 技能要求 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 必备技能 */}
          {profile.requiredSkills.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-red-500" />
                <h3 className="font-medium text-slate-900">必备技能</h3>
              </div>
              <div className="flex flex-wrap gap-2 pl-6">
                {profile.requiredSkills.map((skill, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 加分技能 */}
          {profile.preferredSkills.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="font-medium text-slate-900">加分技能</h3>
              </div>
              <div className="flex flex-wrap gap-2 pl-6">
                {profile.preferredSkills.map((skill, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 经验和学历 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {profile.experienceLevel && (
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <Briefcase className="w-5 h-5 text-slate-500 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500">经验要求</p>
                <p className="text-sm font-medium text-slate-900">{profile.experienceLevel}</p>
              </div>
            </div>
          )}
          
          {profile.educationLevel && (
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <GraduationCap className="w-5 h-5 text-slate-500 mt-0.5" />
              <div>
                <p className="text-xs text-slate-500">学历要求</p>
                <p className="text-sm font-medium text-slate-900">{profile.educationLevel}</p>
              </div>
            </div>
          )}
        </div>

        {/* 性格特质 */}
        {profile.personalityTraits.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-pink-500" />
              <h3 className="font-medium text-slate-900">性格特质</h3>
            </div>
            <div className="flex flex-wrap gap-2 pl-6">
              {profile.personalityTraits.map((trait, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-sm"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
