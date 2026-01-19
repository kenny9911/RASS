import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  ChevronRight, 
  ChevronLeft, 
  Trash2, 
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { AnalysisHistoryEntry } from '../../services/historyStorage';
import { useAnalysisHistory } from '../../hooks/useAnalysisHistory';

interface HistorySidebarProps {
  onSelectHistory: (entry: AnalysisHistoryEntry) => void;
  currentId?: string;
}

export function HistorySidebar({ onSelectHistory, currentId }: HistorySidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { history, isLoading, deleteAnalysis, clearHistory } = useAnalysisHistory();
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('确定要删除这条记录吗？')) {
      deleteAnalysis(id);
    }
  };

  const handleClearAll = () => {
    clearHistory();
    setShowConfirmClear(false);
  };

  return (
    <>
      {/* 展开按钮 */}
      <motion.button
        className={`
          fixed left-0 top-1/2 -translate-y-1/2 z-40
          bg-white shadow-lg rounded-r-xl px-2 py-4
          border border-l-0 border-slate-200
          hover:bg-slate-50 transition-colors
          ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}
        `}
        onClick={() => setIsOpen(true)}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex flex-col items-center gap-2">
          <History className="w-5 h-5 text-accent-600" />
          <span className="text-xs text-slate-600 writing-vertical">历史</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      </motion.button>

      {/* 侧边栏背景遮罩 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/30 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* 侧边栏 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed left-0 top-0 h-full w-[85vw] max-w-[320px] bg-white shadow-2xl z-50 flex flex-col"
            style={{ paddingTop: 'env(safe-area-inset-top)' }}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* 拖动指示器 - 仅移动端显示 */}
            <div className="sm:hidden flex justify-center pt-2">
              <div className="w-10 h-1 bg-slate-300 rounded-full" />
            </div>
            
            {/* 标题栏 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <div className="flex items-center gap-2 flex-1">
                <History className="w-5 h-5 text-accent-600" />
                <h2 className="font-semibold text-slate-900">分析历史</h2>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {history.length}
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-3 -mr-2 hover:bg-slate-100 active:bg-slate-200 rounded-xl transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* 历史列表 */}
            <div className="flex-1 overflow-y-auto scroll-smooth-touch">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-6 h-6 text-accent-500 animate-spin" />
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400 px-4">
                  <FileText className="w-10 h-10 mb-3" />
                  <p className="text-sm text-center">暂无分析记录</p>
                  <p className="text-xs mt-1 text-slate-300">提交分析后将自动保存</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {history.map((entry) => (
                    <motion.div
                      key={entry.id}
                      className={`
                        px-4 py-4 cursor-pointer transition-colors group active-highlight
                        ${entry.id === currentId 
                          ? 'bg-accent-50 border-l-4 border-accent-500' 
                          : 'hover:bg-slate-50'
                        }
                      `}
                      onClick={() => {
                        onSelectHistory(entry);
                        setIsOpen(false);
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(entry.status)}
                            <span className="font-medium text-slate-900 truncate text-sm sm:text-base">
                              {entry.title || '未命名职位'}
                            </span>
                          </div>
                          <div className="mt-1.5 text-xs text-slate-500 space-y-1">
                            {entry.department && (
                              <p className="truncate">{entry.department}</p>
                            )}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-1.5 py-0.5 bg-slate-100 rounded text-xs">{entry.type}</span>
                              <span className="text-slate-400">{formatDate(entry.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleDelete(e, entry.id)}
                          className="p-2.5 -mr-1 sm:opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-xl transition-all touch-target"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* 底部操作 */}
            {history.length > 0 && (
              <div className="border-t border-slate-200 px-4 py-3 safe-bottom">
                {showConfirmClear ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-1">
                      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span className="text-sm text-slate-600">确定清空？</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleClearAll}
                        className="px-4 py-2 bg-red-500 text-white text-sm rounded-xl hover:bg-red-600 touch-target gesture-feedback"
                      >
                        确定
                      </button>
                      <button
                        onClick={() => setShowConfirmClear(false)}
                        className="px-4 py-2 bg-slate-100 text-slate-600 text-sm rounded-xl hover:bg-slate-200 touch-target gesture-feedback"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowConfirmClear(true)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 text-sm text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors touch-target gesture-feedback"
                  >
                    <Trash2 className="w-4 h-4" />
                    清空历史记录
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// 添加竖排文字样式
const style = document.createElement('style');
style.textContent = `
  .writing-vertical {
    writing-mode: vertical-rl;
    text-orientation: mixed;
  }
`;
document.head.appendChild(style);
