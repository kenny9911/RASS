import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { CandidateProfileCard } from './CandidateProfileCard';
import { KeywordsCard } from './KeywordsCard';
import { DifficultyCard } from './DifficultyCard';
import { QuestionsCard } from './QuestionsCard';
import { IterationsCard } from './IterationsCard';
import { TokenUsageCard } from '../TokenUsage';
import { CheckCircle2, Download, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

export function ResultsDashboard() {
  const { state, dispatch } = useApp();
  const { analysisResult, tokenUsage } = state;

  if (!analysisResult) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-slate-500">暂无分析结果</p>
      </div>
    );
  }

  const { finalOutput, iterations } = analysisResult;

  const handleExportJSON = () => {
    const data = JSON.stringify(analysisResult, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `职位分析结果_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('导出成功');
  };

  const handleNewAnalysis = () => {
    if (confirm('确定要开始新的分析吗？')) {
      dispatch({ type: 'RESET' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 sm:pb-6">
      {/* 头部 */}
      <motion.div 
        className="text-center mb-6 sm:mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-green-500 mb-3 sm:mb-4 shadow-lg shadow-green-500/25">
          <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">分析完成</h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1.5 sm:mt-2 px-4">
          经过 {iterations.length} 轮智能分析，为您生成以下结果
        </p>
      </motion.div>

      {/* 操作按钮 */}
      <motion.div 
        className="flex flex-col sm:flex-row justify-center gap-3 mb-6 sm:mb-8 px-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <button
          onClick={handleExportJSON}
          className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors gesture-feedback touch-target"
        >
          <Download className="w-4 h-4" />
          <span>导出 JSON</span>
        </button>
        <button
          onClick={handleNewAnalysis}
          className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 bg-primary-900 text-white rounded-xl hover:bg-primary-800 active:bg-primary-950 transition-colors gesture-feedback shadow-lg shadow-primary-900/25 touch-target"
        >
          <RotateCcw className="w-4 h-4" />
          <span>新建分析</span>
        </button>
      </motion.div>

      {/* 结果卡片网格 */}
      <div className="space-y-4 sm:space-y-6">
        {/* 候选人画像 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <CandidateProfileCard profile={finalOutput.candidateProfile} />
        </motion.div>

        {/* 两列布局：关键词 + 难度 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <KeywordsCard keywords={finalOutput.searchKeywords} />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <DifficultyCard 
              level={finalOutput.difficultyLevel} 
              reasoning={finalOutput.difficultyReasoning} 
            />
          </motion.div>
        </div>

        {/* 澄清问题 */}
        {finalOutput.clarifyingQuestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <QuestionsCard questions={finalOutput.clarifyingQuestions} />
          </motion.div>
        )}

        {/* Token 使用量统计 */}
        {tokenUsage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <TokenUsageCard tokenUsage={tokenUsage} />
          </motion.div>
        )}

        {/* 迭代详情 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <IterationsCard iterations={iterations} />
        </motion.div>
      </div>
    </div>
  );
}

export { ResultsDashboard as default };
