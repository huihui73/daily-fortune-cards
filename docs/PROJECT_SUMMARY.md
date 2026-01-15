# 每日推算卡 - 项目总结文档

## 📋 项目概述

**项目名称**: 每日推算卡（Daily Fortune Cards）
**当前版本**: v2.0.0
**开发状态**: 开发中（MVP）
**更新时间**: 2025-01-13

## 📁 项目结构

```
daily-fortune-cards/
├── backend/          # 后端 API 服务
│   ├── src/
│   │   ├── controllers/     # 控制器层
│   │   ├── database/      # 数据库连接
│   │   ├── middleware/     # 中间件
│   │   ├── routes/        # 路由
│   │   ├── utils/         # 工具类
│   │   └── database/      # 数据库表结构
├── miniprogram/       # 微信小程序（待开发）
├── web/              # Web 前端页面
│   ├── html/          # HTML 页面
│   ├── css/           # 样式文件
│   ├── js/            # JavaScript 逻辑
│   └── assets/         # 静态资源
├── docs/            # 项目文档
└── scripts/         # 工具脚本
```

---

## 🎯 核心功能实现

### ✅ 1. 用户认证系统

#### 登录功能
- **页签式登录**（已完成 ✅）
  - 🔒 密码登录
  - 🔢 验证码登录
- 默认选中密码登录
- 支持自动注册（用户不存在时自动注册）
- 记住上次登录状态

**技术实现**:
- JWT Token 认证
- 会话管理
- 本地存储（localStorage）

#### 忘记密码功能
- **忘记密码**（已完成 ✅）
- 三步式流程：
  1. 验证手机号 → 发送验证码
  2. 设置新密码
  3. 重置成功

**技术实现**:
- 短信验证码（演示模式：1234）
- 手机号脱敏显示（138****8000）
- 密码强度实时指示器
- 自定义日期选择器（日历弹窗）

#### 修改密码功能
- **个人资料** -> **修改密码**（已完成 ✅）
- 需要输入旧密码
- 新密码强度要求（6-20位）

---

### 🎴 推算引擎（Fortune Engine）

#### 算法固定卡片
- 📋 **本日卦象** - 基于生日和日期推算
- 🌟 **生命路径数** - 基于生日数字计算
- ☯️ **五行平衡** - 木火土金水分布
- 🍀 **幸运要素** - 幸运色、数字、吉时
- 使用 64卦系统

**技术实现**:
- FNV-1a hash 算法
- 确定性算法（同一用户同一天结果相同）
- 本地计算，无需网络请求

#### 模板扩充卡片
- 👔 **穿搭建议** - 根据季节/五行/风格
- 🍎 **饮食建议** - 根据元素/季节
- ✅ **微任务** - 每日推荐3个任务
- 📝 **日记 Prompts** - 自省问题推荐

**技术实现**:
- 50+ 穿搭模板库
- 100+ 任务库
- 50+ 日记 Prompt 库

---

### 🎯 用户行为与个性化（核心功能）

#### 1. 行为记录系统
**用户行为类型**:
- `view` - 查看卡片
- `expand` - 展开卡片
- `collapse` - 折叠卡片
- `like` - 点赞卡片
- `dislike` - 不喜欢卡片
- `favorite` - 长按收藏
- `complete_task` - 完成任务
- `duration` - 查看时长

**数据库表**:
```sql
user_actions - 用户行为记录
- user_preferences - 用户偏好
- content_templates - 内容模板库
- ai_generated_content - AI 生成内容
```

#### 2. 三层推荐架构

**第一层：确定性算法层**
- 卦象、生命路径、五行、幸运要素
- 永不改变（用户每天相同）

**第二层：权重调整层**
- 基于用户行为调整卡片优先级
- 用户喜欢的卡片优先级 +20%
- 用户不喜欢的卡片优先级 -20%
- 长时间高的卡片优先级 +10%

**第三层：个性化生成层**
- 基于历史行为生成个性化内容
- 穿搭建议 + 用户历史任务生成
- 季档每日生成独特内容

#### 3. 推荐算法

```javascript
// 计算卡片类型权重
function calculateTypeWeights(userActions, userPrefs) {
  const weights = { ...userPrefs.preferences.cardTypeWeights };

  // 基于最近7天行为调整权重
  const recentActions = filterRecentActions(userActions, 7);
  recentActions.forEach(action => {
    if (action.actionType === 'like' || action.actionType === 'favorite') {
      weights[action.cardType] *= 1.2;  // 喜欢 +20%
    } else if (action.actionType === 'dislike') {
      weights[action.cardType] *= 0.8; // 不喜欢 -20%
    } else if (action.actionType === 'expand' && action.duration > 5000) {
      weights[action.cardType] *= 1.1;  // 长时间 +10%
    }
  });

  // 归一化权重
  const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
  Object.keys(weights).forEach(key => {
    weights[key] = weights[key] / total;
  });

  return weights;
}

// 选择卡片类型（根据权重）
function selectCardTypesByWeight(weights, count) {
  const sortedTypes = Object.entries(weights)
    .sort((a, b) => b[1] - a[1]);

  const selectedTypes = [];
  const typeSet = new Set(['hexagram', 'lifepath', 'elements', 'lucky']); // 排除算法固定的类型
  sortedTypes.forEach(([type, weight]) => {
    if (typeSet.has(type) || selectedTypes.length >= count) return;
    selectedTypes.push(type);
  });

  return selectedTypes;
}
```

