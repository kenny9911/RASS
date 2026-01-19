import { useApp } from '../../context/AppContext';
import { AutocompleteInput } from '../common/AutocompleteInput';
import { ClipboardList, Lightbulb } from 'lucide-react';

const suggestions = [
  '负责核心功能模块的设计和开发',
  '参与技术方案讨论和架构设计',
  '编写高质量、可维护的代码',
  '与产品、设计团队紧密合作',
  '持续优化系统性能和用户体验',
];

export function ResponsibilitiesStep() {
  const { state, dispatch } = useApp();
  const { responsibilities } = state.formData;

  const updateResponsibilities = (value: string) => {
    dispatch({
      type: 'UPDATE_FORM',
      payload: { responsibilities: value }
    });
  };

  const addSuggestion = (suggestion: string) => {
    const current = responsibilities.trim();
    const newValue = current 
      ? `${current}\n• ${suggestion}` 
      : `• ${suggestion}`;
    updateResponsibilities(newValue);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">岗位职责</h2>
        <p className="text-sm text-slate-500 mt-1">
          详细描述该职位的主要职责和工作内容
        </p>
      </div>

      {/* 文本输入 */}
      <AutocompleteInput
        fieldName="responsibilities"
        value={responsibilities}
        onChange={updateResponsibilities}
        placeholder="请详细描述该职位的主要工作职责...&#10;&#10;例如：&#10;• 负责前端技术架构设计与实现&#10;• 带领团队完成产品迭代开发&#10;• 持续优化前端工程化和开发效率"
        icon={<ClipboardList className="w-4 h-4 text-accent-600" />}
        label="职责描述"
        required
        multiline
        rows={8}
      />
      <p className="text-xs text-slate-400">
        已输入 {responsibilities.length} 字符
      </p>

      {/* 快捷建议 */}
      <div>
        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-2">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          快捷添加
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => addSuggestion(suggestion)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-600 transition-colors btn-press"
            >
              + {suggestion.slice(0, 10)}...
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
