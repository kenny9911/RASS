import { useState, useCallback, useEffect } from 'react';
import { 
  AnalysisHistoryEntry,
  getAnalysisHistory, 
  saveAnalysisToHistory, 
  updateAnalysisInHistory,
  getAnalysisById,
  deleteAnalysisFromHistory,
  clearAllHistory
} from '../services/historyStorage';
import { FormData } from '../types';

interface UseAnalysisHistoryReturn {
  history: AnalysisHistoryEntry[];
  isLoading: boolean;
  refreshHistory: () => void;
  saveAnalysis: (data: {
    id: string;
    requisitionId: string;
    formData: FormData;
    status?: 'processing' | 'completed' | 'failed';
  }) => void;
  updateAnalysis: (id: string, updates: Partial<AnalysisHistoryEntry>) => void;
  getAnalysis: (id: string) => AnalysisHistoryEntry | null;
  deleteAnalysis: (id: string) => void;
  clearHistory: () => void;
}

export function useAnalysisHistory(): UseAnalysisHistoryReturn {
  const [history, setHistory] = useState<AnalysisHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 加载历史记录
  const refreshHistory = useCallback(() => {
    setIsLoading(true);
    try {
      const data = getAnalysisHistory();
      setHistory(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 初始加载
  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  // 保存新分析
  const saveAnalysis = useCallback((data: {
    id: string;
    requisitionId: string;
    formData: FormData;
    status?: 'processing' | 'completed' | 'failed';
  }) => {
    const entry: AnalysisHistoryEntry = {
      id: data.id,
      requisitionId: data.requisitionId,
      title: data.formData.basicInfo.title || '未命名职位',
      department: data.formData.basicInfo.department || '',
      location: data.formData.basicInfo.location || '',
      type: data.formData.basicInfo.type || '外包',
      status: data.status || 'processing',
      createdAt: new Date().toISOString(),
      formData: data.formData
    };
    
    saveAnalysisToHistory(entry);
    refreshHistory();
  }, [refreshHistory]);

  // 更新分析
  const updateAnalysis = useCallback((id: string, updates: Partial<AnalysisHistoryEntry>) => {
    updateAnalysisInHistory(id, updates);
    refreshHistory();
  }, [refreshHistory]);

  // 获取单个分析
  const getAnalysis = useCallback((id: string): AnalysisHistoryEntry | null => {
    return getAnalysisById(id);
  }, []);

  // 删除分析
  const deleteAnalysis = useCallback((id: string) => {
    deleteAnalysisFromHistory(id);
    refreshHistory();
  }, [refreshHistory]);

  // 清空历史
  const clearHistory = useCallback(() => {
    clearAllHistory();
    refreshHistory();
  }, [refreshHistory]);

  return {
    history,
    isLoading,
    refreshHistory,
    saveAnalysis,
    updateAnalysis,
    getAnalysis,
    deleteAnalysis,
    clearHistory
  };
}
