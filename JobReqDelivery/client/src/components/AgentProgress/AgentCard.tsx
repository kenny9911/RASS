import { motion } from 'framer-motion';
import { Check, Loader2, LucideIcon } from 'lucide-react';

interface AgentCardProps {
  agent: {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
    color: string;
    bgColor: string;
    textColor: string;
  };
  status: 'pending' | 'active' | 'completed';
  message: string;
  delay: number;
}

export function AgentCard({ agent, status, message, delay }: AgentCardProps) {
  const Icon = agent.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={`
        relative p-4 rounded-2xl border-2 transition-all duration-300
        ${status === 'active' 
          ? 'border-accent-500 bg-white shadow-lg shadow-accent-500/10' 
          : status === 'completed'
            ? 'border-green-500 bg-green-50'
            : 'border-slate-200 bg-white'
        }
      `}
    >
      <div className="flex items-start gap-4">
        {/* 头像 */}
        <div className="relative">
          <div 
            className={`
              w-14 h-14 rounded-xl flex items-center justify-center
              bg-gradient-to-br ${agent.color} shadow-lg
              ${status === 'active' ? 'agent-active' : ''}
            `}
          >
            <Icon className="w-7 h-7 text-white" />
          </div>
          
          {/* 状态指示器 */}
          <div className="absolute -bottom-1 -right-1">
            {status === 'completed' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-md"
              >
                <Check className="w-4 h-4 text-white" />
              </motion.div>
            )}
            {status === 'active' && (
              <div className="w-6 h-6 bg-accent-500 rounded-full flex items-center justify-center shadow-md animate-pulse">
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900">{agent.name}</h3>
            {status === 'active' && (
              <span className="px-2 py-0.5 text-xs font-medium bg-accent-100 text-accent-700 rounded-full">
                工作中
              </span>
            )}
            {status === 'completed' && (
              <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                已完成
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-0.5">{agent.description}</p>
          
          {/* 状态消息 */}
          {message && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className={`
                mt-2 px-3 py-2 rounded-lg text-sm
                ${agent.bgColor} ${agent.textColor}
              `}
            >
              {message}
            </motion.div>
          )}
        </div>
      </div>

      {/* 活跃状态的脉冲动画背景 */}
      {status === 'active' && (
        <motion.div
          className="absolute inset-0 rounded-2xl bg-accent-500/5"
          animate={{ opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}
