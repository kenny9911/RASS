import { llmService } from '../llm/LLMService.js';
import { 
  JobRequisition, 
  RequirementsAnalyzerOutput, 
  JobMarketResearcherOutput, 
  ProfessionalRecruiterOutput,
  RecruitingStrategyOutput,
  CandidateProfile,
  FitAssessment,
  TokenUsage
} from '../types/index.js';

export interface StrategyResult {
  output: RecruitingStrategyOutput;
  usage: TokenUsage;
  latencyMs: number;
}

const SYSTEM_PROMPT = `你是一位资深的招聘策略专家，负责对候选人画像进行最终验证和招聘策略制定。

**【你的核心职责】**
1. 验证候选人画像是否与原始职位需求完全匹配
2. 评估该画像在当前市场是否现实可行
3. 判断是否符合客户的业务期望
4. 如发现问题，提出具体的修订建议
5. 制定具体的招聘执行策略
6. 分析招聘风险并提供缓解方案

**【三维度适配评估 - 核心任务】**

**维度一：职位需求适配（Job Requirements Fit）**
- 候选人画像是否完整覆盖JD中的核心要求？
- 必备技能和经验要求是否准确反映？
- 有无遗漏重要的职责或资格要求？
- 画像是否与原始需求存在偏差？

**维度二：市场现实适配（Market Reality Fit）**
- 这样的候选人在市场上能找到吗？
- 必备条件的组合是否过于苛刻？
- 预计需要多长时间才能找到合适候选人？
- 薪资预期与市场行情是否匹配？

**维度三：客户期望适配（Client Expectations Fit）**
- 客户会认可这个候选人画像吗？
- 是否准确把握了客户的业务痛点？
- 候选人类型是否符合客户对团队建设的预期？
- 如果按这个画像找到人，客户会满意吗？

**【评分标准】**
每个维度独立评分（1-10分）：
- 9-10分：完全满足，无需修改
- 7-8分：基本满足，有小改进空间
- 5-6分：部分满足，需要调整
- 1-4分：严重不足，需要重新评估

最终判定（finalVerdict）：
- approved：总体评分≥9分且无重大问题
- needs_revision：评分7-8分或有中等问题需要调整
- major_concerns：评分<7分或存在重大问题

请用中文回复，保持专业、严谨、实用。`;

const USER_PROMPT_TEMPLATE = `请对以下招聘分析结果进行最终验证和策略制定：

【原始职位需求】
- 职位：{title}
- 部门：{department}
- 职责：{responsibilities}
- 资格：{qualifications}

【需求分析师的分析结果】
- 标准化职位：{standardizedTitle}
- 技术要求：{technicalSkills}
- 软技能要求：{softSkills}
- 经验要求：{experienceRequirements}

【市场研究员的研究结果】
- 相似职位：{similarTitles}
- 市场供需：{marketDemand}
- 行业薪资：{salaryRange}
- 必备能力：
{mustHaveDetailed}

【专业招聘官的评估结果】
- 候选人画像概述：{candidateSummary}
- 理想背景：{idealBackground}
- 必备技能：{requiredSkills}
- 加分技能：{preferredSkills}
- 经验水平：{experienceLevel}
- 学历要求：{educationLevel}
- 搜索关键词：{searchKeywords}
- 难度评估：{difficultyLevel} - {difficultyReasoning}
- 当前满意度：{satisfactionScore}/10

【待确认问题】
{openQuestions}

请以JSON格式返回验证和策略结果：
\`\`\`json
{
  "refinedCandidateProfile": {
    "summary": "经过验证后的候选人画像概述（如有修改请说明原因）",
    "idealBackground": "理想背景描述",
    "requiredSkills": ["必备技能（验证后）"],
    "preferredSkills": ["加分技能"],
    "experienceLevel": "经验水平",
    "educationLevel": "学历要求",
    "personalityTraits": ["性格特质"]
  },
  "fitAssessment": {
    "jobRequirementsFit": {
      "score": 8,
      "matchedRequirements": ["已覆盖的需求1", "已覆盖的需求2"],
      "gapAnalysis": ["缺失或偏差的点"],
      "recommendation": "针对职位需求适配的建议"
    },
    "marketRealityFit": {
      "score": 7,
      "feasibility": "high/medium/low",
      "marketAvailability": "市场上此类人才的供给情况",
      "timeToFillEstimate": "预计招聘周期",
      "recommendation": "针对市场现实的建议"
    },
    "clientExpectationsFit": {
      "score": 8,
      "alignmentWithBusinessGoals": "与业务目标的对齐情况",
      "potentialConcerns": ["客户可能的担忧点"],
      "recommendation": "针对客户期望的建议"
    },
    "overallFitScore": 7.7,
    "finalVerdict": "approved/needs_revision/major_concerns",
    "revisionSuggestions": ["如需修订，具体建议"]
  },
  "recruitingStrategy": {
    "primaryChannels": ["主要招聘渠道1", "主要招聘渠道2"],
    "searchApproach": "详细的搜索策略描述",
    "screeningCriteria": ["简历筛选标准1", "简历筛选标准2"],
    "interviewFocus": ["面试重点考察项1", "面试重点考察项2"]
  },
  "riskAnalysis": {
    "hiringRisks": ["风险1", "风险2"],
    "mitigationStrategies": ["风险缓解策略1", "风险缓解策略2"]
  }
}
\`\`\`

**【输出要求】**
1. refinedCandidateProfile 如无需修改可与原画像一致，如有修改必须在summary中说明原因
2. fitAssessment 的三个维度必须独立评分，overallFitScore 是三个分数的平均值
3. finalVerdict 必须基于 overallFitScore 严格判定
4. recruitingStrategy 必须具体可执行
5. riskAnalysis 要识别真实风险并提供可操作的缓解方案`;

