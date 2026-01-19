import { JobRequisition, RequirementsAnalyzerOutput, TokenUsage } from '../types/index.js';
export interface AnalyzerResult {
    output: RequirementsAnalyzerOutput;
    usage: TokenUsage;
    latencyMs: number;
}
export declare class RequirementsAnalyzer {
    analyze(requisition: JobRequisition): Promise<RequirementsAnalyzerOutput>;
    analyzeWithUsage(requisition: JobRequisition): Promise<AnalyzerResult>;
}
export declare const requirementsAnalyzer: RequirementsAnalyzer;
//# sourceMappingURL=RequirementsAnalyzer.d.ts.map