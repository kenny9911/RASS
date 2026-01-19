import { generateObject } from 'ai';
import { z } from 'zod';
import { getModel } from '../llm';
import { JobRequisitionInput, AnalyzerOutput } from '../types';

export async function analyzeRequirements(input: JobRequisitionInput): Promise<AnalyzerOutput> {
    const model = getModel();

    const prompt = `
    你是一位专业的职位需求分析师 (Requirements Analyzer Agent)。
    你的任务是分析客户提供的职位描述 (JD)，确定职位名称，并分析需求是否完整。
    
    输入信息:
    - 职位名称 (可能为空): ${input.title || '未提供'}
    - 职责描述: ${input.responsibilities}
    - 任职资格: ${input.qualifications}
    - 其他信息: ${input.otherInfo || '无'}

    请执行以下操作:
    1. 确定最合适的标准职位名称。
    2. 分析目前的需求描述，找出模糊不清或缺失的关键信息（例如：薪资范围、工作地点、具体技术栈版本、经验年限要求、软技能等）。
    3. 生成一份分析摘要。
    4. 列出需要进一步澄清的问题列表。

    请用中文回复。
  `;

    const { object, usage } = await generateObject({
        model,
        schema: z.object({
            jobTitle: z.string().describe('建议的标准职位名称'),
            analysisSummary: z.string().describe('需求分析摘要，包含对当前JD质量的评价'),
            missingInfo: z.array(z.string()).describe('缺失的信息点或需要澄清的问题列表'),
        }),
        prompt,
    });

    return { ...object, usage };
}
