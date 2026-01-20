// 首先加载环境变量（必须在其他模块导入之前）
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 尝试从项目根目录加载 .env
const envPath = resolve(__dirname, '../../.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.log(`⚠️ 无法从 ${envPath} 加载 .env 文件`);
  // 尝试从 server 目录加载
  const serverEnvResult = dotenv.config({ path: resolve(__dirname, '../.env') });
  if (serverEnvResult.error) {
    console.log(`⚠️ 也无法从 server/.env 加载`);
  }
} else {
  console.log(`✅ 已从 ${envPath} 加载环境变量`);
}

// 验证关键环境变量
console.log(`🔑 OPENROUTER_API_KEY: ${process.env.OPENROUTER_API_KEY ? '已设置 (' + process.env.OPENROUTER_API_KEY.substring(0, 10) + '...)' : '❌ 未设置'}`);

// 使用动态导入，确保环境变量已加载
async function startServer() {
  const express = (await import('express')).default;
  const cors = (await import('cors')).default;
  const { createServer } = await import('http');
  const { Server } = await import('socket.io');
  const { requisitionRoutes } = await import('./routes/requisitions.js');
  const { configRoutes } = await import('./routes/config.js');
  const { setupWebSocket } = await import('./websocket/index.js');

  const app = express();
  const httpServer = createServer(app);

  // Socket.io 配置
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5271',
      methods: ['GET', 'POST']
    }
  });

  // 中间件
  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5271'
  }));
  app.use(express.json());

  // 将 io 实例挂载到 app
  app.set('io', io);

  // API 路由
  app.use('/api/requisitions', requisitionRoutes);
  app.use('/api/config', configRoutes);

  // 健康检查
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: '服务运行正常' });
  });

  // WebSocket 设置
  setupWebSocket(io);

  const PORT = process.env.PORT || 3275;

  httpServer.listen(PORT, () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
    console.log(`📡 WebSocket 服务已启动`);
    console.log(`🤖 LLM 提供商: ${process.env.LLM_PROVIDER || 'openrouter'}`);
    console.log(`🎯 默认模型: ${process.env.LLM_MODEL || 'google/gemini-3-flash-preview'}`);
  });
}

startServer().catch(console.error);
