import { describe, it, expect, beforeAll } from 'vitest';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import type { JobRequisition, AnalysisResult } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量
dotenv.config({ path: resolve(__dirname, '../../../.env') });

// 完整的测试用例职位需求
const fullTestCase: JobRequisition = {
  id: 'integration-test-001',
  basicInfo: {
    title: '企业微信电话销售',
    department: '销售部',
    location: '深圳',
    type: '全职'
  },
  responsibilities: `
    1. 通过企业微信与潜在客户进行电话沟通
    2. 介绍公司产品和服务，挖掘客户需求
    3. 完成销售目标，维护客户关系
    4. 记录客户信息，跟进销售线索
  `,
  qualifications: `
    1、主动性强，能自驱开展工作，具备风险意识，逻辑思维能力强，善于发现问题、分析问题和总结归纳
    2、对数据高度敏感，擅长数据分析，熟练掌握SQL、Excel等数据分析工具
    3、具备出色的项目管理、跨部门沟通和推动能力，能独立负责复杂项目并拿到业务结果
    4、擅长报告撰写、有规则优化、数据分析等相关经验的候选人优先
    5、学历本科，工作年限1年及以上经验
  `,
  additionalContext: {
    salary: '10-20K',
    teamSize: 10,
    urgency: '紧急',
    specialRequirements: '互联网公司，有完善的培训体系'
  },
  status: 'pending',
  createdAt: new Date(),
  updatedAt: new Date()
};

// 创建空的分析结果对象
function createEmptyAnalysisResult(requisitionId: string): AnalysisResult {
  return {
    id: uuidv4(),
    requisitionId,
    iterations: [],
    finalOutput: {
      candidateProfile: {
        summary: '',
        idealBackground: '',
        requiredSkills: [],
        preferredSkills: [],
        experienceLevel: '',
        educationLevel: '',
        personalityTraits: []
      },
      searchKeywords: [],
      difficultyLevel: 'moderate',
      difficultyReasoning: '',
      clarifyingQuestions: []
    },
    status: 'processing',
    createdAt: new Date()
  };
}

describe('Agent Orchestrator - Full Integration Test', () => {
  let AgentOrchestrator: any;

  beforeAll(async () => {
    const module = await import('../agents/AgentOrchestrator.js');
    AgentOrchestrator = module.AgentOrchestrator;
  });

  it('should complete full analysis workflow', async () => {
    console.log('\n🚀 开始完整分析流程测试...\n');

    // 创建 orchestrator（不传 io，用于测试）
    const orchestrator = new AgentOrchestrator();
    const analysisResult = createEmptyAnalysisResult(fullTestCase.id);

    // 执行分析
    await orchestrator.analyze(fullTestCase, analysisResult);

    // 验证结果结构
    expect(analysisResult).toBeDefined();
    expect(analysisResult.status).toBe('completed');
    
    // 验证最终输出
    expect(analysisResult.finalOutput).toBeDefined();
    
    // 验证候选人画像
    expect(analysisResult.finalOutput.candidateProfile).toBeDefined();
    expect(analysisResult.finalOutput.candidateProfile.summary).toBeDefined();
    expect(analysisResult.finalOutput.candidateProfile.requiredSkills).toBeDefined();
    expect(Array.isArray(analysisResult.finalOutput.candidateProfile.requiredSkills)).toBe(true);

    // 验证搜索关键词
    expect(analysisResult.finalOutput.searchKeywords).toBeDefined();
    expect(Array.isArray(analysisResult.finalOutput.searchKeywords)).toBe(true);
    expect(analysisResult.finalOutput.searchKeywords.length).toBeLessThanOrEqual(5);

    // 验证难度评估
    expect(analysisResult.finalOutput.difficultyLevel).toBeDefined();
    expect(['easy', 'moderate', 'hard', 'very_hard']).toContain(analysisResult.finalOutput.difficultyLevel);

    // 验证澄清问题
    expect(analysisResult.finalOutput.clarifyingQuestions).toBeDefined();
    expect(Array.isArray(analysisResult.finalOutput.clarifyingQuestions)).toBe(true);

    // 验证迭代历史
    expect(analysisResult.iterations).toBeDefined();
    expect(Array.isArray(analysisResult.iterations)).toBe(true);
    expect(analysisResult.iterations.length).toBeGreaterThanOrEqual(1);

    // 打印最终结果摘要
    console.log('\n📊 分析结果摘要:');
    console.log('================');
    console.log('\n👤 候选人画像:');
    console.log('  - 概述:', analysisResult.finalOutput.candidateProfile.summary);
    console.log('  - 理想背景:', analysisResult.finalOutput.candidateProfile.idealBackground);
    console.log('  - 必备技能:', analysisResult.finalOutput.candidateProfile.requiredSkills?.join(', '));
    console.log('  - 加分技能:', analysisResult.finalOutput.candidateProfile.preferredSkills?.join(', '));
    
    console.log('\n🔑 搜索关键词:', analysisResult.finalOutput.searchKeywords.join(', '));
    
    console.log('\n📈 难度评估:');
    console.log('  - 等级:', analysisResult.finalOutput.difficultyLevel);
    console.log('  - 原因:', analysisResult.finalOutput.difficultyReasoning);
    
    console.log('\n❓ 澄清问题:');
    analysisResult.finalOutput.clarifyingQuestions.forEach((q: any, i: number) => {
      console.log(`  ${i + 1}. [${q.priority}] ${q.question}`);
    });

    console.log('\n🔄 迭代次数:', analysisResult.iterations.length);
    console.log('✅ 集成测试完成!');
  }, 180000); // 3分钟超时
});

describe('API Endpoints Test', () => {
  const BASE_URL = 'http://localhost:3001/api';

  it('should check health endpoint', async () => {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json() as { status: string; message?: string };
    
    expect(response.ok).toBe(true);
    expect(data.status).toBe('ok');
    console.log('Health check:', data);
  });

  it('should get LLM config', async () => {
    const response = await fetch(`${BASE_URL}/config/llm`);
    const data = await response.json() as { provider: string; model: string };
    
    expect(response.ok).toBe(true);
    expect(data.provider).toBeDefined();
    expect(data.model).toBeDefined();
    console.log('LLM Config:', data);
  });

  it('should create requisition and start analysis', async () => {
    const requisition = {
      basicInfo: {
        title: 'API测试职位',
        department: '测试部',
        location: '上海',
        type: '全职'
      },
      responsibilities: '负责测试工作',
      qualifications: '有测试经验',
      additionalContext: {
        urgency: '正常'
      }
    };

    const response = await fetch(`${BASE_URL}/requisitions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requisition)
    });

    const data = await response.json() as { requisitionId: string };
    
    expect(response.ok).toBe(true);
    expect(data.requisitionId).toBeDefined();
    console.log('Created requisition:', data.requisitionId);
  });
});
