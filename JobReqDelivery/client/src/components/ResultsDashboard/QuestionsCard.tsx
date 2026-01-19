import { useState } from 'react';
import { ClarifyingQuestion } from '../../types';
import { HelpCircle, ChevronDown, ChevronUp, AlertCircle, MessageCircle } from 'lucide-react';

interface QuestionsCardProps {
  questions: ClarifyingQuestion[];
}

const priorityConfig = {
  high: {
    label: '高',
    color: 'text-red-600 bg-red-100',
    dot: 'bg-red-500'
  },
  medium: {
    label: '中',
    color: 'text-yellow-600 bg-yellow-100',
    dot: 'bg-yellow-500'
  },
  low: {
    label: '低',
    color: 'text-green-600 bg-green-100',
    dot: 'bg-green-500'
  }
};

export function QuestionsCard({ questions }: QuestionsCardProps) {
  const [expanded, setExpanded] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const highPriorityCount = questions.filter(q => q.priority === 'high').length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 bg-amber-50 border-b border-amber-100 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-600" />
          <h2 className="font-semibold text-slate-900">待澄清问题</h2>
          <span className="px-2 py-0.5 bg-amber-200 text-amber-800 rounded-full text-xs font-medium">
            {questions.length}
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
          {/* 提示 */}
          {highPriorityCount > 0 && (
            <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl mb-4">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">
                有 {highPriorityCount} 个高优先级问题需要与客户确认，这些问题可能影响招聘效果
              </p>
            </div>
          )}

          {/* 问题列表 */}
          <div className="space-y-3">
            {questions.map((question, index) => {
              const priority = priorityConfig[question.priority];
              
              return (
                <div 
                  key={question.id || index}
                  className="p-4 bg-slate-50 rounded-xl"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full ${priority.dot} mt-2 flex-shrink-0`} />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-slate-800 font-medium">
                          {question.question}
                        </p>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${priority.color}`}>
                          {priority.label}优先
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                        <span className="px-2 py-0.5 bg-slate-200 rounded">
                          {question.category}
                        </span>
                      </div>

                      {/* 回答输入框 */}
                      <div className="relative">
                        <MessageCircle className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <textarea
                          value={answers[question.id] || ''}
                          onChange={(e) => setAnswers(prev => ({
                            ...prev,
                            [question.id]: e.target.value
                          }))}
                          placeholder="在此输入答案（可选）..."
                          rows={2}
                          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm resize-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 操作按钮 */}
          <div className="mt-4 flex justify-end">
            <button 
              className="px-4 py-2 bg-accent-500 text-white rounded-lg text-sm font-medium hover:bg-accent-600 transition-colors disabled:opacity-50"
              disabled={Object.keys(answers).length === 0}
            >
              提交答案并重新分析
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
