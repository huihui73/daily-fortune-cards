// backend/test-http-server.js
const http = require('http');

const PORT = 9001;
const HOST = 'localhost';

const server = http.createServer((req, res) => {
  // 健康检查
  if (req.url === '/health' && req.method === 'GET') {
    console.log('✅ Health check received');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    return;
  }

  // 登录测试
  if (req.url === '/test-login' && req.method === 'POST') {
    console.log('✅ Login test received');
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('Login request:', data);

        if (!data.phone || !data.password) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: '手机号和密码不能为空' }));
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: '登录成功',
          data: {
            userId: 1,
            phoneMasked: '138****8000',
            token: 'test-token-abc123'
          }
        }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: '登录失败' }));
      }
    });
    return;
  }

  // API 路由测试
  if (req.url.startsWith('/api/')) {
    // 模拟 API 响应
    console.log('✅ API request received:', req.method, req.url);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: '模拟 API 响应'
    }));
    return;
  }

  // 404 处理
  console.log('404:', req.url);
  res.writeHead(404, { 'Content-Type': application/json' });
  res.end(JSON.stringify({ success: false, message: '路由不存在: ' + req.url }));

  console.log(`HTTP server running on http://${HOST}:${PORT}`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
});

console.log('服务器启动完成，请测试以下 URL:');
console.log(`  Health: http://${HOST}:${PORT}/health`);
console.log(` Login test: curl -X POST http://${HOST}:${PORT}/test-login -H "Content-Type: application/json" -d '{"phone": "13800138000", "password": "testpass123"}'`);
console.log(` API test: curl http://${HOST}:${PORT}/api/test-login -X POST -H "Content-Type: application/json" -d '{"phone": "13800138000", "password": "testpass123"}'`);
console.log(` API health: curl http://${HOST}:${PORT}/api/health`);
