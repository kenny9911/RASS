export interface JobRequisitionInput {
    title?: string;
    responsibilities: string;
    qualifications: string;
    otherInfo?: string;
}

export interface TokenUsage {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
}

export interface AgentOutput {
    usage?: TokenUsage;
}

export interface AnalyzerOutput extends AgentOutput {
    jobTitle: string;
    analysisSummary: string; // Analysis of the requirements coherence
    missingInfo: string[]; // List of questions/missing data points
}

export interface ResearchOutput extends AgentOutput {
    similarPositions: string[];
    candidatePersona: string; // Description of the ideal candidate
    capabilityProfile: string; // Key capabilities/skills needed
    domainAnalysis: string; // Deep analysis of role variations and skill nuances
}

export interface RecruiterOutput extends AgentOutput {
    clarificationQuestions: string[]; // Questions to ask the client
    isComplete: boolean; // Whether the recruiter has enough info
    candidateProfile?: string; // Final consolidated profile
    searchKeywords?: string[]; // 5 keywords
    difficultyAssessment?: string;
    finalReport?: string;
}

export interface ConsultationSession {
    id: string;
    createdAt: string;
    title: string;
    messages: { role: 'user' | 'assistant'; content: string }[];
    usage: {
        inputTokens: number;
        outputTokens: number;
        totalTokens: number;
        estimatedCost: number;
    };
    step?: 'INITIAL' | 'CLARIFYING' | 'COMPLETED';
    history?: { question: string; answer: string }[];
    jobInput?: JobRequisitionInput;
    analysis?: AnalyzerOutput;
    research?: ResearchOutput;
    finalResult?: RecruiterOutput;
}
