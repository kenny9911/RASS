import { Server } from 'socket.io';
import { JobRequisition, AnalysisResult, AgentIteration, TokenUsage, AnalysisTokenUsage } from '../types/index.js';
import { requirementsAnalyzer } from './RequirementsAnalyzer.js';
import { jobMarketResearcher } from './JobMarketResearcher.js';
import { professionalRecruiter } from './ProfessionalRecruiter.js';
import { recruitingStrategyAgent } from './RecruitingStrategyAgent.js';
import { emitAgentProgress } from '../websocket/index.js';
import { llmService } from '../llm/LLMService.js';

const MAX_ITERATIONS = 3;
const SATISFACTION_THRESHOLD = 9; // 满意度阈值（1-10分），需要达到90%才算满意

// 创建空的 TokenUsage
function createEmptyUsage(): TokenUsage {
  return { promptTokens: 0, completionTokens: 0, totalTokens: 0, cost: 0 };
}

// 合并 TokenUsage
function mergeUsage(a: TokenUsage, b: TokenUsage): TokenUsage {
  return {
    promptTokens: a.promptTokens + b.promptTokens,
    completionTokens: a.completionTokens + b.completionTokens,
    totalTokens: a.totalTokens + b.totalTokens,
    cost: (a.cost || 0) + (b.cost || 0)
  };
}

export class AgentOrchestrator {
  private io: Server | null;
  private requisitionId: string;
  private tokenUsage: AnalysisTokenUsage;

  constructor(io?: Server | null, requisitionId?: string) {
    this.io = io || null;
    this.requisitionId = requisitionId || '';
    this.tokenUsage = this.initializeTokenUsage();
  }

  private initializeTokenUsage(): AnalysisTokenUsage {
    return {
      totalUsage: createEmptyUsage(),
      totalCost: 0,
      totalLatencyMs: 0,
      breakdown: {
        analyzer: createEmptyUsage(),
        researcher: createEmptyUsage(),
        recruiter: createEmptyUsage(),
        strategy: createEmptyUsage()
      },
      iterations: 0
    };
  }

  // 设置 io 和 requisitionId（用于延迟初始化）
  setContext(io: Server, requisitionId: string): void {
    this.io = io;
    this.requisitionId = requisitionId;
  }

  private emit(
    type: 'agent_start' | 'agent_progress' | 'agent_complete' | 'iteration_complete' | 'analysis_complete' | 'error' | 'token_usage',
    message: string,
    data?: {
      agent?: 'analyzer' | 'researcher' | 'recruiter' | 'strategy';
      iteration?: number;
      [key: string]: unknown;
    }
  ): void {
    emitAgentProgress(this.io, this.requisitionId, {
      type,
      message,
      ...data
    });
  }

  private updateTokenUsage(agent: 'analyzer' | 'researcher' | 'recruiter' | 'strategy', usage: TokenUsage, latencyMs: number): void {
    // 更新代理级别的使用量
    this.tokenUsage.breakdown[agent] = mergeUsage(this.tokenUsage.breakdown[agent], usage);
    
    // 更新总体使用量
    this.tokenUsage.totalUsage = mergeUsage(this.tokenUsage.totalUsage, usage);
    this.tokenUsage.totalCost = this.tokenUsage.totalUsage.cost || 0;
    this.tokenUsage.totalLatencyMs += latencyMs;

    // 发送使用量更新
    this.emit('token_usage', `Token 使用量更新`, {
      agent,
      data: {
        agentUsage: usage,
        agentLatencyMs: latencyMs,
        totalUsage: this.tokenUsage
      }
    });
  }

