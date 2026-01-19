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
export interface MustHaveCapability {
    capability: string;
    specifics: string;
    reason: string;
    verificationMethod: string;
}
export interface FitAssessment {
    jobRequirementsFit: {
        score: number;
        matchedRequirements: string[];
        gapAnalysis: string[];
        recommendation: string;
    };
    marketRealityFit: {
        score: number;
        feasibility: 'high' | 'medium' | 'low';
        marketAvailability: string;
        timeToFillEstimate: string;
        recommendation: string;
    };
    clientExpectationsFit: {
        score: number;
        alignmentWithBusinessGoals: string;
        potentialConcerns: string[];
        recommendation: string;
    };
    overallFitScore: number;
    finalVerdict: 'approved' | 'needs_revision' | 'major_concerns';
    revisionSuggestions: string[];
}
export interface RecruitingStrategyOutput {
    refinedCandidateProfile: CandidateProfile;
    fitAssessment: FitAssessment;
    recruitingStrategy: {
        primaryChannels: string[];
        searchApproach: string;
        screeningCriteria: string[];
        interviewFocus: string[];
    };
    riskAnalysis: {
        hiringRisks: string[];
        mitigationStrategies: string[];
    };
}
export interface AgentIteration {
    iteration: number;
    analyzerOutput: RequirementsAnalyzerOutput;
    researcherOutput: JobMarketResearcherOutput;
    recruiterOutput: ProfessionalRecruiterOutput;
    strategyOutput?: RecruitingStrategyOutput;
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
        mustHave: MustHaveCapability[];
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
        fitAssessment?: FitAssessment;
        recruitingStrategy?: RecruitingStrategyOutput['recruitingStrategy'];
        riskAnalysis?: RecruitingStrategyOutput['riskAnalysis'];
    };
    status: 'processing' | 'completed' | 'failed';
    createdAt: Date;
    completedAt?: Date;
}
export interface AgentProgressEvent {
    type: 'agent_start' | 'agent_progress' | 'agent_complete' | 'iteration_complete' | 'analysis_complete' | 'error';
    agent?: 'analyzer' | 'researcher' | 'recruiter' | 'strategy';
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
    agent: 'analyzer' | 'researcher' | 'recruiter' | 'strategy';
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
        strategy: TokenUsage;
    };
    iterations: number;
}
export interface ModelPricing {
    promptPricePerMillion: number;
    completionPricePerMillion: number;
}
export declare const MODEL_PRICING: Record<string, ModelPricing>;
//# sourceMappingURL=index.d.ts.map