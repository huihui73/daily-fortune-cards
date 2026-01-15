# 数据库设计 - 用户行为与个性化

## 表结构

### 1. user_actions - 用户行为记录表

```sql
CREATE TABLE user_actions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  action_type ENUM('view', 'expand', 'collapse', 'like', 'dislike', 'favorite', 'complete_task') NOT NULL,
  card_type ENUM('hexagram', 'lifepath', 'elements', 'lucky', 'clothing', 'diet', 'task', 'journal') NOT NULL,
  card_id VARCHAR(100) NOT NULL,
  duration INT DEFAULT 0 COMMENT 'View duration in milliseconds',
  session_id VARCHAR(100) NOT NULL,
  metadata JSON COMMENT 'Additional data (feedback comments, task details, etc.)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_action_type (action_type),
  INDEX idx_card_type (card_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User behavior tracking for personalization';
```

### 2. user_preferences - 用户偏好表

```sql
CREATE TABLE user_preferences (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE,
  card_type_weights JSON NOT NULL COMMENT 'Weights for each card type',
  content_style ENUM('concise', 'detailed', 'balanced') DEFAULT 'balanced',
  interests JSON DEFAULT NULL COMMENT 'User interests (health, fashion, career, etc.)',
  disliked_card_types JSON DEFAULT NULL COMMENT 'Card types user dislikes',
  feedback_stats JSON NOT NULL COMMENT 'Like/dislike counts by card type',
  last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User preferences for personalized recommendations';
```

### 3. content_templates - 内容模板库

```sql
CREATE TABLE content_templates (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  card_type ENUM('hexagram', 'clothing', 'diet', 'task', 'journal') NOT NULL,
  template_name VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  version VARCHAR(20) NOT NULL,
  tags JSON DEFAULT NULL COMMENT 'Tags for template selection (season, style, health_goal, etc.)',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_card_type (card_type),
  INDEX idx_tags (tags(255)),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Content template library';
```

### 4. ai_generated_content - AI生成内容缓存

```sql
CREATE TABLE ai_generated_content (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  card_type ENUM('clothing', 'diet', 'task', 'journal') NOT NULL,
  content TEXT NOT NULL,
  template_used VARCHAR(100),
  user_context JSON COMMENT 'User behavior context used for generation',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_card_type (card_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI-generated content cache';
```

## 数据模型

### UserAction（用户行为）
```typescript
interface UserAction {
  id: number;
  userId: number;
  actionType: 'view' | 'expand' | 'collapse' | 'like' | 'dislike' | 'favorite' | 'complete_task';
  cardType: 'hexagram' | 'lifepath' | 'elements' | 'lucky' | 'clothing' | 'diet' | 'task' | 'journal';
  cardId: string;
  duration: number;  // 查看时长（毫秒）
  sessionId: string;
  metadata?: {
    feedbackComment?: string;
    taskDetails?: any;
    rating?: number;
  };
  createdAt: Date;
}
```

### UserPreferences（用户偏好）
```typescript
interface UserPreferences {
  id: number;
  userId: number;
  preferences: {
    cardTypeWeights: {
      hexagram: number;
      lifepath: number;
      elements: number;
      lucky: number;
      clothing: number;
      diet: number;
      task: number;
      journal: number;
    };
    contentStyle: 'concise' | 'detailed' | 'balanced';
    interests?: string[];
    dislikedCardTypes?: string[];
  };
  feedbackStats: {
    likeCount: number;
    dislikeCount: number;
    lastFeedbackType?: string;
  };
  lastUpdatedAt: Date;
  createdAt: Date;
}
```

### ContentTemplate（内容模板）
```typescript
interface ContentTemplate {
  id: number;
  cardType: 'hexagram' | 'clothing' | 'diet' | 'task' | 'journal';
  templateName: string;
  content: string;
  version: string;
  tags?: {
    season?: 'spring' | 'summer' | 'autumn' | 'winter';
    style?: 'minimalist' | 'sporty' | 'business' | 'casual';
    healthGoal?: 'weight_loss' | 'fitness' | 'wellness' | 'beauty';
    mood?: 'calm' | 'energetic' | 'romantic' | 'productive';
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## 推荐算法流程

```typescript
// 推荐算法伪代码
function getPersonalizedCards(userId, birthday, gender, date) {
  // 1. 获取用户行为数据
  const userActions = getUserActions(userId, last30Days);
  const userPrefs = getUserPreferences(userId);

  // 2. 计算卡片类型权重
  const weights = calculateTypeWeights(userActions, userPrefs);

  // 3. 根据权重选择卡片内容
  const cards = [];

  // 算法固定卡片（高优先级）
  cards.push(getAlgorithmicCard('hexagram', birthday, date));
  cards.push(getAlgorithmicCard('lifepath', birthday));
  cards.push(getAlgorithmicCard('elements', birthday));
  cards.push(getAlgorithmicCard('lucky', birthday));

  // 模板扩充卡片（根据权重选择类型）
  const weightedCardTypes = selectCardTypesByWeight(weights, 4); // 选择4个
  weightedCardTypes.forEach(type => {
    cards.push(getTemplateCard(type, getSeason(), userPrefs.interests));
  });

  // AI生成卡片（基于历史行为）
  const aiCardTypes = ['clothing', 'diet', 'task']; // 每天选择3个类型
  aiCardTypes.forEach(type => {
    const context = getUserBehaviorContext(userId, type, userActions);
    cards.push(getAIGeneratedCard(type, context));
  });

  // 4. 按优先级排序
  return cards.sort((a, b) => weights[a.type] - weights[b.type]);
}

function calculateTypeWeights(actions, prefs) {
  const weights = { ...prefs.preferences.cardTypeWeights };

  // 基于最近7天行为调整权重
  const recentActions = filterRecentActions(actions, 7);
  recentActions.forEach(action => {
    if (action.actionType === 'like' || action.actionType === 'favorite') {
      weights[action.cardType] *= 1.2;  // 喜欢的权重+20%
    } else if (action.actionType === 'dislike') {
      weights[action.cardType] *= 0.8;  // 不喜欢的权重-20%
    }

    if (action.actionType === 'complete_task' && action.duration > 5000) {
      weights['task'] *= 1.1;  // 长时间完成任务，增加任务权重
    }
  });

  // 归一化权重
  const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
  Object.keys(weights).forEach(key => {
    weights[key] = weights[key] / total;
  });

  return weights;
}
```

## 内容更新策略

### 模板库扩充计划

**初期（1-2周）**:
- 卦象解读：每个卦象2-3个不同版本
- 穿搭模板：每个季节10个模板（简约2 + 运动3 + 商务2 + 休闲3）
- 饮食模板：每个健康目标8个模板
- 微任务：100个任务

**中期（1个月）**:
- 根据用户行为数据反馈调整模板
- 添加用户贡献的优质任务（经人工审核）

**长期（持续）**:
- 季节性内容自动更新
- 热门内容自动扩充
- A/B测试不同模板效果

### AI生成触发条件

- 用户连续3天未访问 → 生成"欢迎回来"个性化内容
- 用户完成5个同类任务 → 生成"你很擅长xx"相关建议
- 用户频繁查看某类卡片 → 生成该类深度内容
- 用户反馈"内容太简单" → 下次生成更详细版本