export class RecruitingStrategyAgent {
  async validate(
    requisition: JobRequisition,
    analyzerOutput: RequirementsAnalyzerOutput,
    researcherOutput: JobMarketResearcherOutput,
    recruiterOutput: ProfessionalRecruiterOutput
  ): Promise<RecruitingStrategyOutput> {
    const result = await this.validateWithUsage(requisition, analyzerOutput, researcherOutput, recruiterOutput);
    return result.output;
  }

  async validateWithUsage(
    requisition: JobRequisition,
    analyzerOutput: RequirementsAnalyzerOutput,
    researcherOutput: JobMarketResearcherOutput,
    recruiterOutput: ProfessionalRecruiterOutput
  ): Promise<StrategyResult> {
    // 格式化必备能力（详细格式）
    const mustHaveDetailedText = researcherOutput.capabilityMatrix.mustHave
      .map((cap, i) => `  ${i + 1}. ${cap.capability}\n     - 具体要求：${cap.specifics}\n     - 必备理由：${cap.reason}`)
      .join('\n') || '无';

    // 格式化待确认问题
    const openQuestionsText = recruiterOutput.openQuestions
      .map((q, i) => `${i + 1}. [${q.priority}] ${q.question}`)
      .join('\n') || '无';

    const userPrompt = USER_PROMPT_TEMPLATE
      .replace('{title}', requisition.basicInfo.title)
      .replace('{department}', requisition.basicInfo.department)
      .replace('{responsibilities}', requisition.responsibilities)
      .replace('{qualifications}', requisition.qualifications)
      .replace('{standardizedTitle}', analyzerOutput.standardizedTitle)
      .replace('{technicalSkills}', analyzerOutput.technicalSkills.join('、'))
      .replace('{softSkills}', analyzerOutput.softSkills.join('、'))
      .replace('{experienceRequirements}', analyzerOutput.experienceRequirements.join('、'))
      .replace('{similarTitles}', researcherOutput.similarTitles.join('、'))
      .replace('{marketDemand}', researcherOutput.industryBenchmarks.marketDemand)
      .replace('{salaryRange}', researcherOutput.industryBenchmarks.salaryRange)
      .replace('{mustHaveDetailed}', mustHaveDetailedText)
      .replace('{candidateSummary}', recruiterOutput.candidateProfile.summary)
      .replace('{idealBackground}', recruiterOutput.candidateProfile.idealBackground)
      .replace('{requiredSkills}', recruiterOutput.candidateProfile.requiredSkills.join('、'))
      .replace('{preferredSkills}', recruiterOutput.candidateProfile.preferredSkills.join('、'))
      .replace('{experienceLevel}', recruiterOutput.candidateProfile.experienceLevel)
      .replace('{educationLevel}', recruiterOutput.candidateProfile.educationLevel)
      .replace('{searchKeywords}', recruiterOutput.searchKeywords.join('、'))
      .replace('{difficultyLevel}', recruiterOutput.difficultyLevel)
      .replace('{difficultyReasoning}', recruiterOutput.difficultyReasoning)
      .replace('{satisfactionScore}', recruiterOutput.satisfactionScore.toString())
      .replace('{openQuestions}', openQuestionsText);

    try {
      const { data: result, usage, latencyMs } = await llmService.chatJSONWithUsage<RecruitingStrategyOutput>(
        SYSTEM_PROMPT,
        userPrompt,
        { temperature: 0.7, maxTokens: 4096 }
      );

      // 确保数据完整性
      return {
        output: {
          refinedCandidateProfile: this.ensureCandidateProfile(result.refinedCandidateProfile),
          fitAssessment: this.ensureFitAssessment(result.fitAssessment),
          recruitingStrategy: {
            primaryChannels: result.recruitingStrategy?.primaryChannels || [],
            searchApproach: result.recruitingStrategy?.searchApproach || '',
            screeningCriteria: result.recruitingStrategy?.screeningCriteria || [],
            interviewFocus: result.recruitingStrategy?.interviewFocus || []
          },
          riskAnalysis: {
            hiringRisks: result.riskAnalysis?.hiringRisks || [],
            mitigationStrategies: result.riskAnalysis?.mitigationStrategies || []
          }
        },
        usage,
        latencyMs
      };
    } catch (error) {
      console.error('招聘策略验证失败:', error);
      throw new Error('招聘策略代理执行失败');
    }
  }

