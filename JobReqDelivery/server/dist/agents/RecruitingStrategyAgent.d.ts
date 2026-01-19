import { JobRequisition, RequirementsAnalyzerOutput, JobMarketResearcherOutput, ProfessionalRecruiterOutput, RecruitingStrategyOutput, TokenUsage } from '../types/index.js';
export interface StrategyResult {
    output: RecruitingStrategyOutput;
    usage: TokenUsage;
    latencyMs: number;
}
export declare class RecruitingStrategyAgent {
    validate(requisition: JobRequisition, analyzerOutput: RequirementsAnalyzerOutput, researcherOutput: JobMarketResearcherOutput, recruiterOutput: ProfessionalRecruiterOutput): Promise<RecruitingStrategyOutput>;
    validateWithUsage(requisition: JobRequisition, analyzerOutput: RequirementsAnalyzerOutput, researcherOutput: JobMarketResearcherOutput, recruiterOutput: ProfessionalRecruiterOutput): Promise<StrategyResult>;
    private ensureCandidateProfile;
    private ensureFitAssessment;
    private determineFinalVerdict;
}
export declare const recruitingStrategyAgent: RecruitingStrategyAgent;
//# sourceMappingURL=RecruitingStrategyAgent.d.ts.map