---

## 📋 前端页面

### 1. 登录页面
- ✅ 页签式登录（密码 / 验证码）
- ✅ 首次登录处理
- ✅ Toast 提示替代 alert
- ✅ 密码强度指示
- ✅ 验证码倒计时（60秒）

### 2. 个人资料页面
- ✅ 自定义日历选择器
- ✅ 手机号显示（右侧半透明白框）
- ✅ 性别选择
- ✅ 生日格式化显示（138****8000）

### 3. 主页面
- ✅ 8 张推算卡片展示
- ✅ 卡片式布局（可展开/折叠）
- ✅ 卡片类型标识（卦象/生命路径/五行/幸运/穿搭/饮食/任务/日记）

---

## 🎯 核心优势

### 1. 准确性 + 趣味性兼顾

**准确性**：
- ✅ 64 卦象算法（周易经典卦象）
- ✅ 五行理论（金木水火土）
- ✅ 生命路径数（数字命理学）
- ✅ 季节性内容（天气适配、季节性）

**趣味性**：
- ✅ 精运色系统（9 种颜色）
- ✅ 每日推荐（3个微任务）
- ✅ 自省问题（2个 Prompts）
- ✅ 卡片展开/折叠动画

### 2. 个性化推荐（新增）

**用户行为追踪**：
- ✅ 记录用户对每类卡片的互动
- ✅ 记录查看时长
- ✅ 支持点赞/不喜欢/收藏

**权重调整**：
- ✅ 用户喜欢的卡片类型权重 +20%
- 用户不喜欢的卡片类型权重 -20%
- 查看时长 > 5秒权重 +10%

**三层推荐架构**：
- ✅ 确定性算法层（卦象、生命路径、五行）
- ✅ 权重调整层（基于用户行为）
- ✅ AI 生成层（个性化内容）

**混合内容策略**：
- ✅ �法固定内容（永不改变）
- ✅ 模板扩充（定期更新）
- ✅ AI 生成内容（基于历史行为）

### 3. 预防"内容重复"（新增）

**季节性内容**：
- 春夏季 vs 秋冬季 穿搭建议
- 按季节的饮食建议
- 节庆特殊内容

**多样化模板库**：
- 64 卦象详细解读
- 50+ 穿搭模板（简约/运动/商务/休闲）
- 50+ 饮食模板（瘦身/健身/养生）
- 100+ 微任务库

### 4. 用户留存优化（新增）

**趣味元素**:
- ✅ 长按收藏功能
- ✅ 点赞/不喜欢功能
- ✅ 微任务打卡
- ✅ 日记书写

**激励机制**:
- ✅ 用户行为权重
- ✅ 个性化推荐
- ✅ 独特的内容降权

---

## 📱 数据库设计

### 1. 用户表 (users)
```sql
CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  phone VARCHAR(20) UNIQUE NOT NULL COMMENT '手机号',
  password_hash VARCHAR(255) COMMENT '密码哈希',
  username VARCHAR(20) NOT NULL COMMENT '用户名（手机号）',
  phone_masked VARCHAR(20) COMMENT '手机号（脱敏）',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  deleted_at TIMESTAMP DEFAULT NULL COMMENT '删除时间',
  is_active BOOLEAN DEFAULT TRUE COMMENT '是否激活'
);
```

### 2. 用户行为表 (user_actions)
```sql
CREATE TABLE user_actions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  action_type ENUM('view', 'expand', 'collapse', 'like', 'dislike', 'favorite', 'complete_task') NOT NULL COMMENT '行为类型',
  card_type ENUM('hexagram', 'lifepath', 'elements', 'lucky', 'clothing', 'diet', 'task', 'journal') NOT NULL,
  card_id VARCHAR(100) NOT NULL COMMENT '卡片ID',
  duration INT DEFAULT 0 COMMENT '查看时长（毫秒）',
  session_id VARCHAR(100) NOT NULL COMMENT '会话ID',
  metadata JSON COMMENT '额外数据',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_action_type (action_type),
  INDEX idx_card_type (card_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户行为追踪';
```

### 3. 用户偏好表 (user_preferences)
```sql
CREATE TABLE user_preferences (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE,
  card_type_weights JSON NOT NULL COMMENT '卡片类型权重',
  content_style ENUM('concise', 'detailed', 'balanced') DEFAULT 'balanced' COMMENT '内容风格',
  interests JSON DEFAULT NULL COMMENT '兴趣标签',
  disliked_card_types JSON DEFAULT NULL COMMENT '不喜欢的卡片类型',
  feedback_stats JSON NOT NULL COMMENT '反馈统计',
  last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户偏好';
```

