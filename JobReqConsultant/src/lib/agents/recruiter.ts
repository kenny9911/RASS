import { generateObject } from 'ai';
import { z } from 'zod';
import { getModel } from '../llm';
import { JobRequisitionInput, AnalyzerOutput, ResearchOutput, RecruiterOutput } from '../types';

export async function consultRecruiter(
    input: JobRequisitionInput,
    analysis: AnalyzerOutput,
    research: ResearchOutput,
    history: { question: string; answer: string }[] = [],
    iteration: number = 1
): Promise<RecruiterOutput> {
    const model = getModel();

    const historyText = history.map(h => `问: ${h.question}\n答: ${h.answer}`).join('\n\n');

    const prompt = `
    你是一位资深的专业招聘顾问 (Professional Recruiter Agent)。
    你的任务是综合各方信息，向客户 (Hiring Manager) 澄清职位需求，最终生成一份高质量的候选人概况。

    原始输入:
    - 职位: ${analysis.jobTitle}
    - 职责: ${input.responsibilities}
    - 资格: ${input.qualifications}

    需求分析师的报告 (Analyzer):
    - 分析摘要: ${analysis.analysisSummary}
    - 缺失信息: ${analysis.missingInfo.join('; ')}

    市场研究员的报告 (Researcher):
    - 市场深度分析: ${research.domainAnalysis}
    - 候选人画像: ${research.candidatePersona}
    - 能力概览: ${research.capabilityProfile}

    已进行的问答历史 (History):
    ${historyText || '无'}

    当前是第 ${iteration} 轮沟通 (总共 2-3 轮)。

    任务:
    1. 判断目前的信息是否足够生成最终的详细职位画像和搜索关键词。
       - 如果是第 3 轮，或者信息已经非常非常完整，必须结束，即使有些小问题。
       - 如果信息不足且未到第3轮，请提出澄清问题。
    
    2. 你的输出包含:
       - clarificationQuestions: 需要问客户的问题列表 (如果 isComplete 为 false)。
       - isComplete: true/false。
       - candidateProfile: 最终的候选人详细资料 (如果 isComplete 为 true)。
       - searchKeywords: 5个搜索关键词 (如果 isComplete 为 true)。
       - difficultyAssessment: 招聘难度评估 (如果 isComplete 为 true)。
       - finalReport: 给客户的最终报告摘要 (如果 isComplete 为 true)。

    请用中文回复。
  `;

    const { object, usage } = await generateObject({
        model,
        schema: z.object({
            clarificationQuestions: z.array(z.string()).describe('需要向客户进一步澄清的问题'),
            isComplete: z.boolean().describe('是否已收集足够信息完成任务'),
            candidateProfile: z.string().optional().describe('最终候选人画像'),
            searchKeywords: z.array(z.string()).optional().describe('5个搜索关键词'),
            difficultyAssessment: z.string().optional().describe('招聘困难度评估'),
            finalReport: z.string().optional().describe('最终总结报告'),
        }),
        prompt,
    });

    return { ...object, usage };
}
