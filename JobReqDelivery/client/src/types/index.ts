// 职位需求数据类型
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
  createdAt: string;
  updatedAt: string;
}

// 候选人画像
export interface CandidateProfile {
  summary: string;
  idealBackground: string;
  requiredSkills: string[];
  preferredSkills: string[];
  experienceLevel: string;
  educationLevel: string;
  personalityTraits: string[];
}

// 澄清问题
export interface ClarifyingQuestion {
  id: string;
  question: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  answer?: string;
  isAnswered: boolean;
}

// 代理迭代结果
export interface AgentIteration {
  iteration: number;
  analyzerOutput: RequirementsAnalyzerOutput;
  researcherOutput: JobMarketResearcherOutput;
  recruiterOutput: ProfessionalRecruiterOutput;
  timestamp: string;
}

// 需求分析师输出
export interface RequirementsAnalyzerOutput {
  standardizedTitle: string;
  technicalSkills: string[];
  softSkills: string[];
  experienceRequirements: string[];
  clarifyingQuestions: ClarifyingQuestion[];
  ambiguities: string[];
}

// 市场研究员输出
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

// 专业招聘官输出
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

// Token 使用量
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost?: number;
}

// 分析总体 Token 使用统计
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

// 分析结果
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
  tokenUsage?: AnalysisTokenUsage;
  status: 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
}

// WebSocket 事件类型
export interface AgentProgressEvent {
  type: 'agent_start' | 'agent_progress' | 'agent_complete' | 'iteration_complete' | 'analysis_complete' | 'error' | 'token_usage';
  agent?: 'analyzer' | 'researcher' | 'recruiter';
  iteration?: number;
  message: string;
  data?: {
    usage?: TokenUsage;
    latencyMs?: number;
    agentUsage?: TokenUsage;
    agentLatencyMs?: number;
    totalUsage?: AnalysisTokenUsage;
    [key: string]: unknown;
  };
  timestamp: string;
}

// 表单步骤
export type FormStep = 1 | 2 | 3 | 4;

// 表单数据
export interface FormData {
  basicInfo: BasicInfo;
  responsibilities: string;
  qualifications: string;
  additionalContext: AdditionalContext;
}

// 视图状态
export type ViewState = 'form' | 'processing' | 'results';
