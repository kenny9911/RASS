import { useApp } from '../../context/AppContext';
import { Briefcase, Settings, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

export function Header() {
  const { state, dispatch } = useApp();

  const handleReset = () => {
    if (confirm('确定要重新开始吗？当前的数据将会丢失。')) {
      dispatch({ type: 'RESET' });
    }
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-200/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-2 sm:gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-primary-900/20">
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-primary-900">
                职位需求澄清助手
              </h1>
              <p className="hidden sm:block text-xs text-slate-500">
                AI智能分析 · 精准匹配人才
              </p>
            </div>
          </motion.div>

          {/* Actions */}
          <div className="flex items-center gap-1 -mr-2">
            {/* 状态指示器 */}
            {state.viewState === 'processing' && (
              <motion.div 
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-accent-50 text-accent-700 rounded-full text-sm mr-2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <span className="w-2 h-2 bg-accent-500 rounded-full animate-pulse" />
                <span>分析中...</span>
              </motion.div>
            )}

            {/* 重新开始按钮 */}
            {state.requisitionId && (
              <button
                onClick={handleReset}
                className="p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 active:bg-slate-200 rounded-xl transition-colors touch-target"
                title="重新开始"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            )}

            {/* 设置按钮 */}
            <button
              className="p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 active:bg-slate-200 rounded-xl transition-colors touch-target"
              title="设置"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
