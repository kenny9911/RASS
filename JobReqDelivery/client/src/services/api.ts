import { FormData, AnalysisResult, JobRequisition } from '../types';

const API_BASE = '/api';

// 创建职位需求分析
export async function createRequisition(data: FormData): Promise<{
  requisitionId: string;
  analysisId: string;
  message: string;
}> {
  const response = await fetch(`${API_BASE}/requisitions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '提交失败');
  }

  return response.json();
}

// 获取分析结果
export async function getAnalysisResult(requisitionId: string): Promise<{
  requisition: JobRequisition;
  analysis: AnalysisResult | null;
}> {
  const response = await fetch(`${API_BASE}/requisitions/${requisitionId}`);

  if (!response.ok) {
    throw new Error('获取结果失败');
  }

  return response.json();
}

// 提交澄清问题答案
export async function submitClarifications(
  requisitionId: string,
  answers: Array<{ questionId: string; answer: string }>
): Promise<{ message: string; analysis: AnalysisResult }> {
  const response = await fetch(`${API_BASE}/requisitions/${requisitionId}/clarify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ answers })
  });

  if (!response.ok) {
    throw new Error('提交答案失败');
  }

  return response.json();
}

// 获取 LLM 配置
export async function getLLMConfig(): Promise<{
  provider: string;
  model: string;
  availableProviders: Array<{
    id: string;
    name: string;
    models: string[];
  }>;
}> {
  const response = await fetch(`${API_BASE}/config/llm`);

  if (!response.ok) {
    throw new Error('获取配置失败');
  }

  return response.json();
}

// 更新 LLM 配置
export async function updateLLMConfig(config: {
  provider?: string;
  model?: string;
}): Promise<{ message: string; config: { provider: string; model: string } }> {
  const response = await fetch(`${API_BASE}/config/llm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(config)
  });

  if (!response.ok) {
    throw new Error('更新配置失败');
  }

  return response.json();
}