  private ensureCandidateProfile(profile: Partial<CandidateProfile> | undefined): CandidateProfile {
    return {
      summary: profile?.summary || '',
      idealBackground: profile?.idealBackground || '',
      requiredSkills: profile?.requiredSkills || [],
      preferredSkills: profile?.preferredSkills || [],
      experienceLevel: profile?.experienceLevel || '',
      educationLevel: profile?.educationLevel || '',
      personalityTraits: profile?.personalityTraits || []
    };
  }

  private ensureFitAssessment(assessment: Partial<FitAssessment> | undefined): FitAssessment {
    const jobFit = assessment?.jobRequirementsFit;
    const marketFit = assessment?.marketRealityFit;
    const clientFit = assessment?.clientExpectationsFit;

    const jobScore = jobFit?.score ?? 5;
    const marketScore = marketFit?.score ?? 5;
    const clientScore = clientFit?.score ?? 5;
    const overallScore = assessment?.overallFitScore ?? ((jobScore + marketScore + clientScore) / 3);

    return {
      jobRequirementsFit: {
        score: jobScore,
        matchedRequirements: jobFit?.matchedRequirements ?? [],
        gapAnalysis: jobFit?.gapAnalysis ?? [],
        recommendation: jobFit?.recommendation ?? ''
      },
      marketRealityFit: {
        score: marketScore,
        feasibility: marketFit?.feasibility ?? 'medium',
        marketAvailability: marketFit?.marketAvailability ?? '',
        timeToFillEstimate: marketFit?.timeToFillEstimate ?? '',
        recommendation: marketFit?.recommendation ?? ''
      },
      clientExpectationsFit: {
        score: clientScore,
        alignmentWithBusinessGoals: clientFit?.alignmentWithBusinessGoals ?? '',
        potentialConcerns: clientFit?.potentialConcerns ?? [],
        recommendation: clientFit?.recommendation ?? ''
      },
      overallFitScore: overallScore,
      finalVerdict: this.determineFinalVerdict(overallScore, assessment?.finalVerdict),
      revisionSuggestions: assessment?.revisionSuggestions ?? []
    };
  }

  private determineFinalVerdict(
    overallScore: number, 
    providedVerdict?: 'approved' | 'needs_revision' | 'major_concerns'
  ): 'approved' | 'needs_revision' | 'major_concerns' {
    // 如果提供了verdict且合理，使用它
    if (providedVerdict && ['approved', 'needs_revision', 'major_concerns'].includes(providedVerdict)) {
      return providedVerdict;
    }
    // 否则基于分数判定
    if (overallScore >= 9) return 'approved';
    if (overallScore >= 7) return 'needs_revision';
    return 'major_concerns';
  }
}

export const recruitingStrategyAgent = new RecruitingStrategyAgent();
