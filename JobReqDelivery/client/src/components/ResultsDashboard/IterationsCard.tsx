import { useState } from 'react';
import { AgentIteration } from '../../types';
import { History, ChevronDown, ChevronUp, Brain, Search, UserCheck } from 'lucide-react';

interface IterationsCardProps {
  iterations: AgentIteration[];
}

export function IterationsCard({ iterations }: IterationsCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedIteration, setSelectedIteration] = useState<number | null>(null);

  if (iterations.length === 0) return null;

  const lastIteration = iterations[iterations.length - 1];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-slate-600" />
          <h2 className="font-semibold text-slate-900">分析迭代详情</h2>
          <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full text-xs font-medium">
            {iterations.length} 轮
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="p-4">
          {/* 迭代选择器 */}
          <div className="flex gap-2 mb-4">
            {iterations.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedIteration(selectedIteration === index ? null : index)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${selectedIteration === index
                    ? 'bg-primary-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }
                `}
              >
                第 {index + 1} 轮
              </button>
            ))}
          </div>

          {/* 迭代详情 */}
          {selectedIteration !== null && (
            <div className="space-y-4">
              <IterationDetail 
                iteration={iterations[selectedIteration]} 
                number={selectedIteration + 1}
              />
            </div>
          )}

          {/* 最终满意度 */}
          <div className="mt-4 p-4 bg-green-50 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-700">最终满意度评分</span>
              <span className="text-2xl font-bold text-green-600">
                {lastIteration.recruiterOutput.satisfactionScore}/10
              </span>
            </div>
            <p className="text-sm text-green-600 mt-2">
              {lastIteration.recruiterOutput.satisfactionReason}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function IterationDetail({ iteration, number }: { iteration: AgentIteration; number: number }) {
  const { analyzerOutput, researcherOutput, recruiterOutput } = iteration;

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-slate-900">第 {number} 轮分析结果</h3>
      
      {/* 需求分析师 */}
      <div className="p-4 bg-blue-50 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-blue-900">需求分析师</span>
        </div>
        <div className="text-sm text-blue-800 space-y-1">
          <p><strong>标准化职位：</strong>{analyzerOutput.standardizedTitle}</p>
          <p><strong>技术要求：</strong>{analyzerOutput.technicalSkills.slice(0, 3).join('、')}...</p>
          <p><strong>识别问题数：</strong>{analyzerOutput.clarifyingQuestions.length}</p>
        </div>
      </div>

      {/* 市场研究员 */}
      <div className="p-4 bg-emerald-50 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <Search className="w-4 h-4 text-emerald-600" />
          <span className="font-medium text-emerald-900">市场研究员</span>
        </div>
        <div className="text-sm text-emerald-800 space-y-1">
          <p><strong>相似职位：</strong>{researcherOutput.similarTitles.slice(0, 3).join('、')}</p>
          <p><strong>市场需求：</strong>{researcherOutput.industryBenchmarks.marketDemand}</p>
        </div>
      </div>

      {/* 招聘官 */}
      <div className="p-4 bg-purple-50 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <UserCheck className="w-4 h-4 text-purple-600" />
          <span className="font-medium text-purple-900">专业招聘官</span>
        </div>
        <div className="text-sm text-purple-800 space-y-1">
          <p><strong>满意度：</strong>{recruiterOutput.satisfactionScore}/10</p>
          <p><strong>已回答问题：</strong>{recruiterOutput.answeredQuestions.length}</p>
          <p><strong>待澄清问题：</strong>{recruiterOutput.openQuestions.length}</p>
        </div>
      </div>
    </div>
  );
}
