import { Server } from 'socket.io';
export declare function setupWebSocket(io: Server): void;
export declare function emitAgentProgress(io: Server | null | undefined, requisitionId: string, event: {
    type: 'agent_start' | 'agent_progress' | 'agent_complete' | 'iteration_complete' | 'analysis_complete' | 'error' | 'token_usage';
    agent?: 'analyzer' | 'researcher' | 'recruiter';
    iteration?: number;
    message: string;
    data?: any;
}): void;
//# sourceMappingURL=index.d.ts.map