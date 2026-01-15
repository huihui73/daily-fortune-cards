// backend/test-minimal.js
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 9001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  console.log('✅ Health check called');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/test-login', (req, res) => {
  console.log('✅ Login test called');
  res.json({
    success: true,
    message: '登录测试成功',
    data: {
      userId: 1,
      username: '13900138000',
      phone: '138****8000'
    }
  });
});

app.get('/test-error', (req, res) => {
  res.status(500).json({
    success: false,
    message: '测试错误'
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API 路由不存在'
  });
});

app.listen(PORT, () => {
  console.log(`✅ 测试服务器运行在 http://localhost:${PORT}`);
  console.log(`环境: ${process.env.NODE_ENV || 'development'}`);
});
});

module.exports = app;
