import { Gauge } from 'lucide-react';

interface DifficultyCardProps {
  level: 'easy' | 'moderate' | 'hard' | 'very_hard';
  reasoning: string;
}

const difficultyConfig = {
  easy: {
    label: '简单',
    color: 'text-green-600',
    bgColor: 'bg-green-500',
    lightBg: 'bg-green-50',
    percentage: 25,
    description: '人才供应充足，招聘周期短'
  },
  moderate: {
    label: '中等',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-500',
    lightBg: 'bg-yellow-50',
    percentage: 50,
    description: '需要一定时间筛选合适候选人'
  },
  hard: {
    label: '困难',
    color: 'text-orange-600',
    bgColor: 'bg-orange-500',
    lightBg: 'bg-orange-50',
    percentage: 75,
    description: '人才稀缺，可能需要较长招聘周期'
  },
  very_hard: {
    label: '非常困难',
    color: 'text-red-600',
    bgColor: 'bg-red-500',
    lightBg: 'bg-red-50',
    percentage: 100,
    description: '高度稀缺人才，建议调整需求或薪资'
  }
};

export function DifficultyCard({ level, reasoning }: DifficultyCardProps) {
  const config = difficultyConfig[level];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden h-full">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
        <Gauge className="w-5 h-5 text-accent-600" />
        <h2 className="font-semibold text-slate-900">招聘难度评估</h2>
      </div>

      <div className="p-4">
        {/* 难度指示器 */}
        <div className={`p-4 rounded-xl ${config.lightBg} mb-4`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-2xl font-bold ${config.color}`}>
              {config.label}
            </span>
            <span className={`text-sm ${config.color}`}>
              {config.percentage}%
            </span>
          </div>
          
          {/* 进度条 */}
          <div className="h-3 bg-white rounded-full overflow-hidden">
            <div 
              className={`h-full ${config.bgColor} rounded-full transition-all duration-500`}
              style={{ width: `${config.percentage}%` }}
            />
          </div>
          
          <p className="text-sm text-slate-600 mt-2">
            {config.description}
          </p>
        </div>

        {/* 详细分析 */}
        {reasoning && (
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-2">分析说明</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {reasoning}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
