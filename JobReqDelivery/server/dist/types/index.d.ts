export interface BasicInfo {
    title: string;
    department: string;
    location: string;
    type: string;
}
export interface AdditionalContext {
    salary?: string;
    teamSize?: number;
    urgency: string;
    specialRequirements?: string;
}
export interface JobRequisition {
    id: string;
    basicInfo: BasicInfo;
    responsibilities: string;
    qualifications: string;
    additionalContext: AdditionalContext;
    status: 'pending' | 'processing' | 'completed' | 'needs_clarification';
    createdAt: Date;
    updatedAt: Date;
}
export interface CandidateProfile {
    summary: string;
    idealBackground: string;
    requiredSkills: string[];
    preferredSkills: string[];
    experienceLevel: string;
    educationLevel: string;
    personalityTraits: string[];
}
export interface ClarifyingQuestion {
    id: string;
    question: string;
    category: string;
    priority: 'high' | 'medium' | 'low';
    answer?: string;
    isAnswered: boolean;
}
export interface AgentIteration {
    iteration: number;
    analyzerOutput: RequirementsAnalyzerOutput;
    researcherOutput: JobMarketResearcherOutput;
    recruiterOutput: ProfessionalRecruiterOutput;
    timestamp: Date;
}
export interface RequirementsAnalyzerOutput {
    standardizedTitle: string;
    technicalSkills: string[];
    softSkills: string[];
    experienceRequirements: string[];
    clarifyingQuestions: ClarifyingQuestion[];
    ambiguities: string[];
}
export interface JobMarketResearcherOutput {
    similarTitles: string[];
    industryBenchmarks: {
        salaryRange: string;
        experienceLevels: string;
        marketDemand: string;
    };
    idealCandidateProfile: CandidateProfile;
    capabilityMatrix: {
        mustHave: string[];
        niceToHave: string[];
    };
}
export interface ProfessionalRecruiterOutput {
    answeredQuestions: ClarifyingQuestion[];
    openQuestions: ClarifyingQuestion[];
    satisfactionScore: number;
    satisfactionReason: string;
    candidateProfile: CandidateProfile;
    searchKeywords: string[];
    difficultyLevel: 'easy' | 'moderate' | 'hard' | 'very_hard';
    difficultyReasoning: string;
}
export interface AnalysisResult {
    id: string;
    requisitionId: string;
    iterations: AgentIteration[];
    finalOutput: {
        candidateProfile: CandidateProfile;
        searchKeywords: string[];
        difficultyLevel: 'easy' | 'moderate' | 'hard' | 'very_hard';
        difficultyReasoning: string;
        clarifyingQuestions: ClarifyingQuestion[];
    };
    status: 'processing' | 'completed' | 'failed';
    createdAt: Date;
    completedAt?: Date;
}
export interface AgentProgressEvent {
    type: 'agent_start' | 'agent_progress' | 'agent_complete' | 'iteration_complete' | 'analysis_complete' | 'error';
    agent?: 'analyzer' | 'researcher' | 'recruiter';
    iteration?: number;
    message: string;
    data?: any;
    timestamp: Date;
}
export interface LLMOptions {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
}
export interface LLMMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
export interface TokenUsage {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost?: number;
}
export interface LLMResponse {
    content: string;
    usage: TokenUsage;
    model: string;
    latencyMs: number;
}
export interface AgentTokenUsage {
    agent: 'analyzer' | 'researcher' | 'recruiter';
    usage: TokenUsage;
    latencyMs: number;
}
export interface AnalysisTokenUsage {
    totalUsage: TokenUsage;
    totalCost: number;
    totalLatencyMs: number;
    breakdown: {
        analyzer: TokenUsage;
        researcher: TokenUsage;
        recruiter: TokenUsage;
    };
    iterations: number;
}
export interface ModelPricing {
    promptPricePerMillion: number;
    completionPricePerMillion: number;
}
export declare const MODEL_PRICING: Record<string, ModelPricing>;
//# sourceMappingURL=index.d.ts.map