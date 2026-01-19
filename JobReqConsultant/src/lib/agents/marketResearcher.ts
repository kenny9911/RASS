import { generateObject } from 'ai';
import { z } from 'zod';
import { getModel } from '../llm';
import { JobRequisitionInput, ResearchOutput } from '../types';

export async function researchMarket(input: JobRequisitionInput, jobTitle: string): Promise<ResearchOutput> {
    const model = getModel();

    const prompt = `
    你是一位专业的就业市场研究员 (Job Market Researcher Agent)。
    目前正在为一个职位进行市场调研。
    
    职位名称: ${jobTitle}
    职责描述: ${input.responsibilities}
    任职资格: ${input.qualifications}

    请执行以下操作:
    1. 研究该领域和就业市场，找出类似的职位名称。
    2. 深入分析该职位的细分领域和市场因素 (Domain Analysis)：
       - 角色细分：分析该职位在不同场景下的变体 (例如：ToB vs ToC 销售, 猎人(Inbound) vs 农夫(Outbound), 大客户 vs 中小微客户)。
       - 技能差异：针对上述不同变体，列出特定的专业技能或工具 (例如：CRM软件差异, 技术栈差异)。
       - 其他因素：行业趋势、公司规模对候选人画像的影响。
    3. 基于以上分析，创建一个完美的候选人画像 (Candidate Persona)。
    4. 创建一个能力概览 (Capability Profile)，列出理想候选人的核心能力。

    请用中文回复。
  `;

    const { object, usage } = await generateObject({
        model,
        schema: z.object({
            similarPositions: z.array(z.string()).describe('类似或相关的职位名称列表'),
            domainAnalysis: z.string().describe('职位细分领域、角色变体及对应技能差异的深度分析'),
            candidatePersona: z.string().describe('完美候选人的文字画像描述'),
            capabilityProfile: z.string().describe('理想候选人的核心能力概览'),
        }),
        prompt,
    });

    return { ...object, usage };
}
