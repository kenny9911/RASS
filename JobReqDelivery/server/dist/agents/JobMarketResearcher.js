import { llmService } from '../llm/LLMService.js';
const SYSTEM_PROMPT = `你是一位资深的人才市场研究员，对各行业的人才市场有深入了解。你的任务是基于职位需求分析结果，研究相关市场情况，并构建理想候选人画像。

**【关于必备能力的评估原则 - 极其重要】**

必备能力（mustHave）是候选人筛选的硬性门槛，必须谨慎、严格地评估：

1. **宁缺毋滥原则**：只有真正不可或缺的能力才能列为必备。如果缺少这项能力，候选人完全无法胜任工作，那才是必备能力。

2. **具体可量化原则**：每项必备能力必须具体、可量化、可验证
   - ❌ 错误示例："熟悉前端开发"
   - ✅ 正确示例："3年以上React开发经验，熟练掌握Hooks、Redux/MobX状态管理"

3. **必须说明理由**：为什么该能力是必备的？缺失会导致什么严重后果？
   - 示例：缺少此能力会导致无法独立完成核心业务开发，需要3个月以上培训期

4. **提供验证方法**：如何在招聘过程中验证候选人是否具备该能力？
   - 示例：通过React组件设计题目进行现场编码测试，要求30分钟内完成

5. **市场供给考量**：必备条件不能过多，否则可能导致无人可招
   - 建议必备能力控制在3-5项核心能力
   - 其他重要但非必需的能力归入niceToHave

你的研究应该：
1. 识别市场上相似或相关的职位名称
2. 提供行业薪资和经验水平基准
3. 评估人才市场供需状况
4. 构建详细的理想候选人画像
5. **严格区分必备能力和加分能力，必备能力要具体、可验证、有明确理由**

请用中文回复，确保研究专业、有市场依据、实用性强。`;
const USER_PROMPT_TEMPLATE = `基于以下职位需求分析结果，请进行市场研究：

【标准化职位名称】
{standardizedTitle}

【技术能力要求】
{technicalSkills}

【软技能要求】
{softSkills}

【经验要求】
{experienceRequirements}

【已识别的模糊点】
{ambiguities}

请以JSON格式返回研究结果：
\`\`\`json
{
  "similarTitles": ["相似职位1", "相似职位2", ...],
  "industryBenchmarks": {
    "salaryRange": "薪资范围描述",
    "experienceLevels": "典型经验水平描述",
    "marketDemand": "市场供需状况描述"
  },
  "idealCandidateProfile": {
    "summary": "理想候选人概述（2-3句话）",
    "idealBackground": "理想的教育和职业背景描述",
    "requiredSkills": ["必备技能1", "必备技能2", ...],
    "preferredSkills": ["加分技能1", "加分技能2", ...],
    "experienceLevel": "理想经验水平",
    "educationLevel": "理想学历水平",
    "personalityTraits": ["性格特质1", "性格特质2", ...]
  },
  "capabilityMatrix": {
    "mustHave": [
      {
        "capability": "必备能力名称（如：React前端开发）",
        "specifics": "具体量化要求（如：3年以上React开发经验，熟练掌握Hooks、Context、Redux/MobX）",
        "reason": "为什么是必备的（如：项目核心技术栈，缺失将无法参与80%以上的开发任务）",
        "verificationMethod": "验证方法（如：现场编码测试 - 30分钟内完成一个带状态管理的组件）"
      }
    ],
    "niceToHave": ["加分能力1", "加分能力2", ...]
  }
}
\`\`\`

**【输出要求 - 必备能力部分】**
1. mustHave 数量控制在 3-5 项，只列真正不可或缺的能力
2. 每项必备能力必须包含完整的4个字段：capability、specifics、reason、verificationMethod
3. specifics 必须具体可量化，如"X年经验"、"熟练使用XX工具"
4. reason 必须说明缺失此能力的严重后果
5. verificationMethod 必须是可执行的验证方案

**【其他要求】**
1. 相似职位要覆盖不同的表述方式和相关岗位
2. 行业基准要基于中国人才市场实际情况
3. 候选人画像要具体且可操作
4. niceToHave 可以是简单字符串列表，列出加分但非必需的能力`;
export class JobMarketResearcher {
    async research(analyzerOutput) {
        const result = await this.researchWithUsage(analyzerOutput);
        return result.output;
    }
    async researchWithUsage(analyzerOutput) {
        const userPrompt = USER_PROMPT_TEMPLATE
            .replace('{standardizedTitle}', analyzerOutput.standardizedTitle)
            .replace('{technicalSkills}', analyzerOutput.technicalSkills.join('、') || '未明确')
            .replace('{softSkills}', analyzerOutput.softSkills.join('、') || '未明确')
            .replace('{experienceRequirements}', analyzerOutput.experienceRequirements.join('、') || '未明确')
            .replace('{ambiguities}', analyzerOutput.ambiguities.join('、') || '无');
        try {
            const { data: result, usage, latencyMs } = await llmService.chatJSONWithUsage(SYSTEM_PROMPT, userPrompt, { temperature: 0.7, maxTokens: 4096 });
            // 确保返回完整的数据结构
            return {
                output: {
                    similarTitles: result.similarTitles || [],
                    industryBenchmarks: {
                        salaryRange: result.industryBenchmarks?.salaryRange || '待评估',
                        experienceLevels: result.industryBenchmarks?.experienceLevels || '待评估',
                        marketDemand: result.industryBenchmarks?.marketDemand || '待评估'
                    },
                    idealCandidateProfile: this.ensureCandidateProfile(result.idealCandidateProfile),
                    capabilityMatrix: {
                        mustHave: this.ensureMustHaveCapabilities(result.capabilityMatrix?.mustHave),
                        niceToHave: result.capabilityMatrix?.niceToHave || []
                    }
                },
                usage,
                latencyMs
            };
        }
        catch (error) {
            console.error('市场研究失败:', error);
            throw new Error('市场研究员代理执行失败');
        }
    }
    ensureMustHaveCapabilities(capabilities) {
        if (!capabilities || !Array.isArray(capabilities))
            return [];
        return capabilities.map(cap => ({
            capability: cap.capability || '',
            specifics: cap.specifics || '',
            reason: cap.reason || '',
            verificationMethod: cap.verificationMethod || ''
        }));
    }
    ensureCandidateProfile(profile) {
        return {
            summary: profile?.summary || '',
            idealBackground: profile?.idealBackground || '',
            requiredSkills: profile?.requiredSkills || [],
            preferredSkills: profile?.preferredSkills || [],
            experienceLevel: profile?.experienceLevel || '',
            educationLevel: profile?.educationLevel || '',
            personalityTraits: profile?.personalityTraits || []
        };
    }
}
export const jobMarketResearcher = new JobMarketResearcher();
//# sourceMappingURL=JobMarketResearcher.js.map