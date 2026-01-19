import { llmService } from '../llm/LLMService.js';
import { v4 as uuidv4 } from 'uuid';
const SYSTEM_PROMPT = `你是一位经验丰富的专业招聘顾问，擅长综合分析招聘需求并制定精准的人才搜索策略。你的任务是：

1. 综合需求分析师和市场研究员的结果
2. 尽可能回答已提出的澄清问题
3. 识别仍需客户澄清的关键问题
4. 生成最终的候选人画像
5. 提炼5个最有效的人才搜索关键词
6. 评估填补该职位的难度
7. 评估自己对分析结果的满意度

你需要像一个真正的招聘顾问一样思考，关注招聘成功的关键因素。
请用中文回复。`;
const USER_PROMPT_TEMPLATE = `请综合以下信息，完成招聘策略分析：

【原始职位需求】
- 职位：{title}
- 部门：{department}
- 职责：{responsibilities}
- 资格：{qualifications}

【需求分析师的分析结果】
- 标准化职位：{standardizedTitle}
- 技术要求：{technicalSkills}
- 软技能要求：{softSkills}
- 经验要求：{experienceRequirements}
- 模糊点：{ambiguities}

【需要回答的澄清问题】
{clarifyingQuestions}

【市场研究员的研究结果】
- 相似职位：{similarTitles}
- 行业基准：薪资 {salaryRange}，经验 {experienceLevels}，市场 {marketDemand}
- 必备能力：{mustHave}
- 加分能力：{niceToHave}

【当前迭代】第 {iteration} 次（共最多3次）

请以JSON格式返回分析结果：
\`\`\`json
{
  "answeredQuestions": [
    {
      "id": "问题ID",
      "question": "问题内容",
      "category": "分类",
      "priority": "优先级",
      "answer": "根据分析推断的答案",
      "isAnswered": true
    }
  ],
  "openQuestions": [
    {
      "id": "新ID",
      "question": "仍需客户回答的问题",
      "category": "分类",
      "priority": "优先级",
      "isAnswered": false
    }
  ],
  "satisfactionScore": 8,
  "satisfactionReason": "对分析结果的满意度说明（1-10分，8分以上表示满意）",
  "candidateProfile": {
    "summary": "最终候选人画像概述",
    "idealBackground": "理想背景描述",
    "requiredSkills": ["必备技能"],
    "preferredSkills": ["加分技能"],
    "experienceLevel": "经验水平",
    "educationLevel": "学历要求",
    "personalityTraits": ["性格特质"]
  },
  "searchKeywords": ["关键词1", "关键词2", "关键词3", "关键词4", "关键词5"],
  "difficultyLevel": "easy/moderate/hard/very_hard",
  "difficultyReasoning": "难度评估的理由"
}
\`\`\`

请确保：
1. 尽量回答能够从需求中推断的问题
2. 只保留真正需要客户澄清的关键问题作为openQuestions
3. 满意度评分要客观，反映信息完整程度
4. 搜索关键词要精准、实用，适合在招聘平台搜索
5. 难度评估要考虑市场供需、技能稀缺性、薪资竞争力等因素`;
export class ProfessionalRecruiter {
    async evaluate(requisition, analyzerOutput, researcherOutput, iteration) {
        const result = await this.evaluateWithUsage(requisition, analyzerOutput, researcherOutput, iteration);
        return result.output;
    }
    async evaluateWithUsage(requisition, analyzerOutput, researcherOutput, iteration) {
        // 格式化澄清问题列表
        const questionsText = analyzerOutput.clarifyingQuestions
            .map((q, i) => `${i + 1}. [${q.priority}] ${q.question}（${q.category}）`)
            .join('\n');
        const userPrompt = USER_PROMPT_TEMPLATE
            .replace('{title}', requisition.basicInfo.title)
            .replace('{department}', requisition.basicInfo.department)
            .replace('{responsibilities}', requisition.responsibilities)
            .replace('{qualifications}', requisition.qualifications)
            .replace('{standardizedTitle}', analyzerOutput.standardizedTitle)
            .replace('{technicalSkills}', analyzerOutput.technicalSkills.join('、'))
            .replace('{softSkills}', analyzerOutput.softSkills.join('、'))
            .replace('{experienceRequirements}', analyzerOutput.experienceRequirements.join('、'))
            .replace('{ambiguities}', analyzerOutput.ambiguities.join('、') || '无')
            .replace('{clarifyingQuestions}', questionsText)
            .replace('{similarTitles}', researcherOutput.similarTitles.join('、'))
            .replace('{salaryRange}', researcherOutput.industryBenchmarks.salaryRange)
            .replace('{experienceLevels}', researcherOutput.industryBenchmarks.experienceLevels)
            .replace('{marketDemand}', researcherOutput.industryBenchmarks.marketDemand)
            .replace('{mustHave}', researcherOutput.capabilityMatrix.mustHave.join('、'))
            .replace('{niceToHave}', researcherOutput.capabilityMatrix.niceToHave.join('、'))
            .replace('{iteration}', iteration.toString());
        try {
            const { data: result, usage, latencyMs } = await llmService.chatJSONWithUsage(SYSTEM_PROMPT, userPrompt, { temperature: 0.7, maxTokens: 4096 });
            // 确保数据完整性
            return {
                output: {
                    answeredQuestions: this.ensureQuestions(result.answeredQuestions, true),
                    openQuestions: this.ensureQuestions(result.openQuestions, false),
                    satisfactionScore: result.satisfactionScore || 5,
                    satisfactionReason: result.satisfactionReason || '',
                    candidateProfile: this.ensureCandidateProfile(result.candidateProfile),
                    searchKeywords: (result.searchKeywords || []).slice(0, 5),
                    difficultyLevel: result.difficultyLevel || 'moderate',
                    difficultyReasoning: result.difficultyReasoning || ''
                },
                usage,
                latencyMs
            };
        }
        catch (error) {
            console.error('招聘官评估失败:', error);
            throw new Error('专业招聘官代理执行失败');
        }
    }
    ensureQuestions(questions, isAnswered) {
        if (!questions)
            return [];
        return questions.map(q => ({
            id: q.id || uuidv4(),
            question: q.question || '',
            category: q.category || '其他',
            priority: q.priority || 'medium',
            answer: q.answer,
            isAnswered
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
export const professionalRecruiter = new ProfessionalRecruiter();
//# sourceMappingURL=ProfessionalRecruiter.js.map