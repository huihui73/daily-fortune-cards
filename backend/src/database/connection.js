const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const dbPath = path.join(__dirname, '../../data', 'fortune-cards.db');

const db = new Database(dbPath, {
  verbose: console.log
});

db.pragma('journal_mode = WAL');

const tables = db.prepare(`
  SELECT name FROM sqlite_master WHERE type='table'
`).all();

if (tables.length === 0) {
  console.log('初始化数据库表...');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone VARCHAR(20) UNIQUE NOT NULL,
      password VARCHAR(255),
      nickname VARCHAR(50),
      birthday DATE,
      gender VARCHAR(10),
      avatar_url TEXT,
      first_login BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_actions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      action_type VARCHAR(20) NOT NULL,
      card_type VARCHAR(20),
      card_id VARCHAR(50),
      session_id VARCHAR(50),
      duration INTEGER,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      preferences TEXT,
      weights TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS content_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category VARCHAR(50),
      type VARCHAR(20),
      title TEXT,
      content TEXT,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ai_generated_content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      card_type VARCHAR(20),
      title TEXT,
      content TEXT,
      generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  console.log('数据库表初始化完成');
} else {
  console.log('数据库已连接，现有表:', tables.map(t => t.name));
}

const insertTemplates = db.prepare(`
  INSERT OR IGNORE INTO content_templates (category, type, title, content, metadata)
  VALUES (?, ?, ?, ?, ?)
`);

const templates = [
  {
    category: 'task',
    type: 'health',
    title: '晨间拉伸',
    content: '进行5-10分钟的基础拉伸运动，包括颈部、肩部、腰部和腿部的简单伸展。',
    metadata: JSON.stringify({ difficulty: 'easy', duration: 10, points: 5 })
  },
  {
    category: 'task',
    type: 'learning',
    title: '阅读30分钟',
    content: '阅读专业书籍或文章，保持学习状态。',
    metadata: JSON.stringify({ difficulty: 'medium', duration: 30, points: 10 })
  },
  {
    category: 'task',
    type: 'social',
    title: '联系一位朋友',
    content: '给一位老朋友打个电话或发条消息，维护人际关系。',
    metadata: JSON.stringify({ difficulty: 'easy', duration: 15, points: 5 })
  },
  {
    category: 'task',
    type: 'productivity',
    title: '整理工作空间',
    content: '花15分钟整理桌面和电脑文件，清理不必要的杂物。',
    metadata: JSON.stringify({ difficulty: 'easy', duration: 15, points: 5 })
  },
  {
    category: 'task',
    type: 'creativity',
    title: '写日记',
    content: '记录今天的想法、感受或计划，培养写作习惯。',
    metadata: JSON.stringify({ difficulty: 'medium', duration: 20, points: 8 })
  }
];

templates.forEach(template => {
  insertTemplates.run(template.category, template.type, template.title, template.content, JSON.stringify(template.metadata));
});

console.log('初始化内容模板完成');

const checkAdminUser = db.prepare('SELECT * FROM users WHERE phone = ?');
const existingUser = checkAdminUser.get('13800138999');

if (!existingUser) {
  const bcrypt = require('bcryptjs');
  const hashedPassword = bcrypt.hashSync('testpass123', 10);

  const insertUser = db.prepare(`
    INSERT INTO users (phone, password, nickname, birthday, gender, first_login)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertUser.run('13800138999', hashedPassword, '测试用户', '1990-01-01', 'male', 0);
  console.log('测试用户已创建');
}

db.prepare('CREATE INDEX IF NOT EXISTS idx_user_actions_user_id ON user_actions(user_id)').run();
db.prepare('CREATE INDEX IF NOT EXISTS idx_user_actions_session_id ON user_actions(session_id)').run();
db.prepare('CREATE INDEX IF NOT EXISTS idx_user_actions_created_at ON user_actions(created_at)').run();

console.log('✅ SQLite 数据库连接成功');
console.log('数据库路径:', dbPath);

module.exports = db;
