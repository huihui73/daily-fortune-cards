-- 用户行为记录表
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

-- 用户偏好表
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

-- 内容模板库表
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

-- AI生成内容缓存表
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

-- 初始化默认内容模板（部分示例）
INSERT INTO content_templates (card_type, template_name, content, version, tags, is_active) VALUES
-- 卦象解读模板
('hexagram', '乾为天-简约', '刚健中正，自强不息。今日适合开始新项目，展现领导力。', 'v1.0', '{"style": "minimalist"}', TRUE),
('hexagram', '坤为地-简约', '厚德载物，包容万物。保持耐心，以柔克刚，今日适合沟通合作。', 'v1.0', '{"style": "minimalist"}', TRUE),
('hexagram', '水雷屯-简约', '万事起头难。保持冷静，按部就班处理事务，等待时机成熟再行动。', 'v1.0', '{"style": "minimalist"}', TRUE),

-- 穿搭建议模板
('clothing', '春季-简约', '春季穿搭：以轻便透气为主，选择棉麻材质，注意保暖防风。推荐颜色：绿色、青色系。', 'v1.0', '{"season": "spring", "style": "minimalist"}', TRUE),
('clothing', '夏季-清爽', '夏季穿搭：以清爽透气为主，选择棉麻、亚麻材质，注意防晒。推荐颜色：白色、浅蓝色系。', 'v1.0', '{"season": "summer", "style": "casual"}', TRUE),
('clothing', '运动风-活力', '运动风穿搭：选择舒适的运动面料，搭配运动鞋，展现活力。推荐颜色：橙色、红色系。', 'v1.0', '{"style": "sporty", "mood": "energetic"}', TRUE),

-- 饮食建议模板
('diet', '木元素-护肝', '木弱：多吃绿色蔬菜（菠菜、西兰花、空心菜）、豆类（绿豆、红豆）、绿色水果（苹果、猕猴桃）。有助于疏肝解郁。建议：少熬夜，保持心情舒畅。', 'v1.0', '{"element": "wood", "goal": "wellness"}', TRUE),
('diet', '火元素-养心', '火弱：多吃红色食物（红枣、红豆、西红柿、胡萝卜）、适量坚果。有助于养心安神。建议：避免过度熬夜，适当午休。', 'v1.0', '{"element": "fire", "goal": "wellness"}', TRUE),

-- 微任务模板
('task', '冥想放松', '花10分钟冥想或深呼吸，放松身心，缓解压力。找一个安静的地方，调整呼吸，专注于当下。', 'v1.0', '{"category": "relaxation", "mood": "calm"}', TRUE),
('task', '联系朋友', '联系一位久未联系的朋友或亲人，聊聊近况，增进感情。可以打电话、发信息或约个时间见面。', 'v1.0', '{"category": "social", "mood": "warm"}', TRUE),
('task', '整理空间', '整理一件困扰你的事情，比如整理房间、清理手机相册或处理未完成的工作。完成后你会感到轻松。', 'v1.0', '{"category": "productivity", "mood": "focused"}', TRUE);
