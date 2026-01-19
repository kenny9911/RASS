// 职位需求数据类型
export interface BasicInfo {
  title: string;        // 职位名称
  department: string;   // 部门
  location: string;     // 工作地点
  type: string;         // 雇佣类型
}

export interface AdditionalContext {
  salary?: string;      // 薪资范围
  teamSize?: number;    // 团队规模
  urgency: string;      // 紧急程度
  specialRequirements?: string; // 特殊要求
}

export interface JobRequisition {
  id: string;
  basicInfo: BasicInfo;
  responsibilities: string;    // 岗位职责
  qualifications: string;      // 任职资格
  additionalContext: AdditionalContext;
  status: 'pending' | 'processing' | 'completed' | 'needs_clarification';
  createdAt: Date;
  updatedAt: Date;
}

// 候选人画像
export interface CandidateProfile {
  summary: string;           // 概述
  idealBackground: string;   // 理想背景
  requiredSkills: string[];  // 必备技能
  preferredSkills: string[]; // 加分技能
  experienceLevel: string;   // 经验水平
  educationLevel: string;    // 学历要求
  personalityTraits: string[]; // 性格特质
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

// 必备能力详细定义
export interface MustHaveCapability {
  capability: string;           // 能力名称
  specifics: string;            // 具体要求（如：3年以上React开发经验，熟悉Hooks和Redux）
  reason: string;               // 为什么是必备的（缺失会导致什么问题）
  verificationMethod: string;   // 如何验证（面试问题/实操测试/作品集等）
}

// 适配评估
export interface FitAssessment {
  jobRequirementsFit: {
    score: number;              // 1-10
    matchedRequirements: string[];
    gapAnalysis: string[];
    recommendation: string;
  };
  marketRealityFit: {
    score: number;              // 1-10
    feasibility: 'high' | 'medium' | 'low';
    marketAvailability: string;
    timeToFillEstimate: string;
    recommendation: string;
  };
  clientExpectationsFit: {
    score: number;              // 1-10
    alignmentWithBusinessGoals: string;
    potentialConcerns: string[];
    recommendation: string;
  };
  overallFitScore: number;      // 三个维度的平均分
  finalVerdict: 'approved' | 'needs_revision' | 'major_concerns';
  revisionSuggestions: string[];
}

// 招聘策略代理输出
export interface RecruitingStrategyOutput {
  refinedCandidateProfile: CandidateProfile;
  fitAssessment: FitAssessment;
  recruitingStrategy: {
    primaryChannels: string[];      // 主要招聘渠道
    searchApproach: string;         // 搜索策略
    screeningCriteria: string[];    // 筛选标准
    interviewFocus: string[];       // 面试重点
  };
  riskAnalysis: {
    hiringRisks: string[];          // 招聘风险
    mitigationStrategies: string[]; // 风险缓解策略
  };
}

// 代理迭代结果
export interface AgentIteration {
  iteration: number;
  analyzerOutput: RequirementsAnalyzerOutput;
  researcherOutput: JobMarketResearcherOutput;
  recruiterOutput: ProfessionalRecruiterOutput;
  strategyOutput?: RecruitingStrategyOutput;  // 招聘策略代理输出
  timestamp: Date;
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
    mustHave: MustHaveCapability[];  // 必备能力（详细定义）
    niceToHave: string[];            // 加分能力
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
    fitAssessment?: FitAssessment;           // 适配评估结果
    recruitingStrategy?: RecruitingStrategyOutput['recruitingStrategy'];  // 招聘策略
    riskAnalysis?: RecruitingStrategyOutput['riskAnalysis'];              // 风险分析
  };
  status: 'processing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
}

// WebSocket 事件类型
export interface AgentProgressEvent {
  type: 'agent_start' | 'agent_progress' | 'agent_complete' | 'iteration_complete' | 'analysis_complete' | 'error';
  agent?: 'analyzer' | 'researcher' | 'recruiter' | 'strategy';
  iteration?: number;
  message: string;
  data?: any;
  timestamp: Date;
}

// LLM 相关类型
export interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Token 使用量和成本
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost?: number;  // 美元
}

export interface LLMResponse {
  content: string;
  usage: TokenUsage;
  model: string;
  latencyMs: number;
}

// 代理 Token 使用统计
export interface AgentTokenUsage {
  agent: 'analyzer' | 'researcher' | 'recruiter' | 'strategy';
  usage: TokenUsage;
  latencyMs: number;
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
    strategy: TokenUsage;
  };
  iterations: number;
}

// 模型定价（每百万 token）
export interface ModelPricing {
  promptPricePerMillion: number;
  completionPricePerMillion: number;
}

// 常用模型定价表
export const MODEL_PRICING: Record<string, ModelPricing> = {
  'google/gemini-3-flash-preview': { promptPricePerMillion: 0.075, completionPricePerMillion: 0.30 },
  'google/gemini-2.0-flash-exp:free': { promptPricePerMillion: 0, completionPricePerMillion: 0 },
  'openai/gpt-4o': { promptPricePerMillion: 2.5, completionPricePerMillion: 10 },
  'openai/gpt-4o-mini': { promptPricePerMillion: 0.15, completionPricePerMillion: 0.60 },
  'anthropic/claude-3-sonnet': { promptPricePerMillion: 3, completionPricePerMillion: 15 },
  'anthropic/claude-3-haiku': { promptPricePerMillion: 0.25, completionPricePerMillion: 1.25 },
};
