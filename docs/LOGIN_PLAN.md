# 登录功能实现计划

## 📋 项目概述

为「每日推算卡」项目添加完整的登录系统，支持：
1. **微信小程序**: 微信授权 + 强制手机号绑定
2. **Web端**: 账号密码登录
3. **统一用户系统**: 手机号为唯一标识
4. **异常登录通知**: 检测异常登录行为并通知用户
5. **管理后台**: 后续扩展

---

## 🎯 实现目标

| 功能 | 平台 | 优先级 |
|------|------|--------|
| 强制手机号授权 | 微信小程序 | P0 |
| 账号密码登录 | Web | P0 |
| 异常登录检测 | 全平台 | P1 |
| 登录通知 | 全平台 | P1 |
| 跨平台数据同步 | 全平台 | P1 |
| 管理后台 | Web | P2 |

---

## Phase 1: 微信小程序登录增强

### 1.1 强制手机号授权

**目标**: 确保所有微信用户都必须绑定手机号才能使用完整功能

**实现方案**:
- 修改登录流程，手机号授权为必填项
- 添加登录状态检查，未授权手机号时阻止核心功能
- 优化授权引导UI，提高授权成功率

**文件修改**:
- `miniprogram/pages/home/home.wxml` - 修改授权UI
- `miniprogram/pages/home/home.js` - 增强登录逻辑
- `miniprogram/utils/authManager.js` - 新增认证管理器

**功能要点**:
- 用户打开小程序时检查登录状态
- 未登录/未授权手机号时显示授权引导
- 授权成功后保存用户信息到本地和云端
- 每次打开应用时验证登录状态

### 1.2 异常登录通知

**目标**: 检测异常登录行为并通知用户

**实现方案**:
- 记录用户登录设备信息
- 检测新设备登录
- 通过微信模板消息发送异常通知

**新增云函数**:
- `cloudfunctions/loginNotify/` - 登录通知
- `cloudfunctions/checkLoginSecurity/` - 安全检查

**检测规则**:
- 新设备（首次使用的设备）
- 异常IP地址
- 异常登录时间
- 短时间内多次失败登录

---

## Phase 2: Web端登录系统

### 2.1 后端服务器架构

**技术栈选择**:
- Node.js + Express.js
- MySQL 数据库
- JWT 认证
- bcrypt 密码加密

**项目结构**:
```
backend/
├── src/
│   ├── app.js                    # Express应用入口
│   ├── config/                   # 配置文件
│   │   ├── database.js          # 数据库配置
│   │   ├── jwt.js               # JWT配置
│   │   └── constants.js        # 常量定义
│   ├── controllers/             # 控制器
│   │   └── authController.js    # 认证控制器
│   ├── models/                  # 数据模型
│   │   └── User.js              # 用户模型
│   ├── routes/                  # 路由
│   │   └── auth.js              # 认证路由
│   ├── middleware/              # 中间件
│   │   ├── auth.js              # 认证中间件
│   │   └── errorHandler.js      # 错误处理
│   └── utils/                   # 工具函数
│       ├── jwt.js                # JWT工具
│       ├── bcrypt.js             # 密码加密
│       └── logger.js             # 日志工具
├── public/                      # 静态文件
├── package.json
└── .env                         # 环境变量
```

### 2.2 账号密码登录

**实现功能**:
- 用户注册（账号+密码）
- 用户登录（账号+密码）
- 密码重置（邮箱验证）
- 登录状态管理（JWT）

**API接口**:
```
POST /api/auth/register    # 用户注册
POST /api/auth/login       # 用户登录
POST /api/auth/logout      # 用户登出
POST /api/auth/reset       # 密码重置
GET  /api/auth/profile     # 获取用户信息
PUT  /api/auth/profile     # 更新用户信息
GET  /api/auth/sessions    # 获取登录会话列表
DELETE /api/auth/sessions  # 清除登录会话
```

### 2.3 Web前端登录页面

**页面功能**:
- 登录表单（账号+密码）
- 注册表单
- 密码重置表单
- 登录状态显示

**文件结构**:
```
web/
├── login.html                 # 登录页面
├── register.html              # 注册页面
├── reset-password.html        # 重置密码页面
├── index.html                 # 主页面（已登录后）
├── js/
│   ├── auth.js                # 认证相关JS
│   ├── api.js                 # API调用
│   └── utils.js               # 工具函数
├── css/
│   └── auth.css              # 认证相关样式
└── assets/                   # 静态资源
```

---

## Phase 3: 统一用户系统

### 3.1 数据库设计

