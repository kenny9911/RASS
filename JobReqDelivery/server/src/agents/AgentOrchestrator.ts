import { Server } from 'socket.io';
import { JobRequisition, AnalysisResult, AgentIteration, TokenUsage, AnalysisTokenUsage } from '../types/index.js';
import { requirementsAnalyzer } from './RequirementsAnalyzer.js';
import { jobMarketResearcher } from './JobMarketResearcher.js';
import { professionalRecruiter } from './ProfessionalRecruiter.js';
import { emitAgentProgress } from '../websocket/index.js';
import { llmService } from '../llm/LLMService.js';

const MAX_ITERATIONS = 3;
const SATISFACTION_THRESHOLD = 8; // 满意度阈值（1-10分）

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
        recruiter: createEmptyUsage()
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
      agent?: 'analyzer' | 'researcher' | 'recruiter';
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

  private updateTokenUsage(agent: 'analyzer' | 'researcher' | 'recruiter', usage: TokenUsage, latencyMs: number): void {
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

        // 保存迭代结果
        const iteration: AgentIteration = {
          iteration: currentIteration,
          analyzerOutput,
          researcherOutput,
          recruiterOutput,
          timestamp: new Date()
        };
        analysisResult.iterations.push(iteration);

        // 检查满意度
        if (recruiterOutput.satisfactionScore >= SATISFACTION_THRESHOLD) {
          isSatisfied = true;
          console.log(`✅ 招聘官满意度达标 (${recruiterOutput.satisfactionScore}/10)，结束迭代`);
        } else {
          console.log(`⏳ 招聘官满意度 ${recruiterOutput.satisfactionScore}/10，继续优化...`);
          
          if (currentIteration < MAX_ITERATIONS) {
            this.emit('agent_progress', 
              `满意度 ${recruiterOutput.satisfactionScore}/10，进行下一轮优化`, 
              { iteration: currentIteration }
            );
          }
        }
      }

      // 获取最后一次迭代的结果作为最终结果
      const finalIteration = analysisResult.iterations[analysisResult.iterations.length - 1];
      const finalRecruiterOutput = finalIteration.recruiterOutput;

      // 更新最终输出
      analysisResult.finalOutput = {
        candidateProfile: finalRecruiterOutput.candidateProfile,
        searchKeywords: finalRecruiterOutput.searchKeywords,
        difficultyLevel: finalRecruiterOutput.difficultyLevel,
        difficultyReasoning: finalRecruiterOutput.difficultyReasoning,
        clarifyingQuestions: finalRecruiterOutput.openQuestions
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
      console.log(`📊 最终满意度: ${finalRecruiterOutput.satisfactionScore}/10`);
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
