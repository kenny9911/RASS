import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock } from 'lucide-react';
import { useInputHistory } from '../../hooks/useInputHistory';

interface AutocompleteInputProps {
  fieldName: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  icon?: React.ReactNode;
  label?: string;
  required?: boolean;
  className?: string;
  multiline?: boolean;
  rows?: number;
}

export function AutocompleteInput({
  fieldName,
  value,
  onChange,
  onBlur,
  placeholder,
  icon,
  label,
  required,
  className = '',
  multiline = false,
  rows = 4
}: AutocompleteInputProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  
  const {
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
  } = useInputHistory({
    fieldName,
    onSelect: (selected) => {
      onChange(selected);
    },
    minLength: 0
  });

  // 处理输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    handleInputChange(newValue);
  };

  // 处理失去焦点
  const handleBlurEvent = () => {
    // 保存当前值到历史
    if (value && value.trim()) {
      saveCurrentValue(value);
    }
    handleInputBlur();
    onBlur?.();
  };

  // 处理点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closeSuggestions();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeSuggestions]);

  // 过滤掉当前值相同的建议
  const filteredSuggestions = suggestions.filter(
    s => s.toLowerCase() !== value.toLowerCase()
  );

  const baseInputClasses = `
    w-full px-4 py-3.5 sm:py-3 rounded-xl border border-slate-200 
    focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 
    outline-none transition-all text-base leading-relaxed
    placeholder:text-slate-400
    ${className}
  `;

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          <span className="flex items-center gap-1.5">
            {icon}
            {label} {required && <span className="text-red-500">*</span>}
          </span>
        </label>
      )}
      
      <div className="relative">
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={value}
            onChange={handleChange}
            onFocus={handleInputFocus}
            onBlur={handleBlurEvent}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={rows}
            className={`${baseInputClasses} resize-none`}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={value}
            onChange={handleChange}
            onFocus={handleInputFocus}
            onBlur={handleBlurEvent}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={baseInputClasses}
          />
        )}
      </div>

      {/* 建议下拉列表 */}
      <AnimatePresence>
        {showSuggestions && filteredSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden mobile-dropdown"
          >
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2 sticky top-0">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-500">输入历史</span>
            </div>
            <ul className="max-h-[40vh] sm:max-h-48 overflow-y-auto scroll-smooth-touch">
              {filteredSuggestions.map((suggestion, index) => (
                <li
                  key={suggestion}
                  className={`
                    flex items-center justify-between px-4 py-3.5 sm:py-2.5 cursor-pointer
                    ${index === selectedIndex ? 'bg-accent-50' : 'hover:bg-slate-50 active-highlight'}
                    transition-colors group border-b border-slate-50 last:border-b-0
                  `}
                  onClick={() => selectSuggestion(suggestion)}
                >
                  <span className="text-sm text-slate-700 truncate flex-1 pr-2">
                    {suggestion}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSuggestion(suggestion);
                    }}
                    className="p-2 -mr-1 sm:opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-lg transition-all touch-target"
                    title="删除此记录"
                  >
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
