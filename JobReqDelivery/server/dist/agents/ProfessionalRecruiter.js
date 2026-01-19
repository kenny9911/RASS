import { llmService } from '../llm/LLMService.js';
import { v4 as uuidv4 } from 'uuid';
const SYSTEM_PROMPT = `你是一位经验丰富的专业招聘顾问，擅长综合分析招聘需求并制定精准的人才搜索策略。

**【双重评估视角 - 极其重要】**

你必须同时从两个关键视角进行评估，满意度评分必须同时满足双方视角才能给高分：

**1. 招聘者视角（Recruiter Perspective）**
站在执行招聘工作的招聘专员角度思考：
- 候选人画像是否足够清晰具体，能直接指导简历筛选？
- 搜索关键词是否精准有效，能在招聘平台快速找到目标候选人？
- 必备能力和加分能力的区分是否明确，能进行有效的面试评估？
- 难度评估是否准确，能合理规划招聘周期和资源投入？

**2. 客户视角（Client Perspective）**
站在提出招聘需求的业务部门/用人经理角度思考：
- 这份候选人画像是否能让客户一眼理解我们要找什么样的人？
- 是否准确把握了客户最关心的业务痛点和核心诉求？
- 推荐的候选人类型是否符合客户对团队建设的预期？
- 如果按这个画像找到候选人，客户会满意吗？

**你的核心任务：**
1. 综合需求分析师和市场研究员的结果
2. 尽可能回答已提出的澄清问题
3. 识别仍需客户澄清的关键问题
4. 生成最终的候选人画像
5. 提炼5个最有效的人才搜索关键词
6. 评估填补该职位的难度
7. 从招聘者和客户双重视角评估满意度（9分以上表示双方都会满意）

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
- 必备能力（详细）：
{mustHaveDetailed}
- 加分能力：{niceToHave}

【当前迭代】第 {iteration} 次（共最多5次）

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
  "satisfactionReason": "从招聘者和客户双重视角的满意度说明（1-10分，9分以上表示双方都会满意）",
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

**【满意度评分标准 - 双重视角】**
- 9-10分：招聘者能高效执行，客户会完全认可候选人画像
- 7-8分：基本可执行，但可能存在一些模糊点或客户期望未完全捕捉
- 5-6分：信息不够完整，招聘执行有困难或客户可能有较多疑问
- 1-4分：严重信息缺失，无法有效招聘或明显偏离客户需求

**【输出要求】**
1. 尽量回答能够从需求中推断的问题
2. 只保留真正需要客户澄清的关键问题作为openQuestions
3. 满意度评分要同时考虑招聘者执行效率和客户认可度
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
        // 格式化必备能力（详细格式）
        const mustHaveDetailedText = researcherOutput.capabilityMatrix.mustHave
            .map((cap, i) => `  ${i + 1}. ${cap.capability}\n     - 具体要求：${cap.specifics}\n     - 必备理由：${cap.reason}\n     - 验证方法：${cap.verificationMethod}`)
            .join('\n') || '无';
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
            .replace('{mustHaveDetailed}', mustHaveDetailedText)
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