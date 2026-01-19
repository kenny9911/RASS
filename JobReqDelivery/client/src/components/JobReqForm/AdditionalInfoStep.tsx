import { useApp } from '../../context/AppContext';
import { AutocompleteInput } from '../common/AutocompleteInput';
import { DollarSign, Users, Zap, FileText } from 'lucide-react';

const urgencyLevels = [
  { value: '紧急', label: '紧急', color: 'bg-red-100 text-red-700' },
  { value: '较急', label: '较急', color: 'bg-orange-100 text-orange-700' },
  { value: '正常', label: '正常', color: 'bg-green-100 text-green-700' },
  { value: '不急', label: '不急', color: 'bg-slate-100 text-slate-700' },
];

export function AdditionalInfoStep() {
  const { state, dispatch } = useApp();
  const { additionalContext } = state.formData;

  const updateContext = (field: string, value: string | number) => {
    dispatch({
      type: 'UPDATE_FORM',
      payload: {
        additionalContext: {
          ...additionalContext,
          [field]: value
        }
      }
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">补充信息</h2>
        <p className="text-sm text-slate-500 mt-1">
          提供更多背景信息，帮助AI做出更精准的分析
        </p>
      </div>

      {/* 薪资范围 */}
      <AutocompleteInput
        fieldName="salary"
        value={additionalContext.salary || ''}
        onChange={(value) => updateContext('salary', value)}
        placeholder="例如：25K-35K / 年薪40-60万"
        icon={<DollarSign className="w-4 h-4 text-accent-600" />}
        label="薪资范围"
      />

      {/* 团队规模 */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-accent-600" />
            团队规模
          </span>
        </label>
        <input
          type="number"
          value={additionalContext.teamSize || ''}
          onChange={(e) => updateContext('teamSize', parseInt(e.target.value) || 0)}
          placeholder="当前团队人数"
          min={1}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none transition-all text-base"
        />
      </div>

      {/* 紧急程度 */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-accent-600" />
            紧急程度
          </span>
        </label>
        <div className="flex flex-wrap gap-2">
          {urgencyLevels.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => updateContext('urgency', level.value)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all btn-press
                ${additionalContext.urgency === level.value
                  ? `${level.color} ring-2 ring-offset-2 ring-current`
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }
              `}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      {/* 特殊要求 */}
      <AutocompleteInput
        fieldName="special_requirements"
        value={additionalContext.specialRequirements || ''}
        onChange={(value) => updateContext('specialRequirements', value)}
        placeholder="其他需要说明的特殊要求...&#10;例如：需要出差、需要英语流利、有行业经验优先等"
        icon={<FileText className="w-4 h-4 text-accent-600" />}
        label="特殊要求"
        multiline
        rows={4}
      />

      {/* 预览卡片 */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
        <h3 className="text-sm font-medium text-slate-700 mb-2">📋 需求预览</h3>
        <div className="text-sm text-slate-600 space-y-1">
          <p><strong>职位：</strong>{state.formData.basicInfo.title || '未填写'}</p>
          <p><strong>部门：</strong>{state.formData.basicInfo.department || '未填写'}</p>
          <p><strong>地点：</strong>{state.formData.basicInfo.location || '未填写'}</p>
          <p><strong>类型：</strong>{state.formData.basicInfo.type || '全职'}</p>
        </div>
      </div>
    </div>
  );
}
