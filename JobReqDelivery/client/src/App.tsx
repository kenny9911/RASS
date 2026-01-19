import { useCallback, useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { useSocket } from './hooks/useSocket';
import { useAnalysisHistory } from './hooks/useAnalysisHistory';
import { JobReqForm } from './components/JobReqForm';
import { AgentProgress } from './components/AgentProgress';
import { ResultsDashboard } from './components/ResultsDashboard';
import { Header } from './components/common/Header';
import { HistorySidebar } from './components/History';
import { AgentProgressEvent, AnalysisTokenUsage, AnalysisResult } from './types';
import { AnalysisHistoryEntry } from './services/historyStorage';

function AppContent() {
  const { state, dispatch } = useApp();
  const { viewState, requisitionId, formData } = state;
  const [currentHistoryId, setCurrentHistoryId] = useState<string | undefined>();
  const { saveAnalysis, updateAnalysis } = useAnalysisHistory();

  // WebSocket 事件处理
  const handleProgress = useCallback((event: AgentProgressEvent) => {
    dispatch({ type: 'ADD_AGENT_PROGRESS', payload: event });
    
    if (event.type === 'iteration_complete' && event.iteration) {
      dispatch({ type: 'SET_ITERATION', payload: event.iteration });
    }
    
    if (event.type === 'analysis_complete' && event.data) {
      const analysisData = event.data as unknown as AnalysisResult;
      dispatch({ type: 'SET_ANALYSIS_RESULT', payload: analysisData });
      dispatch({ type: 'SET_VIEW', payload: 'results' });
      
      // 如果 analysisResult 包含 tokenUsage，也更新状态
      if (analysisData.tokenUsage) {
        dispatch({ type: 'SET_TOKEN_USAGE', payload: analysisData.tokenUsage });
      }
      
      // 更新历史记录 - 保存完整数据
      if (currentHistoryId) {
        updateAnalysis(currentHistoryId, {
          status: 'completed',
          completedAt: new Date().toISOString(),
          analysisResult: analysisData,
          agentProgress: [...state.agentProgress, event],
          tokenUsage: analysisData.tokenUsage || state.tokenUsage || undefined
        });
      }
    }

    if (event.type === 'error') {
      dispatch({ type: 'SET_ERROR', payload: event.message });
      dispatch({ type: 'SET_SUBMITTING', payload: false });
      
      // 更新历史记录为失败状态
      if (currentHistoryId) {
        updateAnalysis(currentHistoryId, {
          status: 'failed'
        });
      }
    }
  }, [dispatch, currentHistoryId, updateAnalysis, state.agentProgress]);

  // Token 使用量更新处理
  const handleTokenUsage = useCallback((usage: AnalysisTokenUsage) => {
    dispatch({ type: 'SET_TOKEN_USAGE', payload: usage });
    
    // 更新历史记录中的 token 使用量
    if (currentHistoryId) {
      updateAnalysis(currentHistoryId, {
        tokenUsage: usage
      });
    }
  }, [dispatch, currentHistoryId, updateAnalysis]);

  useSocket(requisitionId, { 
    onProgress: handleProgress,
    onTokenUsage: handleTokenUsage
  });

  // 当开始新的分析时，保存到历史
  useEffect(() => {
    if (requisitionId && viewState === 'processing' && !currentHistoryId) {
      const historyId = `history-${requisitionId}`;
      setCurrentHistoryId(historyId);
      saveAnalysis({
        id: historyId,
        requisitionId,
        formData,
        status: 'processing'
      });
    }
  }, [requisitionId, viewState, currentHistoryId, formData, saveAnalysis]);

  // 处理选择历史记录
  const handleSelectHistory = useCallback((entry: AnalysisHistoryEntry) => {
    setCurrentHistoryId(entry.id);
    dispatch({
      type: 'LOAD_HISTORY',
      payload: {
        formData: entry.formData,
        analysisResult: entry.analysisResult,
        agentProgress: entry.agentProgress,
        tokenUsage: entry.tokenUsage,
        requisitionId: entry.requisitionId
      }
    });
  }, [dispatch]);

  // 重置时清除历史 ID
  useEffect(() => {
    if (viewState === 'form' && !requisitionId) {
      setCurrentHistoryId(undefined);
    }
  }, [viewState, requisitionId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      <Header />
      
      {/* 历史记录侧边栏 */}
      <HistorySidebar 
        onSelectHistory={handleSelectHistory}
        currentId={currentHistoryId}
      />
      
      <main className="pb-20 lg:pb-8">
        {viewState === 'form' && <JobReqForm />}
        {viewState === 'processing' && <AgentProgress />}
        {viewState === 'results' && <ResultsDashboard />}
      </main>

      {/* 移动端底部导航 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 lg:hidden safe-bottom z-30">
        <div className="flex justify-around items-center h-16 px-2 max-w-md mx-auto">
          <NavButton 
            active={viewState === 'form'} 
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'form' })}
            icon="📝"
            label="填写"
          />
          <NavButton 
            active={viewState === 'processing'} 
            onClick={() => {}}
            icon="🤖"
            label="分析"
            disabled={!requisitionId || viewState === 'form'}
          />
          <NavButton 
            active={viewState === 'results'} 
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'results' })}
            icon="📊"
            label="结果"
            disabled={!state.analysisResult}
          />
        </div>
      </nav>
    </div>
  );
}

function NavButton({ 
  active, 
  onClick, 
  icon, 
  label, 
  disabled = false 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: string; 
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex flex-col items-center justify-center min-w-[64px] px-3 py-2 rounded-xl transition-all select-none-touch gesture-feedback
        ${active 
          ? 'text-accent-600 bg-accent-50 shadow-sm' 
          : disabled 
            ? 'text-slate-300 cursor-not-allowed' 
            : 'text-slate-500 active:bg-slate-100'
        }
      `}
    >
      <span className="text-2xl mb-1">{icon}</span>
      <span className="text-[10px] font-medium leading-none">{label}</span>
    </button>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
