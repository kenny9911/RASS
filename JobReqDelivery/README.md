# JobReqDelivery - 职位需求澄清智能助手

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-18%2B-brightgreen.svg)

**一个基于 AI 多代理系统的职位需求分析工具，通过表单驱动的方式帮助招聘团队更好地理解和澄清职位需求。**

[功能特点](#功能特点) • [架构设计](#架构设计) • [快速开始](#快速开始) • [API 文档](#api-文档) • [开发指南](#开发指南)

</div>

---

## 📋 概述

JobReqDelivery 是 RAAS（Recruitment Automation Agent System）的核心模块之一，专注于从客户侧获取招聘需求的第一步。它采用表单驱动的交互方式，用户通过填写结构化表单提供职位信息，系统通过三个协同工作的 AI 代理自动分析需求并生成招聘方案。

### 核心价值

- **降低沟通成本**: 通过结构化表单引导用户提供完整信息
- **智能需求分析**: AI 自动识别需求中的模糊点和缺失信息
- **精准候选人画像**: 生成可直接用于简历搜索的候选人描述
- **可量化评估**: 提供招聘难度评估和具体建议

## ✨ 功能特点

### 核心功能

| 功能 | 描述 |
|------|------|
| 🧠 **智能需求分析** | 三个 AI 代理协同工作，深入分析职位需求 |
| 🔄 **迭代优化** | 最多 3 轮迭代分析，确保结果质量 |
| 👤 **候选人画像** | 自动生成理想候选人的详细画像 |
| 🔑 **搜索关键词** | 提供 5 个精准的人才搜索关键词 |
| 📊 **难度评估** | 评估填补职位的难度并给出建议 |
| ❓ **澄清问题** | 识别需要客户确认的关键问题 |
| 📱 **移动优先** | 响应式设计，完美支持手机和平板 |
| ⚡ **实时更新** | WebSocket 实时推送分析进度 |
| 💰 **Token 追踪** | 实时显示 LLM 调用的 Token 使用量和成本 |

### 用户界面

- **多步骤表单**: 分步引导用户填写职位信息
- **实时进度展示**: 可视化 AI 代理的工作进度
- **结果仪表板**: 清晰展示分析结果和建议
- **历史记录**: 保存和查看历史分析记录

## 🏗️ 架构设计

### 系统架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Client (Vite)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  JobReqForm │  │AgentProgress│  │ResultsDash  │              │
│  │  (多步表单)  │  │  (进度可视化)│  │  (结果展示)  │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                      │
│         └────────────────┼────────────────┘                      │
│                          │                                       │
│                    ┌─────┴─────┐                                 │
│                    │ Socket.io │                                 │
│                    │  Client   │                                 │
│                    └─────┬─────┘                                 │
└──────────────────────────┼───────────────────────────────────────┘
                           │ WebSocket
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Express Server (Node.js)                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                   Agent Orchestrator                         ││
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         ││
│  │  │ Requirements │ │  Job Market  │ │ Professional │         ││
│  │  │   Analyzer   │→│  Researcher  │→│  Recruiter   │         ││
│  │  │   (分析师)    │ │   (研究员)   │ │   (招聘官)   │         ││
│  │  └──────────────┘ └──────────────┘ └──────────────┘         ││
│  └─────────────────────────────────────────────────────────────┘│
│                          │                                       │
│                    ┌─────┴─────┐                                 │
│                    │LLM Service│                                 │
│                    │  (抽象层)  │                                 │
│                    └─────┬─────┘                                 │
└──────────────────────────┼───────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
   ┌──────────┐     ┌──────────┐     ┌──────────┐
   │OpenRouter│     │  OpenAI  │     │  Ollama  │
   │ (默认)   │     │          │     │ (本地)   │
   └──────────┘     └──────────┘     └──────────┘
```

### AI 代理系统

系统采用三代理协作架构，通过迭代优化确保结果质量：

#### 1. 需求分析师 (Requirements Analyzer)

**职责**: 分析职位需求的完整性和清晰度

**输出**:
- `standardizedTitle`: 标准化职位名称
- `technicalSkills`: 技术技能列表
- `softSkills`: 软技能列表
- `experienceRequirements`: 经验要求
- `clarifyingQuestions`: 需要澄清的问题
- `ambiguities`: 模糊不清的点

#### 2. 市场研究员 (Job Market Researcher)

**职责**: 研究人才市场，构建理想候选人画像

**输出**:
- `similarTitles`: 类似职位名称
- `industryBenchmarks`: 行业基准（薪资、经验、市场需求）
- `idealCandidateProfile`: 理想候选人画像
- `capabilityMatrix`: 能力矩阵（必备/加分）

#### 3. 专业招聘官 (Professional Recruiter)

**职责**: 综合评估，制定搜索策略，评估招聘难度

**输出**:
- `candidateProfile`: 最终候选人画像
- `searchKeywords`: 5 个搜索关键词
- `difficultyLevel`: 难度等级 (easy/moderate/hard/very_hard)
- `difficultyReasoning`: 难度评估理由
- `satisfactionScore`: 信息满意度 (1-10)
- `openQuestions`: 待解答问题

### 迭代流程

```
开始 → 分析师分析 → 研究员调研 → 招聘官评估
                                    ↓
                            满意度 ≥ 8?
                           /          \
                         是            否
                         ↓              ↓
                       完成        迭代次数 < 3?
                                  /          \
                                是            否
                                ↓              ↓
                           下一轮迭代        强制完成
```

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装步骤

1. **进入项目目录**
   ```bash
   cd JobReqDelivery
   ```

2. **配置环境变量**

   在项目根目录创建 `.env` 文件：
   ```env
   # LLM 配置
   LLM_PROVIDER=openrouter
   LLM_MODEL=google/gemini-3-flash-preview

   # API Keys (选择一个提供商)
   OPENROUTER_API_KEY=your_openrouter_api_key
   # OPENAI_API_KEY=your_openai_api_key
   # ANTHROPIC_API_KEY=your_anthropic_api_key
   # OLLAMA_BASE_URL=http://localhost:11434

   # 应用配置
   PORT=3001
   CLIENT_URL=http://localhost:5183
   ```

3. **安装依赖**
   ```bash
   # 安装服务端依赖
   cd server && npm install

   # 安装客户端依赖
   cd ../client && npm install
   ```

4. **启动开发服务器**

   在两个终端中分别运行：
   ```bash
   # 终端 1 - 启动后端
   cd server && npm run dev

   # 终端 2 - 启动前端
   cd client && npm run dev
   ```

5. **访问应用**

   打开浏览器访问 http://localhost:5183

## 📁 项目结构

```
JobReqDelivery/
├── client/                          # React 前端应用
│   ├── src/
│   │   ├── components/
│   │   │   ├── JobReqForm/          # 多步骤输入表单
│   │   │   │   ├── BasicInfoStep.tsx    # 基本信息步骤
│   │   │   │   ├── ResponsibilitiesStep.tsx
│   │   │   │   ├── QualificationsStep.tsx
│   │   │   │   └── AdditionalStep.tsx
│   │   │   ├── AgentProgress/       # AI代理进度可视化
│   │   │   │   ├── AgentCard.tsx
│   │   │   │   └── ProgressTimeline.tsx
│   │   │   ├── ResultsDashboard/    # 结果仪表板
│   │   │   │   ├── CandidateProfile.tsx
│   │   │   │   ├── SearchKeywords.tsx
│   │   │   │   ├── DifficultyAssessment.tsx
│   │   │   │   └── ClarifyingQuestions.tsx
│   │   │   ├── TokenUsage/          # Token 使用量显示
│   │   │   └── common/              # 共享UI组件
│   │   ├── hooks/
│   │   │   ├── useSocket.ts         # WebSocket 连接
│   │   │   ├── useAnalysisHistory.ts
│   │   │   └── useInputHistory.ts
│   │   ├── services/
│   │   │   ├── api.ts               # REST API 客户端
│   │   │   └── historyStorage.ts    # 本地存储
│   │   ├── context/
│   │   │   └── AppContext.tsx       # 全局状态管理
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript 类型定义
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── server/                          # Node.js 后端服务
│   ├── src/
│   │   ├── agents/
│   │   │   ├── AgentOrchestrator.ts # 代理编排器
│   │   │   ├── RequirementsAnalyzer.ts
│   │   │   ├── JobMarketResearcher.ts
│   │   │   └── ProfessionalRecruiter.ts
│   │   ├── llm/
│   │   │   ├── LLMService.ts        # LLM 服务抽象层
│   │   │   └── providers/
│   │   │       ├── OpenRouterProvider.ts
│   │   │       ├── OpenAIProvider.ts
│   │   │       ├── AnthropicProvider.ts
│   │   │       └── OllamaProvider.ts
│   │   ├── routes/
│   │   │   ├── requisitions.ts      # 需求分析 API
│   │   │   └── config.ts            # 配置 API
│   │   ├── websocket/
│   │   │   └── index.ts             # WebSocket 事件处理
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── tests/                   # 测试文件
│   │   └── index.ts                 # 服务入口
│   ├── package.json
│   ├── tsconfig.json
│   └── vitest.config.ts
│
├── .env                             # 环境变量配置
└── README.md
```

## 📡 API 文档

### REST API

#### 创建职位需求分析

```http
POST /api/requisitions
Content-Type: application/json

{
  "basicInfo": {
    "title": "高级前端工程师",
    "department": "技术部",
    "location": "北京",
    "type": "全职"
  },
  "responsibilities": "负责公司核心产品的前端开发...",
  "qualifications": "5年以上前端开发经验...",
  "additionalContext": {
    "salary": "30-50K",
    "teamSize": 10,
    "urgency": "high",
    "specialRequirements": "需要有大型项目经验"
  }
}
```

**响应**:
```json
{
  "id": "req_abc123",
  "status": "processing",
  "message": "分析已开始，请通过 WebSocket 接收进度更新"
}
```

#### 获取分析结果

```http
GET /api/requisitions/:id
```

**响应**:
```json
{
  "id": "req_abc123",
  "status": "completed",
  "finalOutput": {
    "candidateProfile": {
      "summary": "...",
      "idealBackground": "...",
      "requiredSkills": ["React", "TypeScript", "..."],
      "preferredSkills": ["..."],
      "experienceLevel": "5-8年",
      "educationLevel": "本科及以上",
      "personalityTraits": ["..."]
    },
    "searchKeywords": ["高级前端", "React专家", "..."],
    "difficultyLevel": "moderate",
    "difficultyReasoning": "...",
    "clarifyingQuestions": [...]
  },
  "tokenUsage": {
    "totalUsage": {
      "promptTokens": 5000,
      "completionTokens": 2000,
      "totalTokens": 7000,
      "cost": 0.05
    },
    "totalLatencyMs": 15000,
    "iterations": 2
  }
}
```

#### 提交澄清答案

```http
POST /api/requisitions/:id/clarify
Content-Type: application/json

{
  "answers": {
    "question_id_1": "答案1",
    "question_id_2": "答案2"
  }
}
```

#### 获取/设置 LLM 配置

```http
GET /api/config/llm

POST /api/config/llm
Content-Type: application/json

{
  "provider": "openrouter",
  "model": "google/gemini-3-flash-preview"
}
```

#### 健康检查

```http
GET /api/health
```

### WebSocket 事件

连接到 WebSocket 并加入特定分析的房间：

```javascript
const socket = io('http://localhost:3001');

// 加入分析房间
socket.emit('join', requisitionId);

// 监听进度事件
socket.on('agent_progress', (event) => {
  console.log(event);
});
```

#### 事件类型

| 事件类型 | 描述 | 数据 |
|---------|------|------|
| `agent_start` | 代理开始工作 | `{ agent, message }` |
| `agent_progress` | 代理工作进度 | `{ agent, message, iteration }` |
| `agent_complete` | 代理完成工作 | `{ agent, data, usage, latencyMs }` |
| `iteration_complete` | 迭代完成 | `{ iteration }` |
| `analysis_complete` | 分析全部完成 | `{ data, tokenUsage }` |
| `token_usage` | Token 使用量更新 | `{ agentUsage, totalUsage }` |
| `error` | 错误发生 | `{ message, error }` |

## 🔧 技术栈

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.2 | UI 框架 |
| TypeScript | 5.3 | 类型安全 |
| Vite | 5.0 | 构建工具 |
| Tailwind CSS | 3.4 | 样式框架 |
| Framer Motion | 11.0 | 动画效果 |
| TanStack Query | 5.17 | 数据获取 |
| Socket.io Client | 4.7 | 实时通信 |
| Lucide React | 0.312 | 图标库 |

### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 18+ | 运行环境 |
| Express | 4.18 | Web 框架 |
| TypeScript | 5.3 | 类型安全 |
| Socket.io | 4.7 | 实时通信 |
| dotenv | 16.4 | 环境变量 |
| Vitest | 4.0 | 测试框架 |

### LLM 提供商

| 提供商 | 环境变量 | 推荐模型 |
|--------|----------|----------|
| OpenRouter (默认) | `OPENROUTER_API_KEY` | google/gemini-3-flash-preview |
| OpenAI | `OPENAI_API_KEY` | gpt-4o |
| Anthropic | `ANTHROPIC_API_KEY` | claude-3-sonnet |
| Ollama | `OLLAMA_BASE_URL` | llama3 |

## 📖 使用流程

### 1. 填写职位需求表单

表单分为四个步骤：

**步骤 1 - 基本信息**
- 职位名称
- 部门
- 工作地点
- 雇佣类型（全职/兼职/合同）

**步骤 2 - 岗位职责**
- 详细描述工作内容和职责

**步骤 3 - 任职资格**
- 技能要求
- 经验要求
- 学历要求

**步骤 4 - 补充信息**
- 薪资范围（可选）
- 团队规模（可选）
- 紧急程度
- 特殊要求（可选）

### 2. AI 分析过程

提交表单后，系统自动启动三个 AI 代理：

1. **需求分析师** 分析需求完整性
2. **市场研究员** 调研人才市场
3. **专业招聘官** 综合评估并给出建议

系统会实时显示每个代理的工作进度和 Token 使用情况。

### 3. 查看分析结果

分析完成后，可以查看：

- **候选人画像**: 理想候选人的详细描述
- **搜索关键词**: 5 个精准的搜索词
- **难度评估**: 招聘难度和建议
- **澄清问题**: 需要确认的关键问题

### 4. 导出结果

支持导出 JSON 格式的完整分析结果，可用于后续的招聘流程。

## 🧪 测试

```bash
cd server

# 运行所有测试
npm test

# 运行 LLM 相关测试
npm run test:llm

# 运行代理测试
npm run test:agents

# 运行集成测试
npm run test:integration

# 监听模式
npm run test:watch
```

## 🚢 部署

### 生产环境构建

```bash
# 构建前端
cd client && npm run build

# 构建后端
cd ../server && npm run build
```

### Docker 部署

```dockerfile
# Dockerfile 示例
FROM node:18-alpine

WORKDIR /app

# 复制并安装服务端
COPY server/package*.json ./server/
RUN cd server && npm ci --production

# 复制并构建客户端
COPY client/package*.json ./client/
RUN cd client && npm ci && npm run build

# 复制源代码
COPY server/ ./server/
COPY client/dist ./client/dist

# 构建服务端
RUN cd server && npm run build

EXPOSE 3001

CMD ["node", "server/dist/index.js"]
```

## 🤝 与 RAAS 系统集成

JobReqDelivery 是 RAAS 系统的第一个入口模块，其输出可以无缝对接：

- **招聘工作台**: 将分析结果推送到招聘工作台进行后续管理
- **策略设计器**: 基于候选人画像设计招聘策略
- **Pipeline 追踪**: 跟踪需求的完整招聘周期

## 📄 许可证

MIT License

---

<div align="center">

**[返回 RAAS 主项目](../README.md)**

</div>
