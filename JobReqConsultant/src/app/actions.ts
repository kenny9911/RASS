'use server';

import { analyzeRequirements } from '@/lib/agents/requirementsAnalyzer';
import { researchMarket } from '@/lib/agents/marketResearcher';
import { consultRecruiter } from '@/lib/agents/recruiter';
import { JobRequisitionInput, AnalyzerOutput, ResearchOutput, RecruiterOutput, TokenUsage } from '@/lib/types';
import { saveConsultation } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';

export type ConsultationState = {
    id?: string;
    step: 'INITIAL' | 'CLARIFYING' | 'COMPLETED';
    iteration: number;
    jobInput: JobRequisitionInput;
    analysis?: AnalyzerOutput;
    research?: ResearchOutput;
    recruiter?: RecruiterOutput;
    history: { question: string; answer: string }[];
    messages: { role: 'user' | 'assistant'; content: string }[];
    usage: {
        inputTokens: number;
        outputTokens: number;
        totalTokens: number;
        estimatedCost: number;
    };
};

function calculateCost(input: number, output: number) {
    // Defaults based on .env or hardcoded fallback
    const inputRate = parseFloat(process.env.GEMINI_3_FLASH_INPUT_COST || '2.00');
    const outputRate = parseFloat(process.env.GEMINI_3_FLASH_OUTPUT_COST || '12.00');

    return (input / 1_000_000 * inputRate) + (output / 1_000_000 * outputRate);
}

function accumulateUsage(current: ConsultationState['usage'], newUsage?: TokenUsage) {
    if (!newUsage) return current;
    const cost = calculateCost(newUsage.promptTokens, newUsage.completionTokens);
    return {
        inputTokens: current.inputTokens + newUsage.promptTokens,
        outputTokens: current.outputTokens + newUsage.completionTokens,
        totalTokens: current.totalTokens + newUsage.totalTokens,
        estimatedCost: current.estimatedCost + cost
    };
}

export async function submitConsultation(
    prevState: ConsultationState,
    formData: FormData
): Promise<ConsultationState> {
    const userInput = formData.get('input') as string;
    let newState: ConsultationState = {
        ...prevState,
        // Ensure usage init if missing
        usage: prevState.usage || { inputTokens: 0, outputTokens: 0, totalTokens: 0, estimatedCost: 0 }
    };

    // Assign ID if new
    if (!newState.id) newState.id = uuidv4();

    // Update messages
    newState.messages = [
        ...newState.messages,
        { role: 'user', content: userInput }
    ];

    try {
        if (newState.step === 'INITIAL') {
            const input: JobRequisitionInput = {
                title: '',
                responsibilities: userInput,
                qualifications: userInput,
                otherInfo: ''
            };

            // 1. Analyze
            const analysis = await analyzeRequirements(input);
            newState.analysis = analysis;
            newState.jobInput = { ...input, title: analysis.jobTitle };
            newState.usage = accumulateUsage(newState.usage, analysis.usage);

            // 2. Research
            const research = await researchMarket(input, analysis.jobTitle);
            newState.research = research;
            newState.usage = accumulateUsage(newState.usage, research.usage);

            // 3. Consult (Iter 1)
            const recruiter = await consultRecruiter(input, analysis, research, [], 1);
            newState.recruiter = recruiter;
            newState.usage = accumulateUsage(newState.usage, recruiter.usage);

            newState.iteration = 1;

            if (recruiter.isComplete) {
                newState.step = 'COMPLETED';
                newState.messages.push({ role: 'assistant', content: recruiter.finalReport || '分析完成。' });
            } else {
                newState.step = 'CLARIFYING';
                const questions = recruiter.clarificationQuestions.join('\n\n');
                newState.messages.push({ role: 'assistant', content: `为了更精准地匹配候选人，我需要向您确认以下信息：\n\n${questions}` });
            }

        } else if (newState.step === 'CLARIFYING') {
            // Subsequent turns
            const lastQuestions = newState.recruiter?.clarificationQuestions.join('\n') || 'General Clarification';
            newState.history.push({
                question: lastQuestions,
                answer: userInput
            });

            newState.iteration += 1;

            // Re-run Recruiter
            const recruiter = await consultRecruiter(
                newState.jobInput,
                newState.analysis!,
                newState.research!,
                newState.history,
                newState.iteration
            );
            newState.recruiter = recruiter;
            newState.usage = accumulateUsage(newState.usage, recruiter.usage);

            if (recruiter.isComplete || newState.iteration >= 3) {
                newState.step = 'COMPLETED';
                newState.messages.push({ role: 'assistant', content: recruiter.finalReport || '分析完成。' });
            } else {
                const questions = recruiter.clarificationQuestions.join('\n\n');
                newState.messages.push({ role: 'assistant', content: `还有一些细节需要确认：\n\n${questions}` });
            }
        }

        // Save history at every step or just completion? 
        // Requirement says "record history". Saving every step is safer.
        await saveConsultation({
            id: newState.id,
            createdAt: new Date().toISOString(),
            title: newState.analysis?.jobTitle || 'New Consultation',
            messages: newState.messages,
            usage: newState.usage,
            finalResult: newState.step === 'COMPLETED' ? newState.recruiter : undefined,
            step: newState.step,
            history: newState.history,
            jobInput: newState.jobInput,
            analysis: newState.analysis,
            research: newState.research
        });

    } catch (error) {
        console.error(error);
        newState.messages.push({ role: 'assistant', content: '抱歉，处理您的请求时出现错误。请稍后重试。' });
    }

    return newState;
}

export async function getHistory() {
    const { getConsultations } = await import('@/lib/storage');
    return getConsultations();
}
