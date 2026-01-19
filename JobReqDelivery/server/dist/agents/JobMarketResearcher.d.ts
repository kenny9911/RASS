import { RequirementsAnalyzerOutput, JobMarketResearcherOutput, TokenUsage } from '../types/index.js';
export interface ResearcherResult {
    output: JobMarketResearcherOutput;
    usage: TokenUsage;
    latencyMs: number;
}
export declare class JobMarketResearcher {
    research(analyzerOutput: RequirementsAnalyzerOutput): Promise<JobMarketResearcherOutput>;
    researchWithUsage(analyzerOutput: RequirementsAnalyzerOutput): Promise<ResearcherResult>;
    private ensureMustHaveCapabilities;
    private ensureCandidateProfile;
}
export declare const jobMarketResearcher: JobMarketResearcher;
//# sourceMappingURL=JobMarketResearcher.d.ts.map