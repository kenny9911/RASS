import { describe, it, expect, beforeAll } from 'vitest';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import type { JobRequisition, RequirementsAnalyzerOutput, JobMarketResearcherOutput } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量
dotenv.config({ path: resolve(__dirname, '../../../.env') });

// 测试用的职位需求数据（符合 JobRequisition 接口）
const testJobRequisition: JobRequisition = {
  id: 'test-001',
  basicInfo: {
    title: '数据分析师',
    department: '数据部',
    location: '北京',
    type: '全职'
  },
  responsibilities: `
    1. 负责公司业务数据的收集、整理和分析
    2. 制作数据报表和可视化展示
    3. 发现业务问题并提出优化建议
    4. 跨部门协作，支持业务决策
  `,
  qualifications: `
    1、主动性强，能自驱开展工作，具备风险意识，逻辑思维能力强，善于发现问题、分析问题和总结归纳
    2、对数据高度敏感，擅长数据分析，熟练掌握SQL、Excel等数据分析工具
    3、具备出色的项目管理、跨部门沟通和推动能力，能独立负责复杂项目并拿到业务结果
    4、擅长报告撰写、有规则优化、数据分析等相关经验的候选人优先
    5、学历本科，工作年限1年及以上经验
  `,
  additionalContext: {
    salary: '15-25K',
    teamSize: 5,
    urgency: '正常',
    specialRequirements: '互联网公司，团队氛围好'
  },
  status: 'pending',
  createdAt: new Date(),
  updatedAt: new Date()
};

describe('Requirements Analyzer Agent', () => {
  let RequirementsAnalyzer: any;
  let analyzer: any;

  beforeAll(async () => {
    const module = await import('../agents/RequirementsAnalyzer.js');
    RequirementsAnalyzer = module.RequirementsAnalyzer;
    analyzer = new RequirementsAnalyzer();
  });

  it('should analyze job requisition', async () => {
    const result = await analyzer.analyze(testJobRequisition);

    expect(result).toBeDefined();
    expect(result.standardizedTitle).toBeDefined();
    expect(typeof result.standardizedTitle).toBe('string');
    expect(result.technicalSkills).toBeDefined();
    expect(Array.isArray(result.technicalSkills)).toBe(true);
    expect(result.softSkills).toBeDefined();
    expect(Array.isArray(result.softSkills)).toBe(true);
    expect(result.experienceRequirements).toBeDefined();
    expect(result.clarifyingQuestions).toBeDefined();
    expect(Array.isArray(result.clarifyingQuestions)).toBe(true);
    expect(result.ambiguities).toBeDefined();

    console.log('\n📊 需求分析结果:');
    console.log('  - 标准化职位名称:', result.standardizedTitle);
    console.log('  - 技术技能:', result.technicalSkills.join(', '));
    console.log('  - 软技能:', result.softSkills.join(', '));
    console.log('  - 经验要求:', result.experienceRequirements.join(', '));
    console.log('  - 澄清问题数:', result.clarifyingQuestions.length);
    console.log('  - 模糊点:', result.ambiguities.join(', '));

    return result; // 返回结果供后续测试使用
  }, 60000);
});

describe('Job Market Researcher Agent', () => {
  let JobMarketResearcher: any;
  let researcher: any;

  beforeAll(async () => {
    const module = await import('../agents/JobMarketResearcher.js');
    JobMarketResearcher = module.JobMarketResearcher;
    researcher = new JobMarketResearcher();
  });

  it('should research job market', async () => {
    // 使用模拟的分析结果（符合 RequirementsAnalyzerOutput 接口）
    const mockAnalyzerOutput: RequirementsAnalyzerOutput = {
      standardizedTitle: '数据分析师',
      technicalSkills: ['SQL', 'Excel', '数据分析', 'Python'],
      softSkills: ['逻辑思维', '沟通能力', '问题解决'],
      experienceRequirements: ['1年以上数据分析经验', '本科及以上学历'],
      clarifyingQuestions: [
        {
          id: 'q1',
          question: '团队规模多大？',
          category: '团队',
          priority: 'medium',
          isAnswered: false
        }
      ],
      ambiguities: ['项目复杂度定义不明确']
    };

    const result = await researcher.research(mockAnalyzerOutput);

    expect(result).toBeDefined();
    expect(result.similarTitles).toBeDefined();
    expect(Array.isArray(result.similarTitles)).toBe(true);
    expect(result.industryBenchmarks).toBeDefined();
    expect(result.industryBenchmarks.salaryRange).toBeDefined();
    expect(result.idealCandidateProfile).toBeDefined();
    expect(result.capabilityMatrix).toBeDefined();
    expect(result.capabilityMatrix.mustHave).toBeDefined();
    expect(result.capabilityMatrix.niceToHave).toBeDefined();

    console.log('\n📊 市场研究结果:');
    console.log('  - 相似职位:', result.similarTitles.join(', '));
    console.log('  - 薪资范围:', result.industryBenchmarks.salaryRange);
    console.log('  - 市场需求:', result.industryBenchmarks.marketDemand);
    console.log('  - 必备能力:', result.capabilityMatrix.mustHave.join(', '));
    console.log('  - 加分能力:', result.capabilityMatrix.niceToHave.join(', '));

    return result;
  }, 60000);
});

