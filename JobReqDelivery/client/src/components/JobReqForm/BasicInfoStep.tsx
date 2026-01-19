import { useApp } from '../../context/AppContext';
import { AutocompleteInput } from '../common/AutocompleteInput';
import { Briefcase, Building2, MapPin, Clock } from 'lucide-react';

const employmentTypes = ['外包', '全职', '兼职', '实习', '合同工', '顾问'];

export function BasicInfoStep() {
  const { state, dispatch } = useApp();
  const { basicInfo } = state.formData;

  const updateBasicInfo = (field: string, value: string) => {
    dispatch({
      type: 'UPDATE_FORM',
      payload: {
        basicInfo: {
          ...basicInfo,
          [field]: value
        }
      }
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">基本信息</h2>
        <p className="text-sm text-slate-500 mt-1">
          请填写职位的基本信息，帮助AI更好地理解招聘需求
        </p>
      </div>

      {/* 职位名称 */}
      <AutocompleteInput
        fieldName="job_title"
        value={basicInfo.title}
        onChange={(value) => updateBasicInfo('title', value)}
        placeholder="例如：高级前端工程师"
        icon={<Briefcase className="w-4 h-4 text-accent-600" />}
        label="职位名称"
        required
      />

      {/* 部门 */}
      <AutocompleteInput
        fieldName="department"
        value={basicInfo.department}
        onChange={(value) => updateBasicInfo('department', value)}
        placeholder="例如：技术研发部"
        icon={<Building2 className="w-4 h-4 text-accent-600" />}
        label="所属部门"
      />

      {/* 工作地点 */}
      <AutocompleteInput
        fieldName="location"
        value={basicInfo.location}
        onChange={(value) => updateBasicInfo('location', value)}
        placeholder="例如：北京市朝阳区"
        icon={<MapPin className="w-4 h-4 text-accent-600" />}
        label="工作地点"
      />

      {/* 雇佣类型 */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-accent-600" />
            雇佣类型
          </span>
        </label>
        <div className="flex flex-wrap gap-2">
          {employmentTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => updateBasicInfo('type', type)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all btn-press
                ${basicInfo.type === type
                  ? 'bg-accent-500 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }
              `}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
