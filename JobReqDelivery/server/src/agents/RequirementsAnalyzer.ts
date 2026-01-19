import { llmService } from '../llm/LLMService.js';
import { JobRequisition, RequirementsAnalyzerOutput, ClarifyingQuestion, TokenUsage } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

export interface AnalyzerResult {
  output: RequirementsAnalyzerOutput;
  usage: TokenUsage;
  latencyMs: number;
}

const SYSTEM_PROMPT = `你是一位资深的招聘需求分析师，拥有丰富的人力资源和人才招聘经验。你的任务是深入分析职位需求，识别关键要求，并提出澄清问题以帮助更精准地匹配候选人。

你的分析应该：
1. 理解并标准化职位名称
2. 提取技术能力要求
3. 识别软技能要求
4. 明确经验要求
5. 发现需求中的模糊点和歧义
6. 提出有价值的澄清问题

请用中文回复，确保分析专业、全面、实用。`;

const USER_PROMPT_TEMPLATE = `请分析以下职位需求：

【基本信息】
- 职位名称：{title}
- 部门：{department}
- 工作地点：{location}
- 雇佣类型：{type}

【岗位职责】
{responsibilities}

【任职资格】
{qualifications}

【补充信息】
- 薪资范围：{salary}
- 团队规模：{teamSize}
- 紧急程度：{urgency}
- 特殊要求：{specialRequirements}

请以JSON格式返回分析结果，格式如下：
\`\`\`json
{
  "standardizedTitle": "标准化后的职位名称",
  "technicalSkills": ["技术能力1", "技术能力2", ...],
  "softSkills": ["软技能1", "软技能2", ...],
  "experienceRequirements": ["经验要求1", "经验要求2", ...],
  "clarifyingQuestions": [
    {
      "id": "唯一ID",
      "question": "问题内容",
      "category": "分类（技术/经验/文化/其他）",
      "priority": "high/medium/low"
    }
  ],
  "ambiguities": ["模糊点1", "模糊点2", ...]
}
\`\`\`

请确保：
1. 澄清问题要有针对性，能帮助更好地定义候选人画像
2. 问题数量控制在10-15个
3. 优先级根据对招聘成功的影响程度设定
4. 识别所有可能导致招聘失败的模糊点`;

export class RequirementsAnalyzer {
  async analyze(requisition: JobRequisition): Promise<RequirementsAnalyzerOutput> {
    const result = await this.analyzeWithUsage(requisition);
    return result.output;
  }

  async analyzeWithUsage(requisition: JobRequisition): Promise<AnalyzerResult> {
    const userPrompt = USER_PROMPT_TEMPLATE
      .replace('{title}', requisition.basicInfo.title || '未指定')
      .replace('{department}', requisition.basicInfo.department || '未指定')
      .replace('{location}', requisition.basicInfo.location || '未指定')
      .replace('{type}', requisition.basicInfo.type || '全职')
      .replace('{responsibilities}', requisition.responsibilities || '未提供')
      .replace('{qualifications}', requisition.qualifications || '未提供')
      .replace('{salary}', requisition.additionalContext.salary || '面议')
      .replace('{teamSize}', requisition.additionalContext.teamSize?.toString() || '未知')
      .replace('{urgency}', requisition.additionalContext.urgency || '正常')
      .replace('{specialRequirements}', requisition.additionalContext.specialRequirements || '无');

    try {
      const { data: result, usage, latencyMs } = await llmService.chatJSONWithUsage<Omit<RequirementsAnalyzerOutput, 'clarifyingQuestions'> & { clarifyingQuestions: Array<Omit<ClarifyingQuestion, 'isAnswered'>> }>(
        SYSTEM_PROMPT,
        userPrompt,
        { temperature: 0.7, maxTokens: 4096 }
      );

      // 添加 isAnswered 字段和确保 ID 存在
      const clarifyingQuestions: ClarifyingQuestion[] = result.clarifyingQuestions.map(q => ({
        ...q,
        id: q.id || uuidv4(),
        isAnswered: false
      }));

      return {
        output: {
          ...result,
          clarifyingQuestions
        },
        usage,
        latencyMs
      };
    } catch (error) {
      console.error('需求分析失败:', error);
      throw new Error('需求分析师代理执行失败');
    }
  }
}

export const requirementsAnalyzer = new RequirementsAnalyzer();