#### 微信用户表
```sql
CREATE TABLE wechat_users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openid VARCHAR(100) UNIQUE NOT NULL COMMENT '微信openid',
  phone VARCHAR(20) UNIQUE NOT NULL COMMENT '手机号',
  phone_masked VARCHAR(20) COMMENT '脱敏手机号',
  gender ENUM('male', 'female', 'other', 'unspecified') DEFAULT 'unspecified',
  birthday DATE COMMENT '生日',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  status TINYINT DEFAULT 0 COMMENT '状态：0=正常, 1=禁用',
  last_login_time TIMESTAMP NULL,
  device_info JSON COMMENT '设备信息',
  INDEX idx_phone (phone),
  INDEX idx_openid (openid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### Web用户表
```sql
CREATE TABLE web_users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
  email VARCHAR(100) UNIQUE NOT NULL COMMENT '邮箱',
  password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
  phone VARCHAR(20) UNIQUE NOT NULL COMMENT '手机号',
  phone_masked VARCHAR(20) COMMENT '脱敏手机号',
  gender ENUM('male', 'female', 'other', 'unspecified') DEFAULT 'unspecified',
  birthday DATE COMMENT '生日',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  status TINYINT DEFAULT 0 COMMENT '状态：0=正常, 1=禁用',
  last_login_time TIMESTAMP NULL,
  email_verified BOOLEAN DEFAULT FALSE COMMENT '邮箱是否验证',
  device_info JSON COMMENT '设备信息',
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### 登录会话表
```sql
CREATE TABLE login_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_type ENUM('wechat', 'web') NOT NULL COMMENT '用户类型',
  user_id INT NOT NULL COMMENT '用户ID',
  token_hash VARCHAR(255) NOT NULL COMMENT 'Token哈希',
  device_info JSON COMMENT '设备信息',
  ip_address VARCHAR(45) COMMENT 'IP地址',
  user_agent TEXT COMMENT '用户代理',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL COMMENT '过期时间',
  is_active BOOLEAN DEFAULT TRUE COMMENT '是否活跃',
  INDEX idx_token (token_hash),
  INDEX idx_user (user_type, user_id),
  INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### 登录日志表
```sql
CREATE TABLE login_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_type ENUM('wechat', 'web') NOT NULL COMMENT '用户类型',
  user_id INT NOT NULL COMMENT '用户ID',
  login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '登录时间',
  ip_address VARCHAR(45) COMMENT 'IP地址',
  user_agent TEXT COMMENT '用户代理',
  device_info JSON COMMENT '设备信息',
  login_result ENUM('success', 'failed') NOT NULL COMMENT '登录结果',
  failure_reason VARCHAR(255) COMMENT '失败原因',
  is_suspicious BOOLEAN DEFAULT FALSE COMMENT '是否可疑',
  INDEX idx_user (user_type, user_id),
  INDEX idx_time (login_time),
  INDEX idx_suspicious (is_suspicious)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### 异常登录通知表
```sql
CREATE TABLE security_notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_type ENUM('wechat', 'web') NOT NULL COMMENT '用户类型',
  user_id INT NOT NULL COMMENT '用户ID',
  notification_type ENUM('new_device', 'suspicious_login', 'password_change') NOT NULL COMMENT '通知类型',
  notification_data JSON COMMENT '通知数据',
  is_read BOOLEAN DEFAULT FALSE COMMENT '是否已读',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_type, user_id),
  INDEX idx_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 3.2 跨平台数据同步

**同步策略**:
- 以手机号为唯一标识
- 支持微信和Web账号绑定
- 实现数据互通和一致性

**绑定流程**:
1. 用户在任一平台注册
2. 通过手机号验证绑定另一平台账号
3. 合并用户数据
4. 统一登录状态

---

## Phase 4: 异常登录检测

### 4.1 异常检测规则

**检测维度**:
- **新设备登录**: 首次使用的设备
- **异常IP地址**: 不常用的IP段
- **异常登录时间**: 不常用的登录时间段
- **短时多次失败**: 短时间内多次登录失败

**实现方案**:
- 记录用户常用设备信息
- 检测设备指纹变化
- IP地址地理位置分析
- 登录行为模式分析

### 4.2 通知机制

**通知方式**:
- **微信小程序**: 模板消息
- **Web端**: 邮件通知
- **短信通知**: 重要异常

**通知内容**:
- 新设备登录提醒
- 异常登录警告
- 密码修改通知

---

## Phase 5: 管理后台系统

### 5.1 后台功能模块

**用户管理**:
- 用户列表查看
- 用户状态管理
- 用户数据统计
- 异常登录监控

**系统管理**:
- 登录日志查看
- 安全事件管理
- 系统配置管理
- 数据备份恢复

**技术实现**:
- Vue.js + Element UI
- RBAC权限控制
- 实时数据监控
- 操作日志记录

---

## 🛠️ 技术实现细节

### 微信小程序端
```javascript
// 新增文件
- miniprogram/utils/authManager.js        // 认证管理器
- miniprogram/components/LoginModal/      // 登录弹窗
  - LoginModal.js
  - LoginModal.wxml
  - LoginModal.wxss
  - LoginModal.json
