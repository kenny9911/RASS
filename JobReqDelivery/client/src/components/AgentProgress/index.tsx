import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { AgentCard } from './AgentCard';
import { ProgressTimeline } from './ProgressTimeline';
import { TokenUsageCard } from '../TokenUsage';
import { Brain, Search, UserCheck, Sparkles } from 'lucide-react';

const agents = [
  {
    id: 'analyzer',
    name: '需求分析师',
    description: '分析职位需求，识别关键要求',
    icon: Brain,
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700'
  },
  {
    id: 'researcher',
    name: '市场研究员',
    description: '研究人才市场，构建候选人画像',
    icon: Search,
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700'
  },
  {
    id: 'recruiter',
    name: '专业招聘官',
    description: '综合评估，制定搜索策略',
    icon: UserCheck,
    color: 'from-purple-500 to-pink-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700'
  }
];

export function AgentProgress() {
  const { state } = useApp();
  const { agentProgress, currentIteration, tokenUsage } = state;

  // 获取当前活跃的代理
  const getAgentStatus = (agentId: string) => {
    const events = agentProgress.filter(e => e.agent === agentId);
    const lastEvent = events[events.length - 1];
    
    if (!lastEvent) return 'pending';
    if (lastEvent.type === 'agent_start') return 'active';
    if (lastEvent.type === 'agent_complete') return 'completed';
    return 'pending';
  };

  // 获取代理的最新消息
  const getAgentMessage = (agentId: string) => {
    const events = agentProgress.filter(e => e.agent === agentId);
    const lastEvent = events[events.length - 1];
    return lastEvent?.message || '';
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 sm:pb-6">
      {/* 头部 */}
      <motion.div 
        className="text-center mb-6 sm:mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl gradient-accent mb-3 sm:mb-4 shadow-lg shadow-accent-600/25">
          <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">AI 智能分析中</h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1.5 sm:mt-2 px-4">
          三位AI专家正在协同分析您的职位需求
        </p>
        
        {/* 迭代指示器 */}
        <div className="mt-3 sm:mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full">
          <span className="text-sm text-primary-700">
            第 <span className="font-bold">{currentIteration || 1}</span> 轮分析
          </span>
          <span className="text-xs text-primary-500">（最多3轮）</span>
        </div>
      </motion.div>

      {/* 代理卡片 */}
      <div className="space-y-4 mb-8">
        {agents.map((agent, index) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            status={getAgentStatus(agent.id)}
            message={getAgentMessage(agent.id)}
            delay={index * 0.1}
          />
        ))}
      </div>

      {/* 进度时间线 */}
      <ProgressTimeline events={agentProgress} />

      {/* Token 使用量（实时更新） */}
      {tokenUsage && (
        <motion.div 
          className="mt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <TokenUsageCard tokenUsage={tokenUsage} isCompact={true} />
        </motion.div>
      )}

      {/* 底部提示 */}
      <motion.div 
        className="mt-8 text-center text-sm text-slate-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p>分析过程通常需要 30-60 秒</p>
        <p className="mt-1">请耐心等待，AI正在为您精心分析...</p>
      </motion.div>
    </div>
  );
}

export { AgentProgress as default };