describe('Professional Recruiter Agent', () => {
  let ProfessionalRecruiter: any;
  let recruiter: any;

  beforeAll(async () => {
    const module = await import('../agents/ProfessionalRecruiter.js');
    ProfessionalRecruiter = module.ProfessionalRecruiter;
    recruiter = new ProfessionalRecruiter();
  });

  it('should evaluate and synthesize results', async () => {
    // 模拟分析师输出
    const mockAnalyzerOutput: RequirementsAnalyzerOutput = {
      standardizedTitle: '数据分析师',
      technicalSkills: ['SQL', 'Excel', '数据分析', 'Python'],
      softSkills: ['逻辑思维', '沟通能力', '问题解决', '项目管理'],
      experienceRequirements: ['1年以上数据分析经验', '本科及以上学历'],
      clarifyingQuestions: [
        {
          id: 'q1',
          question: '团队规模多大？',
          category: '团队',
          priority: 'medium',
          isAnswered: false
        },
        {
          id: 'q2',
          question: '是否需要机器学习经验？',
          category: '技术',
          priority: 'high',
          isAnswered: false
        }
      ],
      ambiguities: ['项目复杂度定义不明确']
    };

    // 模拟研究员输出
    const mockResearcherOutput: JobMarketResearcherOutput = {
      similarTitles: ['业务分析师', '数据专员', 'BI分析师'],
      industryBenchmarks: {
        salaryRange: '15-30K/月',
        experienceLevels: '1-3年为主',
        marketDemand: '需求旺盛，人才竞争激烈'
      },
      idealCandidateProfile: {
        summary: '具备数据分析能力和业务理解能力的复合型人才',
        idealBackground: '统计学、计算机或相关专业本科以上',
        requiredSkills: ['SQL', 'Excel', '数据分析'],
        preferredSkills: ['Python', 'Tableau', '机器学习'],
        experienceLevel: '1-3年',
        educationLevel: '本科及以上',
        personalityTraits: ['细心', '逻辑性强', '善于沟通']
      },
      capabilityMatrix: {
        mustHave: ['SQL查询', '数据处理', '报表制作'],
        niceToHave: ['Python编程', '数据可视化', '机器学习基础']
      }
    };

    const result = await recruiter.evaluate(
      testJobRequisition,
      mockAnalyzerOutput,
      mockResearcherOutput,
      1 // 第一次迭代
    );

    expect(result).toBeDefined();
    expect(result.answeredQuestions).toBeDefined();
    expect(Array.isArray(result.answeredQuestions)).toBe(true);
    expect(result.openQuestions).toBeDefined();
    expect(Array.isArray(result.openQuestions)).toBe(true);
    expect(result.satisfactionScore).toBeDefined();
    expect(typeof result.satisfactionScore).toBe('number');
    expect(result.satisfactionScore).toBeGreaterThanOrEqual(1);
    expect(result.satisfactionScore).toBeLessThanOrEqual(10);
    expect(result.candidateProfile).toBeDefined();
    expect(result.searchKeywords).toBeDefined();
    expect(Array.isArray(result.searchKeywords)).toBe(true);
    expect(result.difficultyLevel).toBeDefined();
    expect(['easy', 'moderate', 'hard', 'very_hard']).toContain(result.difficultyLevel);

    console.log('\n📊 招聘官评估结果:');
    console.log('  - 已回答问题数:', result.answeredQuestions.length);
    console.log('  - 待澄清问题数:', result.openQuestions.length);
    console.log('  - 满意度分数:', result.satisfactionScore, '/10');
    console.log('  - 满意度原因:', result.satisfactionReason);
    console.log('  - 搜索关键词:', result.searchKeywords.join(', '));
    console.log('  - 难度等级:', result.difficultyLevel);
    console.log('  - 难度原因:', result.difficultyReasoning);
  }, 60000);
});