- miniprogram/pages/login/                // 登录页面
  - login.js
  - login.wxml
  - login.wxss
  - login.json
- miniprogram/pages/profile/             // 个人中心
  - profile.js
  - profile.wxml
  - profile.wxss
  - profile.json
```

### Web后端
```javascript
// 后端服务器文件
- backend/src/app.js                      // Express应用入口
- backend/src/config/database.js          // 数据库配置
- backend/src/config/jwt.js               // JWT配置
- backend/src/controllers/authController.js // 认证控制器
- backend/src/models/User.js               // 用户模型
- backend/src/routes/auth.js              // 认证路由
- backend/src/middleware/auth.js          // 认证中间件
- backend/src/middleware/errorHandler.js  // 错误处理
- backend/src/utils/jwt.js                // JWT工具
- backend/src/utils/bcrypt.js             // 密码加密
- backend/src/utils/logger.js             // 日志工具
- backend/package.json
- backend/.env                            // 环境变量
```

### Web前端
```javascript
// Web端文件
- web/login.html                          // 登录页面
- web/register.html                       // 注册页面
- web/reset-password.html                 // 重置密码页面
- web/index.html                          // 主页面
- web/js/auth.js                          // 认证JS
- web/js/api.js                           // API调用
- web/js/utils.js                         // 工具函数
- web/css/auth.css                        // 认证样式
```

### 云函数扩展
```javascript
// 新增云函数
- cloudfunctions/loginNotify/             // 登录通知
  - index.js
  - package.json
- cloudfunctions/checkLoginSecurity/      // 安全检查
  - index.js
  - package.json
- cloudfunctions/userProfile/             // 用户资料管理
  - index.js
  - package.json
- cloudfunctions/bindAccount/             // 账号绑定
  - index.js
  - package.json
```

---

## 📋 实现优先级

### 第一优先级（P0 - MVP）
1. ✅ 微信端强制手机号授权
2. ✅ Web端基础账号密码登录
3. ✅ 后端服务器基础架构
4. ✅ 统一用户数据库设计

### 第二优先级（P1）
1. ⏳ 异常登录检测
2. ⏳ 跨平台数据同步
3. ⏳ 登录通知机制
4. ⏳ Web端完整UI

### 第三优先级（P2）
1. ⏳ 管理后台系统
2. ⏳ 高级安全功能
3. ⏳ 性能优化
4. ⏳ 监控和统计

---

## 🤔 需要确认的技术细节

### 1. 后端服务器部署
- 使用云服务器（阿里云/腾讯云）？
- 域名和SSL证书配置？
- 数据库选择（MySQL/PostgreSQL）？

### 2. 邮件服务
- 使用哪个邮件服务提供商？
- 是否需要邮件模板设计？

### 3. 安全级别
- 密码复杂度要求？
- 登录失败锁定策略？
- 是否需要双因素认证？

### 4. 数据同步策略
- 实时同步还是定时同步？
- 数据冲突处理机制？
- 是否支持离线使用？

---

## 📝 实现步骤清单

### Phase 1: 微信小程序登录增强
- [ ] 创建认证管理器 `authManager.js`
- [ ] 修改登录页面UI
- [ ] 实现强制手机号授权
- [ ] 添加登录状态检查
- [ ] 创建登录通知云函数
- [ ] 实现安全检查云函数

### Phase 2: Web端登录系统
- [ ] 搭建后端服务器框架
- [ ] 实现数据库连接
- [ ] 创建用户模型
- [ ] 实现注册API
- [ ] 实现登录API
- [ ] 创建JWT认证中间件
- [ ] 创建Web登录页面
- [ ] 创建Web注册页面

### Phase 3: 统一用户系统
- [ ] 创建MySQL数据库
- [ ] 执行数据库建表SQL
- [ ] 实现跨平台数据同步
- [ ] 实现账号绑定功能

### Phase 4: 异常登录检测
- [ ] 实现设备指纹记录
- [ ] 实现IP地址分析
- [ ] 实现异常检测算法
- [ ] 实现通知发送机制

### Phase 5: 管理后台
- [ ] 创建管理后台框架
- [ ] 实现用户管理功能
- [ ] 实现登录日志查看
- [ ] 实现系统配置管理

---

**文档版本**: v1.0
**创建日期**: 2026-01-11
**最后更新**: 2026-01-11
