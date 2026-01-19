import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Server } from 'socket.io';
import { JobRequisition, AnalysisResult, ClarifyingQuestion } from '../types/index.js';
import { AgentOrchestrator } from '../agents/AgentOrchestrator.js';

const router = Router();

// 内存存储（生产环境应使用数据库）
const requisitions = new Map<string, JobRequisition>();
const analysisResults = new Map<string, AnalysisResult>();

// 创建新的职位需求分析
router.post('/', async (req: Request, res: Response) => {
  try {
    const { basicInfo, responsibilities, qualifications, additionalContext } = req.body;

    // 验证必填字段
    if (!basicInfo || !responsibilities || !qualifications) {
      return res.status(400).json({ 
        error: '缺少必填字段',
        message: '请填写基本信息、岗位职责和任职资格'
      });
    }

    const requisition: JobRequisition = {
      id: uuidv4(),
      basicInfo,
      responsibilities,
      qualifications,
      additionalContext: additionalContext || { urgency: 'normal' },
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    requisitions.set(requisition.id, requisition);

    // 创建分析结果记录
    const analysisResult: AnalysisResult = {
      id: uuidv4(),
      requisitionId: requisition.id,
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

    analysisResults.set(analysisResult.id, analysisResult);

    // 更新状态
    requisition.status = 'processing';
    requisitions.set(requisition.id, requisition);

    // 获取 Socket.io 实例
    const io: Server = req.app.get('io');

    // 启动异步分析流程
    const orchestrator = new AgentOrchestrator(io, requisition.id);
    orchestrator.analyze(requisition, analysisResult).catch(err => {
      console.error('分析失败:', err);
      analysisResult.status = 'failed';
      analysisResults.set(analysisResult.id, analysisResult);
    });

    res.status(201).json({
      message: '职位需求已提交，正在分析中',
      requisitionId: requisition.id,
      analysisId: analysisResult.id
    });
  } catch (error) {
    console.error('创建职位需求失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取分析结果
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  // 先查找职位需求
  const requisition = requisitions.get(id);
  if (!requisition) {
    return res.status(404).json({ error: '未找到该职位需求' });
  }

  // 查找对应的分析结果
  let result: AnalysisResult | undefined;
  for (const [_, analysis] of analysisResults) {
    if (analysis.requisitionId === id) {
      result = analysis;
      break;
    }
  }

  res.json({
    requisition,
    analysis: result || null
  });
});

// 提交澄清问题的答案
router.post('/:id/clarify', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { answers } = req.body as { answers: Array<{ questionId: string; answer: string }> };

    const requisition = requisitions.get(id);
    if (!requisition) {
      return res.status(404).json({ error: '未找到该职位需求' });
    }

    // 查找对应的分析结果
    let analysisResult: AnalysisResult | undefined;
    for (const [_, analysis] of analysisResults) {
      if (analysis.requisitionId === id) {
        analysisResult = analysis;
        break;
      }
    }

    if (!analysisResult) {
      return res.status(404).json({ error: '未找到分析结果' });
    }

    // 更新答案
    answers.forEach(({ questionId, answer }) => {
      const question = analysisResult!.finalOutput.clarifyingQuestions.find(
        q => q.id === questionId
      );
      if (question) {
        question.answer = answer;
        question.isAnswered = true;
      }
    });

    analysisResults.set(analysisResult.id, analysisResult);

    // 可以在这里触发重新分析
    // TODO: 实现基于新答案的增量分析

    res.json({
      message: '答案已保存',
      analysis: analysisResult
    });
  } catch (error) {
    console.error('提交答案失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取所有职位需求列表
router.get('/', (req: Request, res: Response) => {
  const list = Array.from(requisitions.values()).map(req => ({
    id: req.id,
    title: req.basicInfo.title,
    department: req.basicInfo.department,
    status: req.status,
    createdAt: req.createdAt
  }));

  res.json(list);
});

export { router as requisitionRoutes };
