// 历史记录存储服务 - 使用 localStorage 持久化

import { FormData, AnalysisResult, AnalysisTokenUsage, AgentProgressEvent } from '../types';

// 分析历史记录条目
export interface AnalysisHistoryEntry {
  id: string;
  requisitionId: string;
  title: string;
  department: string;
  location: string;
  type: string;
  status: 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  formData: FormData;
  analysisResult?: AnalysisResult;
  agentProgress?: AgentProgressEvent[];
  tokenUsage?: AnalysisTokenUsage;
}

// 文本框输入历史
export interface InputHistoryEntry {
  value: string;
  timestamp: string;
  count: number; // 使用次数
}

const HISTORY_KEY = 'job_req_analysis_history';
const INPUT_HISTORY_KEY = 'job_req_input_history';
const MAX_HISTORY_ENTRIES = 50;
const MAX_INPUT_HISTORY_PER_FIELD = 20;

// ==================== 分析历史记录 ====================

// 获取所有历史记录
export function getAnalysisHistory(): AnalysisHistoryEntry[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    if (!data) return [];
    const history = JSON.parse(data) as AnalysisHistoryEntry[];
    // 按创建时间倒序排列
    return history.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('读取历史记录失败:', error);
    return [];
  }
}

// 保存分析到历史
export function saveAnalysisToHistory(entry: AnalysisHistoryEntry): void {
  try {
    const history = getAnalysisHistory();
    
    // 检查是否已存在，如果存在则更新
    const existingIndex = history.findIndex(h => h.id === entry.id);
    if (existingIndex >= 0) {
      history[existingIndex] = entry;
    } else {
      history.unshift(entry);
    }
    
    // 限制最大数量
    const trimmedHistory = history.slice(0, MAX_HISTORY_ENTRIES);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('保存历史记录失败:', error);
  }
}

// 更新历史记录中的分析结果
export function updateAnalysisInHistory(
  id: string, 
  updates: Partial<AnalysisHistoryEntry>
): void {
  try {
    const history = getAnalysisHistory();
    const index = history.findIndex(h => h.id === id);
    if (index >= 0) {
      history[index] = { ...history[index], ...updates };
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }
  } catch (error) {
    console.error('更新历史记录失败:', error);
  }
}

// 获取单个历史记录
export function getAnalysisById(id: string): AnalysisHistoryEntry | null {
  const history = getAnalysisHistory();
  return history.find(h => h.id === id) || null;
}

// 删除历史记录
export function deleteAnalysisFromHistory(id: string): void {
  try {
    const history = getAnalysisHistory();
    const filtered = history.filter(h => h.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('删除历史记录失败:', error);
  }
}

// 清空所有历史记录
export function clearAllHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('清空历史记录失败:', error);
  }
}

// ==================== 输入历史记录 ====================

// 获取指定字段的输入历史
export function getInputHistory(fieldName: string): InputHistoryEntry[] {
  try {
    const data = localStorage.getItem(INPUT_HISTORY_KEY);
    if (!data) return [];
    const allHistory = JSON.parse(data) as Record<string, InputHistoryEntry[]>;
    const fieldHistory = allHistory[fieldName] || [];
    // 按使用次数和时间排序
    return fieldHistory.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  } catch (error) {
    console.error('读取输入历史失败:', error);
    return [];
  }
}

// 保存输入到历史
export function saveInputToHistory(fieldName: string, value: string): void {
  if (!value || value.trim().length < 2) return; // 忽略太短的输入
  
  try {
    const data = localStorage.getItem(INPUT_HISTORY_KEY);
    const allHistory = data ? JSON.parse(data) as Record<string, InputHistoryEntry[]> : {};
    
    const fieldHistory = allHistory[fieldName] || [];
    const existingIndex = fieldHistory.findIndex(
      h => h.value.toLowerCase() === value.toLowerCase()
    );
    
    if (existingIndex >= 0) {
      // 已存在，更新次数和时间
      fieldHistory[existingIndex].count++;
      fieldHistory[existingIndex].timestamp = new Date().toISOString();
    } else {
      // 新增
      fieldHistory.unshift({
        value,
        timestamp: new Date().toISOString(),
        count: 1
      });
    }
    
    // 限制每个字段的历史数量
    allHistory[fieldName] = fieldHistory.slice(0, MAX_INPUT_HISTORY_PER_FIELD);
    localStorage.setItem(INPUT_HISTORY_KEY, JSON.stringify(allHistory));
  } catch (error) {
    console.error('保存输入历史失败:', error);
  }
}

// 搜索输入历史（用于自动补全）
export function searchInputHistory(fieldName: string, query: string): string[] {
  if (!query || query.length < 1) return [];
  
  const history = getInputHistory(fieldName);
  const lowerQuery = query.toLowerCase();
  
  return history
    .filter(h => h.value.toLowerCase().includes(lowerQuery))
    .map(h => h.value)
    .slice(0, 10); // 最多返回10个建议
}

// 删除指定字段的输入历史
export function deleteInputHistory(fieldName: string, value: string): void {
  try {
    const data = localStorage.getItem(INPUT_HISTORY_KEY);
    if (!data) return;
    
    const allHistory = JSON.parse(data) as Record<string, InputHistoryEntry[]>;
    if (!allHistory[fieldName]) return;
    
    allHistory[fieldName] = allHistory[fieldName].filter(
      h => h.value !== value
    );
    localStorage.setItem(INPUT_HISTORY_KEY, JSON.stringify(allHistory));
  } catch (error) {
    console.error('删除输入历史失败:', error);
  }
}

// 清空指定字段的输入历史
export function clearInputHistory(fieldName: string): void {
  try {
    const data = localStorage.getItem(INPUT_HISTORY_KEY);
    if (!data) return;
    
    const allHistory = JSON.parse(data) as Record<string, InputHistoryEntry[]>;
    delete allHistory[fieldName];
    localStorage.setItem(INPUT_HISTORY_KEY, JSON.stringify(allHistory));
  } catch (error) {
    console.error('清空输入历史失败:', error);
  }
}

// 清空所有输入历史
export function clearAllInputHistory(): void {
  try {
    localStorage.removeItem(INPUT_HISTORY_KEY);
  } catch (error) {
    console.error('清空输入历史失败:', error);
  }
}
