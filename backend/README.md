# 后端服务器快速启动指南

## 📋 前置要求

1. **Node.js** (v14+)
2. **MySQL** (v5.7+ 或 v8.0+)
3. **npm** 或 **yarn**

---

## 🚀 快速启动步骤

### 1. 安装依赖

```bash
cd /Users/gonghuihui/daily-fortune-cards/backend
npm install
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件
nano .env
# 或使用其他编辑器
```

在 `.env` 文件中配置以下内容：

```env
# 服务器配置
NODE_ENV=development
PORT=3000

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=daily_fortune
DB_USER=root
DB_PASSWORD=your_password

# JWT 配置
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRES_IN=7d

# 邮件服务配置（可选）
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=daily-fortune@example.com

# 前端 URL（用于 CORS）
FRONTEND_URL=http://localhost:8080
```

### 3. 创建数据库

```bash
# 登录 MySQL
mysql -u root -p

# 执行初始化脚本
source /Users/gonghuihui/daily-fortune-cards/backend/database/init.sql

# 退出 MySQL
exit
```

或使用命令行：

```bash
mysql -u root -p < /Users/gonghuihui/daily-fortune-cards/backend/database/init.sql
```

### 4. 启动服务器

#### 开发模式（推荐）
```bash
npm run dev
```

#### 生产模式
```bash
npm start
```

### 5. 验证服务器运行

在浏览器中访问：
- 健康检查: `http://localhost:3000/health`

预期返回：
```json
{
  "status": "ok",
  "timestamp": "2026-01-11T00:00:00.000Z"
}
```

---

## 🧪 测试 API 接口

### 1. 用户注册

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "phone": "13800138000",
    "password": "test123456"
  }'
```

### 2. 用户登录

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "testuser",
    "password": "test123456"
  }'
```

### 3. 获取用户信息（需要 Token）

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📁 目录结构说明

```
backend/
├── src/
│   ├── app.js              # Express 应用入口
│   ├── config/             # 配置文件
│   │   ├── database.js    # MySQL 数据库配置
│   │   ├── jwt.js         # JWT Token 配置
│   │   └── constants.js    # 常量定义
│   ├── controllers/        # 控制器
│   │   └── authController.js  # 认证控制器
│   ├── models/             # 数据模型
│   │   └── User.js        # 用户模型
│   ├── routes/             # 路由
│   │   └── auth.js         # 认证路由
│   └── middleware/         # 中间件
│       ├── auth.js         # JWT 认证中间件
│       └── errorHandler.js # 错误处理中间件
├── database/
│   └── init.sql           # 数据库初始化脚本
├── public/                # 静态文件
├── package.json           # 依赖配置
└── .env                   # 环境变量（需要手动创建）
```

---

## 🔧 故障排除

### 问题 1: 连接数据库失败

**错误信息**:
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**解决方案**:
1. 检查 MySQL 是否运行
   ```bash
   # macOS
   brew services start mysql
   
   # 或
   sudo /usr/local/mysql/support-files/mysql.server start
   ```

2. 检查数据库配置是否正确（.env 文件中的 DB_HOST、DB_PORT、DB_USER、DB_PASSWORD）

3. 确认数据库已创建
   ```bash
   mysql -u root -p -e "SHOW DATABASES LIKE 'daily_fortune';"
   ```

### 问题 2: 端口已被占用

**错误信息**:
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方案**:
1. 查看端口占用
   ```bash
   lsof -i :3000
   ```

2. 杀死占用端口的进程
   ```bash
   kill -9 PID
   ```

3. 或修改 .env 文件中的 PORT

### 问题 3: 依赖安装失败

**错误信息**:
```
Error: Cannot find module 'xxx'
```

**解决方案**:
```bash
# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

### 问题 4: JWT_SECRET 未配置

**错误信息**:
```
Error: JWT_SECRET is not defined
```

**解决方案**:
1. 确保 .env 文件存在
2. 确保 JWT_SECRET 已配置
3. 重启服务器

---

## 🛡️ 安全建议

1. **生产环境必须更换 JWT_SECRET**
   ```env
   JWT_SECRET=$(openssl rand -base64 32)
   ```

2. **使用强密码**
   - 至少 12 个字符
   - 包含大小写字母、数字和特殊字符

3. **启用 HTTPS**（生产环境）
   - 使用 Nginx 作为反向代理
   - 配置 SSL 证书

4. **配置防火墙**
   - 只开放必要的端口（80、443）
   - 限制数据库访问

5. **定期更新依赖**
   ```bash
   npm audit
   npm audit fix
   ```

---

## 📊 数据库管理

### 查看数据库

```bash
mysql -u root -p daily_fortune
```

### 查看用户表

```sql
SELECT id, username, email, phone_masked, status, created_at 
FROM web_users;
```

### 查看登录日志

```sql
SELECT * FROM login_logs 
ORDER BY login_time DESC 
LIMIT 10;
```

### 清空测试数据

```sql
TRUNCATE TABLE web_users;
TRUNCATE TABLE login_logs;
TRUNCATE TABLE login_sessions;
```

---

## 🔄 开发工作流

### 1. 修改代码后自动重启

```bash
npm run dev
```

### 2. 查看日志

```bash
# 实时查看日志
npm run dev | tee logs/app.log

# 或使用 PM2
pm2 logs
```

### 3. 调试模式

在 `src/app.js` 中设置：
```javascript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
```

---

## 🚢 生产环境部署

### 使用 PM2 部署

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start src/app.js --name daily-fortune-api

# 查看状态
pm2 status

# 查看日志
pm2 logs daily-fortune-api

# 重启
pm2 restart daily-fortune-api

# 停止
pm2 stop daily-fortune-api

# 开机自启
pm2 startup
pm2 save
```

### 使用 Docker 部署（可选）

```bash
# 构建 Docker 镜像
docker build -t daily-fortune-api .

# 运行容器
docker run -d -p 3000:3000 \
  --env-file .env \
  --name daily-fortune-api \
  daily-fortune-api
```

---

## 📝 常用命令

```bash
# 安装依赖
npm install

# 开发模式启动
npm run dev

# 生产模式启动
npm start

# 运行测试
npm test

# 检查依赖安全
npm audit

# 更新依赖
npm update
```

---

**最后更新**: 2026-01-11
