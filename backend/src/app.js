// backend/src/app.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const authRoutes = require('./routes/auth');
const cardsRoutes = require('./routes/cards');
const actionsRoutes = require('./routes/actions');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 8890;

// 中间件
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static(path.join(__dirname, '../../web')));

// 日志
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/cards', cardsRoutes);
app.use('/api/actions', actionsRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API 路由不存在'
  });
});

// 错误处理
app.use(errorHandler);

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`环境: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
