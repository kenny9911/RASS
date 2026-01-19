import { motion } from 'framer-motion';
import { Coins, Clock, Zap, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { AnalysisTokenUsage, TokenUsage } from '../../types';

interface TokenUsageCardProps {
  tokenUsage: AnalysisTokenUsage | null;
  isCompact?: boolean;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}

function formatCost(cost: number): string {
  if (cost < 0.01) {
    return `$${cost.toFixed(6)}`;
  }
  if (cost < 1) {
    return `$${cost.toFixed(4)}`;
  }
  return `$${cost.toFixed(2)}`;
}

function formatLatency(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(1)}s`;
}

function AgentUsageRow({ 
  name, 
  usage, 
  color 
}: { 
  name: string; 
  usage: TokenUsage; 
  color: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <span className="text-sm text-slate-600">{name}</span>
      </div>
      <div className="flex items-center gap-4 text-xs">
        <span className="text-slate-500">
          <span className="font-medium text-slate-700">{formatNumber(usage.totalTokens)}</span> tokens
        </span>
        <span className="text-emerald-600 font-medium">
          {formatCost(usage.cost || 0)}
        </span>
      </div>
    </div>
  );
}

export function TokenUsageCard({ tokenUsage, isCompact = false }: TokenUsageCardProps) {
  const [isExpanded, setIsExpanded] = useState(!isCompact);

  if (!tokenUsage) {
    return null;
  }

  const { totalUsage, totalCost, totalLatencyMs, breakdown, iterations } = tokenUsage;

  if (isCompact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200 overflow-hidden"
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Coins className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="text-xs text-slate-500">Token 使用量</p>
              <p className="text-sm font-semibold text-slate-800">
                {formatNumber(totalUsage.totalTokens)} tokens · {formatCost(totalCost)}
              </p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4"
          >
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="bg-white rounded-lg p-2 text-center">
                <p className="text-xs text-slate-500">输入</p>
                <p className="text-sm font-medium text-slate-700">{formatNumber(totalUsage.promptTokens)}</p>
              </div>
              <div className="bg-white rounded-lg p-2 text-center">
                <p className="text-xs text-slate-500">输出</p>
                <p className="text-sm font-medium text-slate-700">{formatNumber(totalUsage.completionTokens)}</p>
              </div>
              <div className="bg-white rounded-lg p-2 text-center">
                <p className="text-xs text-slate-500">耗时</p>
                <p className="text-sm font-medium text-slate-700">{formatLatency(totalLatencyMs)}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-2">各代理使用量</p>
              <AgentUsageRow name="需求分析师" usage={breakdown.analyzer} color="bg-blue-500" />
              <AgentUsageRow name="市场研究员" usage={breakdown.researcher} color="bg-emerald-500" />
              <AgentUsageRow name="专业招聘官" usage={breakdown.recruiter} color="bg-purple-500" />
              {breakdown.strategy && (
                <AgentUsageRow name="招聘策略专家" usage={breakdown.strategy} color="bg-orange-500" />
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
    >
      {/* 头部 */}
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-xl">
            <Coins className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Token 使用量统计</h3>
            <p className="text-xs text-slate-500">本次分析共进行 {iterations} 轮迭代</p>
          </div>
        </div>
      </div>

      {/* 主要统计 */}
      <div className="p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-slate-500">总 Tokens</span>
            </div>
            <p className="text-xl font-bold text-slate-800">{formatNumber(totalUsage.totalTokens)}</p>
          </div>
          
          <div className="bg-emerald-50 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <Coins className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-slate-500">总成本</span>
            </div>
            <p className="text-xl font-bold text-emerald-600">{formatCost(totalCost)}</p>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-slate-500">总耗时</span>
            </div>
            <p className="text-xl font-bold text-blue-600">{formatLatency(totalLatencyMs)}</p>
          </div>

          <div className="bg-purple-50 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-slate-500">迭代次数</span>
            </div>
            <p className="text-xl font-bold text-purple-600">{iterations}</p>
          </div>
        </div>

        {/* Token 详情 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">输入 Tokens (Prompt)</p>
            <p className="text-lg font-semibold text-slate-700">{formatNumber(totalUsage.promptTokens)}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">输出 Tokens (Completion)</p>
            <p className="text-lg font-semibold text-slate-700">{formatNumber(totalUsage.completionTokens)}</p>
          </div>
        </div>

        {/* 各代理使用量 */}
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-3">各 AI 代理使用量明细</h4>
          <div className="bg-slate-50 rounded-xl p-4">
            <AgentUsageRow name="需求分析师" usage={breakdown.analyzer} color="bg-blue-500" />
            <AgentUsageRow name="市场研究员" usage={breakdown.researcher} color="bg-emerald-500" />
            <AgentUsageRow name="专业招聘官" usage={breakdown.recruiter} color="bg-purple-500" />
            {breakdown.strategy && (
              <AgentUsageRow name="招聘策略专家" usage={breakdown.strategy} color="bg-orange-500" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export { TokenUsageCard as default };
