import { useApp } from '../../context/AppContext';
import { AutocompleteInput } from '../common/AutocompleteInput';
import { GraduationCap, Lightbulb } from 'lucide-react';

const suggestions = [
  '本科及以上学历，计算机相关专业',
  '3年以上相关工作经验',
  '熟悉主流技术框架和工具',
  '良好的沟通协作能力',
  '有大型项目经验者优先',
];

export function QualificationsStep() {
  const { state, dispatch } = useApp();
  const { qualifications } = state.formData;

  const updateQualifications = (value: string) => {
    dispatch({
      type: 'UPDATE_FORM',
      payload: { qualifications: value }
    });
  };

  const addSuggestion = (suggestion: string) => {
    const current = qualifications.trim();
    const newValue = current 
      ? `${current}\n• ${suggestion}` 
      : `• ${suggestion}`;
    updateQualifications(newValue);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">任职资格</h2>
        <p className="text-sm text-slate-500 mt-1">
          描述理想候选人应具备的技能、经验和素质
        </p>
      </div>

      {/* 文本输入 */}
      <AutocompleteInput
        fieldName="qualifications"
        value={qualifications}
        onChange={updateQualifications}
        placeholder="请描述候选人需要具备的条件...&#10;&#10;例如：&#10;• 本科及以上学历，计算机或相关专业&#10;• 5年以上前端开发经验&#10;• 精通 React/Vue 等主流框架"
        icon={<GraduationCap className="w-4 h-4 text-accent-600" />}
        label="资格要求"
        required
        multiline
        rows={8}
      />
      <p className="text-xs text-slate-400">
        已输入 {qualifications.length} 字符
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
