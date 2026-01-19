import { motion } from 'framer-motion';
import { AgentProgressEvent } from '../../types';
import { Brain, Search, UserCheck, Target, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface ProgressTimelineProps {
  events: AgentProgressEvent[];
}

const agentIcons: Record<string, typeof Brain> = {
  analyzer: Brain,
  researcher: Search,
  recruiter: UserCheck,
  strategy: Target
};

const agentColors: Record<string, string> = {
  analyzer: 'text-blue-500 bg-blue-100',
  researcher: 'text-emerald-500 bg-emerald-100',
  recruiter: 'text-purple-500 bg-purple-100',
  strategy: 'text-orange-500 bg-orange-100'
};

export function ProgressTimeline({ events }: ProgressTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="bg-slate-50 rounded-xl p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-200 flex items-center justify-center">
          <RefreshCw className="w-6 h-6 text-slate-400 animate-spin" />
        </div>
        <p className="text-slate-500">正在启动分析...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
        <h3 className="font-medium text-slate-700">分析日志</h3>
      </div>
      
      <div className="max-h-64 overflow-y-auto">
        <div className="p-4 space-y-3">
          {events.slice(-10).map((event, index) => {
            const Icon = event.agent 
              ? agentIcons[event.agent] 
              : event.type === 'error' 
                ? AlertCircle 
                : event.type === 'analysis_complete'
                  ? CheckCircle2
                  : RefreshCw;
            
            const colorClass = event.agent 
              ? agentColors[event.agent] 
              : event.type === 'error'
                ? 'text-red-500 bg-red-100'
                : event.type === 'analysis_complete'
                  ? 'text-green-500 bg-green-100'
                  : 'text-slate-500 bg-slate-100';

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-3"
              >
                <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">{event.message}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(event.timestamp).toLocaleTimeString('zh-CN')}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
