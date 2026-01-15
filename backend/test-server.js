// backend/test-server.js
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8890;

// 健康检查
app.get('/health', (req, res) => {
  console.log('✅ 健康检查命中');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 登录测试
app.post('/test-login', (req, res) => {
  console.log('=== 测试登录接口 ===');
  console.log('请求体:', JSON.stringify(req.body, null, 2));

  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({
      success: false,
      message: '手机号和密码不能为空'
    });
  }

  console.log('处理中...');

  // 返回成功响应（模拟）
  setTimeout(() => {
    res.json({
      success: true,
      message: '登录成功（模拟）',
      data: {
        userId: 123,
        username: phone,
        phoneMasked: phone.substr(0, 3) + '****' + phone.substr(7),
        token: 'test-token-123'
      }
    });
  }, 500);
});

// 错误测试
app.post('/test-error', (req, res) => {
  console.log('=== 测试错误接口 ===');
  console.log('请求体:', JSON.stringify(req.body, null, 2));

  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({
      success: false,
      message: '手机号和密码不能为空'
    });
  }

  // 返回成功响应（模拟）
  setTimeout(() => {
    res.json({
      success: true,
      message: '登录成功（模拟）',
      data: {
        userId: 123,
        username: phone,
        phoneMasked: phone.substr(0, 3) + '****' + phone.substr(7),
        token: 'test-token-123'
      }
    });
  }, 500);
});

// 404处理
app.use((req, res) => {
  console.log('404:', req.url);
  res.status(404).json({
    success: false,
    message: 'API路由不存在: ' + req.url
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`✅ 测试服务器运行在 http://localhost:${PORT}`);
});
  console.log(`环境: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
