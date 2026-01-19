# 职位需求澄清智能助手

一个基于 AI 的职位需求分析工具，帮助招聘团队更好地理解和澄清职位需求，生成候选人画像和搜索策略。

## 功能特点

- **智能需求分析**：三个 AI 代理协同工作，深入分析职位需求
- **迭代优化**：最多 3 轮迭代分析，确保结果质量
- **候选人画像**：自动生成理想候选人的详细画像
- **搜索关键词**：提供 5 个精准的人才搜索关键词
- **难度评估**：评估填补职位的难度并给出建议
- **澄清问题**：识别需要客户确认的关键问题
- **移动优先**：响应式设计，完美支持手机和平板

## AI 代理介绍

1. **需求分析师**：分析职位需求，识别关键要求，提出澄清问题
2. **市场研究员**：研究人才市场，构建理想候选人画像
3. **专业招聘官**：综合评估，制定搜索策略，评估招聘难度

## 技术栈

- **前端**：React 18, TypeScript, Tailwind CSS, Framer Motion
- **后端**：Node.js, Express, TypeScript, Socket.io
- **LLM**：OpenRouter (默认), OpenAI, Anthropic, Ollama

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装步骤

1. **克隆项目**
   ```bash
   cd JobReqDelivery
   ```

2. **配置环境变量**
   
   项目根目录的 `.env` 文件中应包含以下配置：
   ```env
   # LLM 配置
   LLM_PROVIDER=openrouter
   LLM_MODEL=google/gemini-3-flash-preview
   
   # API Keys
   OPENROUTER_API_KEY=your_openrouter_api_key
   
   # 可选的其他提供商
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
   cd server
   npm install
   
   # 安装客户端依赖
   cd ../client
   npm install
   ```

4. **启动开发服务器**
   
   在两个终端中分别运行：
   ```bash
   # 终端 1 - 启动后端
   cd server
   npm run dev
   
   # 终端 2 - 启动前端
   cd client
   npm run dev
   ```

5. **访问应用**
   
   打开浏览器访问 http://localhost:5183

## 项目结构

```
JobReqDelivery/
├── client/                    # React 前端
│   ├── src/
│   │   ├── components/
│   │   │   ├── JobReqForm/    # 多步骤输入表单
│   │   │   ├── AgentProgress/ # AI代理进度可视化
│   │   │   ├── ResultsDashboard/ # 结果仪表板
│   │   │   └── common/        # 共享UI组件
│   │   ├── hooks/             # 自定义 React hooks
│   │   ├── services/          # API 客户端
│   │   ├── context/           # React 状态管理
│   │   └── types/             # TypeScript 类型定义
│   └── package.json
├── server/                    # Node.js 后端
│   ├── src/
│   │   ├── routes/            # API 路由
│   │   ├── agents/            # AI 代理实现
│   │   ├── llm/               # LLM 服务商抽象层
│   │   ├── websocket/         # WebSocket 实时更新
│   │   └── types/             # TypeScript 类型定义
│   └── package.json
├── .env                       # 环境变量配置
└── README.md
```

## API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/requisitions` | POST | 创建新的职位需求分析 |
| `/api/requisitions/:id` | GET | 获取分析结果 |
| `/api/requisitions/:id/clarify` | POST | 提交澄清问题的答案 |
| `/api/config/llm` | GET/POST | 获取/设置 LLM 配置 |
| `/api/health` | GET | 健康检查 |

## 使用流程

1. **填写职位需求**
   - 基本信息：职位名称、部门、工作地点、雇佣类型
   - 岗位职责：详细描述工作内容
   - 任职资格：技能要求、经验要求
   - 补充信息：薪资、团队规模、紧急程度

2. **AI 分析**
   - 系统自动启动三个 AI 代理
   - 实时显示分析进度
   - 最多进行 3 轮迭代优化

3. **查看结果**
   - 候选人画像：理想候选人的详细描述
   - 搜索关键词：5 个精准的搜索词
   - 难度评估：招聘难度和建议
   - 澄清问题：需要确认的关键问题

4. **导出结果**
   - 支持导出 JSON 格式的完整分析结果

## 支持的 LLM 提供商

| 提供商 | 环境变量 | 默认模型 |
|--------|----------|----------|
| OpenRouter（默认） | `OPENROUTER_API_KEY` | google/gemini-3-flash-preview |
| OpenAI | `OPENAI_API_KEY` | gpt-4o |
| Anthropic | `ANTHROPIC_API_KEY` | claude-3-sonnet |
| Ollama | `OLLAMA_BASE_URL` | llama3 |

## 许可证

MIT License