### 4. 内容模板表 (content_templates)
```sql
CREATE TABLE content_templates (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  card_type ENUM('hexagram', 'clothing', 'diet', 'task', 'journal') NOT NULL,
  template_name VARCHAR(100) NOT NULL COMMENT '模板名称',
  content TEXT NOT NULL,
  version VARCHAR(20) NOT NULL COMMENT '版本号',
  tags JSON DEFAULT NULL COMMENT '标签（季节/风格/健康目标等）',
  is_active BOOLEAN DEFAULT TRUE COMMENT '是否激活',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_card_type (card_type),
  INDEX idx_tags (tags(255)),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='内容模板';
```

### 5. AI生成内容表 (ai_generated_content)
```sql
CREATE TABLE ai_generated_content (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  card_type ENUM('clothing', 'diet', 'task', 'journal') NOT NULL,
  content TEXT NOT NULL,
  template_used VARCHAR(100) COMMENT '使用的模板',
  user_context JSON DEFAULT NULL COMMENT '用户行为上下文',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_card_type (card_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI生成内容';
```

---

## 🔄 核心代码说明

### 前端 JavaScript 交互逻辑

#### 1. 登录
- ✅ 页签切换动画
- ✅ 密码强度实时计算
- ✅ 验证码倒计时（60秒）
- ✅ 本地存储 Token

#### 2. 行为追踪
- ✅ IntersectionObserver 监听卡片可见性
- ✅ 每5秒保存一次查看时长
- ✅ 长按 500ms 触发收藏功能
- ✅ 记录所有用户行为到数据库

#### 3. 个性化卡片推荐
- ✅ 三层架构实现
- ✅ 算法固定卡片优先展示
- ✅ 根据权重选择模板卡片
- ✅ 基于 AI 生成个性化内容
- ✅ 过滤用户不喜欢的卡片
- ✅ 响应式布局排序

---

## 📊 后端 API 说明

### 认证相关
- `POST /api/auth/register` - 注册（用户名：手机号，密码）

**登录**:
- `POST /api/auth/login` - 支持密码登录和验证码登录
- 返回 Token 和用户信息

**其他**:
- `POST /api/auth/logout` - 登出
- `GET /api/auth/profile` - 获取用户资料
- `PUT /api/auth/profile` - 更新用户资料

### 卡片相关
- `POST /api/cards/today` - 获取今日推算卡（使用用户偏好）

### 行为相关
- `POST /api/actions/track` - 记录用户行为
- `GET /api/actions/stats` - 获取行为统计
- `PUT /api/actions/preferences` - 更新用户偏好
- `GET /api/actions/preferences` - 获取用户偏好
- `POST /api/actions/feedback` - 反馈卡片内容
- `GET /api/actions/personalized-cards` - 获取个性化卡片推荐

---

## 📁 测试脚本

### 测试脚本
- `backend/test-tab-login.sh` - 测试页签式登录
- `backend/test-password-features.sh` - 测试密码功能

**测试覆盖**:
1. ✅ 新用户密码登录
2. ✅ 已注册用户密码登录
3. ✅ 已注册用户验证码登录
4. ✅ 错误的密码登录
5. ✅ 错误的验证码登录

---

## 🚨 已知问题与改进方向

### 已修复问题
1. ✅ 页签式登录
2. ✅ 个性化推荐
3. ✅ 行为追踪
4. ✅ 自定义日历选择器

### 改进方向

#### 短入准确性
- ⚠ **未接入** 真实天气数据
- ⚠ **未引入** 星座/生肖
- ⚠ **未扩展** 更多卦象解读
- ⚠ **未优化** 算法算法

#### 增加趣味性
- ⚠ **未添加** 成就系统
- ⚠ **未开发** 社交分享
- ⚠ **未实现** 每日成就系统

---

## 🎯 如何使用

### 开发环境
```bash
# 启动后端服务器
cd backend
npm start

# 启动 Web 前端
cd web
# 可以使用任何静态文件服务器（如 Live Server, http-server）
```

### 访问地址
- 前端：`http://localhost:8890/`
- 后端：`http://localhost:8890/api/health`

### 数据库初始化
```bash
# 创建数据库并初始化表
cd backend/database
mysql -u root < schema.sql
```

### 用户测试
1. 访问 `http://localhost:8890/login.html`
2. 输入手机号：13800138999
3. 选择"验证码登录"页签
4. 点击"发送验证码"
5. 输入验证码：1234
6. 点击"登录"按钮
7. 验证登录成功后，自动跳转到主页面

---

**🎉 总结**

项目已实现了一个完整的用户认证系统 + 推算引擎 + 个性化推荐系统，为**:
- 准确性（周易/五行/生命路径算法）
- 趣味性（幸运要素/每日任务/日记 Prompts）
- 个性化（行为追踪 + 权重调整 + AI 生成）

**目标：通过数据驱动优化，将用户留存率提升至80%**。

---

**状态**: ✅ 基础功能已完成，可以开始测试用户体验优化了！

