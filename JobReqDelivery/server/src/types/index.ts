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

// 代理迭代结果
export interface AgentIteration {
  iteration: number;
  analyzerOutput: RequirementsAnalyzerOutput;
  researcherOutput: JobMarketResearcherOutput;
  recruiterOutput: ProfessionalRecruiterOutput;
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
  status: 'processing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
}

// WebSocket 事件类型
export interface AgentProgressEvent {
  type: 'agent_start' | 'agent_progress' | 'agent_complete' | 'iteration_complete' | 'analysis_complete' | 'error';
  agent?: 'analyzer' | 'researcher' | 'recruiter';
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
  agent: 'analyzer' | 'researcher' | 'recruiter';
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
