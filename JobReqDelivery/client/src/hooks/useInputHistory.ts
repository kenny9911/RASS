import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  getInputHistory, 
  saveInputToHistory, 
  searchInputHistory,
  deleteInputHistory 
} from '../services/historyStorage';

interface UseInputHistoryOptions {
  fieldName: string;
  onSelect?: (value: string) => void;
  minLength?: number; // 最小触发长度
  debounceMs?: number; // 防抖延迟
}

interface UseInputHistoryReturn {
  suggestions: string[];
  showSuggestions: boolean;
  selectedIndex: number;
  handleInputChange: (value: string) => void;
  handleInputFocus: () => void;
  handleInputBlur: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  selectSuggestion: (suggestion: string) => void;
  deleteSuggestion: (suggestion: string) => void;
  saveCurrentValue: (value: string) => void;
  closeSuggestions: () => void;
}

export function useInputHistory({
  fieldName,
  onSelect,
  minLength = 0,
  debounceMs = 150
}: UseInputHistoryOptions): UseInputHistoryReturn {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    };
  }, []);

  // 更新建议列表
  const updateSuggestions = useCallback((value: string) => {
    if (value.length < minLength) {
      // 如果输入太短，显示全部历史
      const history = getInputHistory(fieldName);
      const allSuggestions = history.map(h => h.value).slice(0, 10);
      setSuggestions(allSuggestions);
    } else {
      // 搜索匹配的历史
      const matchedSuggestions = searchInputHistory(fieldName, value);
      setSuggestions(matchedSuggestions);
    }
    setSelectedIndex(-1);
  }, [fieldName, minLength]);

  // 处理输入变化（带防抖）
  const handleInputChange = useCallback((value: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      updateSuggestions(value);
      if (value.length >= minLength || getInputHistory(fieldName).length > 0) {
        setShowSuggestions(true);
      }
    }, debounceMs);
  }, [updateSuggestions, minLength, debounceMs, fieldName]);

  // 处理获得焦点
  const handleInputFocus = useCallback(() => {
    // 取消 blur 的关闭操作
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    
    // 显示历史建议
    const history = getInputHistory(fieldName);
    if (history.length > 0) {
      const allSuggestions = history.map(h => h.value).slice(0, 10);
      setSuggestions(allSuggestions);
      setShowSuggestions(true);
    }
  }, [fieldName]);

  // 处理失去焦点
  const handleInputBlur = useCallback(() => {
    // 延迟关闭，以允许点击建议
    blurTimeoutRef.current = setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  }, []);

  // 处理键盘事件
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          e.preventDefault();
          selectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      case 'Tab':
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          e.preventDefault();
          selectSuggestion(suggestions[selectedIndex]);
        } else {
          setShowSuggestions(false);
        }
        break;
    }
  }, [showSuggestions, suggestions, selectedIndex]);

  // 选择建议
  const selectSuggestion = useCallback((suggestion: string) => {
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onSelect?.(suggestion);
  }, [onSelect]);

  // 删除建议
  const deleteSuggestion = useCallback((suggestion: string) => {
    deleteInputHistory(fieldName, suggestion);
    setSuggestions(prev => prev.filter(s => s !== suggestion));
  }, [fieldName]);

  // 保存当前值到历史
  const saveCurrentValue = useCallback((value: string) => {
    if (value && value.trim()) {
      saveInputToHistory(fieldName, value.trim());
    }
  }, [fieldName]);

  // 关闭建议列表
  const closeSuggestions = useCallback(() => {
    setShowSuggestions(false);
    setSelectedIndex(-1);
  }, []);

  return {
    suggestions,
    showSuggestions,
    selectedIndex,
    handleInputChange,
    handleInputFocus,
    handleInputBlur,
    handleKeyDown,
    selectSuggestion,
    deleteSuggestion,
    saveCurrentValue,
    closeSuggestions
  };
}
