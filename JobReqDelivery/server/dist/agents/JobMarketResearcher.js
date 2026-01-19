import { llmService } from '../llm/LLMService.js';
const SYSTEM_PROMPT = `你是一位资深的人才市场研究员，对各行业的人才市场有深入了解。你的任务是基于职位需求分析结果，研究相关市场情况，并构建理想候选人画像。

你的研究应该：
1. 识别市场上相似或相关的职位名称
2. 提供行业薪资和经验水平基准
3. 评估人才市场供需状况
4. 构建详细的理想候选人画像
5. 区分必备能力和加分能力

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
    "mustHave": ["必备能力1", "必备能力2", ...],
    "niceToHave": ["加分能力1", "加分能力2", ...]
  }
}
\`\`\`

请确保：
1. 相似职位要覆盖不同的表述方式和相关岗位
2. 行业基准要基于中国人才市场实际情况
3. 候选人画像要具体且可操作
4. 能力矩阵要清晰区分必备和加分项`;
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
                        mustHave: result.capabilityMatrix?.mustHave || [],
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