  async analyze(requisition: JobRequisition, analysisResult: AnalysisResult): Promise<void> {
    console.log(`🚀 开始分析职位需求: ${requisition.basicInfo.title}`);
    console.log(`🤖 使用模型: ${llmService.getModel()}`);
    
    // 重置 token 使用统计
    this.tokenUsage = this.initializeTokenUsage();
    
    let currentIteration = 0;
    let isSatisfied = false;

    try {
      while (currentIteration < MAX_ITERATIONS && !isSatisfied) {
        currentIteration++;
        this.tokenUsage.iterations = currentIteration;
        console.log(`📍 迭代 ${currentIteration}/${MAX_ITERATIONS}`);
        
        this.emit('iteration_complete', `开始第 ${currentIteration} 轮分析`, { 
          iteration: currentIteration 
        });

        // 步骤1：需求分析
        this.emit('agent_start', '需求分析师开始工作...', { agent: 'analyzer' });
        
        const analyzerResult = await requirementsAnalyzer.analyzeWithUsage(requisition);
        const analyzerOutput = analyzerResult.output;
        this.updateTokenUsage('analyzer', analyzerResult.usage, analyzerResult.latencyMs);
        
        this.emit('agent_complete', '需求分析完成', { 
          agent: 'analyzer',
          data: {
            standardizedTitle: analyzerOutput.standardizedTitle,
            questionsCount: analyzerOutput.clarifyingQuestions.length,
            ambiguitiesCount: analyzerOutput.ambiguities.length,
            usage: analyzerResult.usage,
            latencyMs: analyzerResult.latencyMs
          }
        });

        // 步骤2：市场研究
        this.emit('agent_start', '市场研究员开始工作...', { agent: 'researcher' });
        
        const researcherResult = await jobMarketResearcher.researchWithUsage(analyzerOutput);
        const researcherOutput = researcherResult.output;
        this.updateTokenUsage('researcher', researcherResult.usage, researcherResult.latencyMs);
        
        this.emit('agent_complete', '市场研究完成', { 
          agent: 'researcher',
          data: {
            similarTitlesCount: researcherOutput.similarTitles.length,
            marketDemand: researcherOutput.industryBenchmarks.marketDemand,
            usage: researcherResult.usage,
            latencyMs: researcherResult.latencyMs
          }
        });

        // 步骤3：招聘官评估
        this.emit('agent_start', '专业招聘官开始综合评估...', { agent: 'recruiter' });
        
        const recruiterResult = await professionalRecruiter.evaluateWithUsage(
          requisition,
          analyzerOutput,
          researcherOutput,
          currentIteration
        );
        const recruiterOutput = recruiterResult.output;
        this.updateTokenUsage('recruiter', recruiterResult.usage, recruiterResult.latencyMs);
        
        this.emit('agent_complete', '招聘官评估完成', { 
          agent: 'recruiter',
          data: {
            satisfactionScore: recruiterOutput.satisfactionScore,
            openQuestionsCount: recruiterOutput.openQuestions.length,
            difficultyLevel: recruiterOutput.difficultyLevel,
            usage: recruiterResult.usage,
            latencyMs: recruiterResult.latencyMs
          }
        });

        // 步骤4：招聘策略验证
        this.emit('agent_start', '招聘策略专家开始验证...', { agent: 'strategy' });
        
        const strategyResult = await recruitingStrategyAgent.validateWithUsage(
          requisition,
          analyzerOutput,
          researcherOutput,
          recruiterOutput
        );
        const strategyOutput = strategyResult.output;
        this.updateTokenUsage('strategy', strategyResult.usage, strategyResult.latencyMs);
        
        this.emit('agent_complete', '策略验证完成', { 
          agent: 'strategy',
          data: {
            overallFitScore: strategyOutput.fitAssessment.overallFitScore,
            finalVerdict: strategyOutput.fitAssessment.finalVerdict,
            jobFitScore: strategyOutput.fitAssessment.jobRequirementsFit.score,
            marketFitScore: strategyOutput.fitAssessment.marketRealityFit.score,
            clientFitScore: strategyOutput.fitAssessment.clientExpectationsFit.score,
            usage: strategyResult.usage,
            latencyMs: strategyResult.latencyMs
          }
        });

        // 保存迭代结果（包含策略输出）
        const iteration: AgentIteration = {
          iteration: currentIteration,
          analyzerOutput,
          researcherOutput,
          recruiterOutput,
          strategyOutput,
          timestamp: new Date()
        };
        analysisResult.iterations.push(iteration);

        // 基于策略代理的适配评估判断是否满意
        const fitScore = strategyOutput.fitAssessment.overallFitScore;
        const isApproved = strategyOutput.fitAssessment.finalVerdict === 'approved';
        
        if (fitScore >= SATISFACTION_THRESHOLD && isApproved) {
          isSatisfied = true;
          console.log(`✅ 策略验证通过 - 适配评分 ${fitScore.toFixed(1)}/10，判定: ${strategyOutput.fitAssessment.finalVerdict}`);
        } else {
          console.log(`⏳ 策略验证 - 适配评分 ${fitScore.toFixed(1)}/10，判定: ${strategyOutput.fitAssessment.finalVerdict}，继续优化...`);
          
          if (currentIteration < MAX_ITERATIONS) {
            const revisions = strategyOutput.fitAssessment.revisionSuggestions.slice(0, 2).join('；') || '继续完善';
            this.emit('agent_progress', 
              `适配评分 ${fitScore.toFixed(1)}/10，建议: ${revisions}`, 
              { iteration: currentIteration }
            );
          }
        }
      }

      // 获取最后一次迭代的结果作为最终结果
      const finalIteration = analysisResult.iterations[analysisResult.iterations.length - 1];
      const finalRecruiterOutput = finalIteration.recruiterOutput;
      const finalStrategyOutput = finalIteration.strategyOutput;

      // 更新最终输出（使用策略代理验证后的候选人画像）
      analysisResult.finalOutput = {
        candidateProfile: finalStrategyOutput?.refinedCandidateProfile || finalRecruiterOutput.candidateProfile,
        searchKeywords: finalRecruiterOutput.searchKeywords,
        difficultyLevel: finalRecruiterOutput.difficultyLevel,
        difficultyReasoning: finalRecruiterOutput.difficultyReasoning,
        clarifyingQuestions: finalRecruiterOutput.openQuestions,
        fitAssessment: finalStrategyOutput?.fitAssessment,
        recruitingStrategy: finalStrategyOutput?.recruitingStrategy,
        riskAnalysis: finalStrategyOutput?.riskAnalysis
      };
      analysisResult.status = 'completed';
      analysisResult.completedAt = new Date();

      // 打印 token 使用统计
      console.log(`\n📊 Token 使用统计:`);
      console.log(`   总 Tokens: ${this.tokenUsage.totalUsage.totalTokens.toLocaleString()}`);
      console.log(`   - Prompt Tokens: ${this.tokenUsage.totalUsage.promptTokens.toLocaleString()}`);
      console.log(`   - Completion Tokens: ${this.tokenUsage.totalUsage.completionTokens.toLocaleString()}`);
      console.log(`   总成本: $${this.tokenUsage.totalCost.toFixed(6)}`);
      console.log(`   总耗时: ${(this.tokenUsage.totalLatencyMs / 1000).toFixed(2)}s`);
      console.log(`   迭代次数: ${currentIteration}`);

      console.log(`\n🎉 分析完成，共进行 ${currentIteration} 轮迭代`);
      console.log(`📊 最终适配评分: ${finalStrategyOutput?.fitAssessment.overallFitScore.toFixed(1) || 'N/A'}/10`);
      console.log(`✅ 最终判定: ${finalStrategyOutput?.fitAssessment.finalVerdict || 'N/A'}`);
      console.log(`🔑 搜索关键词: ${finalRecruiterOutput.searchKeywords.join(', ')}`);
      console.log(`📈 难度评估: ${finalRecruiterOutput.difficultyLevel}`);

      // 发送完成事件（包含 token 使用统计）
      this.emit('analysis_complete', '分析完成！', {
        data: {
          ...analysisResult,
          tokenUsage: this.tokenUsage
        }
      });

    } catch (error) {
      console.error('❌ 分析过程出错:', error);
      analysisResult.status = 'failed';
      
      this.emit('error', `分析失败: ${error instanceof Error ? error.message : '未知错误'}`, {
        data: { error: String(error), tokenUsage: this.tokenUsage }
      });
      
      throw error;
    }
  }

  getTokenUsage(): AnalysisTokenUsage {
    return this.tokenUsage;
  }
}
