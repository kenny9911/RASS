import { JobRequisition, RequirementsAnalyzerOutput, JobMarketResearcherOutput, ProfessionalRecruiterOutput, TokenUsage } from '../types/index.js';
export interface RecruiterResult {
    output: ProfessionalRecruiterOutput;
    usage: TokenUsage;
    latencyMs: number;
}
export declare class ProfessionalRecruiter {
    evaluate(requisition: JobRequisition, analyzerOutput: RequirementsAnalyzerOutput, researcherOutput: JobMarketResearcherOutput, iteration: number): Promise<ProfessionalRecruiterOutput>;
    evaluateWithUsage(requisition: JobRequisition, analyzerOutput: RequirementsAnalyzerOutput, researcherOutput: JobMarketResearcherOutput, iteration: number): Promise<RecruiterResult>;
    private ensureQuestions;
    private ensureCandidateProfile;
}
export declare const professionalRecruiter: ProfessionalRecruiter;
//# sourceMappingURL=ProfessionalRecruiter.d.ts.map