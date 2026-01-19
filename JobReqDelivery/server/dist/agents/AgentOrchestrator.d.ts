import { Server } from 'socket.io';
import { JobRequisition, AnalysisResult, AnalysisTokenUsage } from '../types/index.js';
export declare class AgentOrchestrator {
    private io;
    private requisitionId;
    private tokenUsage;
    constructor(io?: Server | null, requisitionId?: string);
    private initializeTokenUsage;
    setContext(io: Server, requisitionId: string): void;
    private emit;
    private updateTokenUsage;
    analyze(requisition: JobRequisition, analysisResult: AnalysisResult): Promise<void>;
    getTokenUsage(): AnalysisTokenUsage;
}
//# sourceMappingURL=AgentOrchestrator.d.ts.map