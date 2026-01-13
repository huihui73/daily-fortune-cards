# 数据库设计文档

## 概述

本文档描述了「每日推算卡」小程序的云数据库设计。

## 设计原则

1. **最小化存储**：仅存储必要的用户数据
2. **隐私优先**：敏感数据脱敏存储
3. **可扩展性**：预留扩展字段
4. **数据分离**：用户数据与推算数据分离

---

## 数据库集合结构

### 1. users - 用户表

用户基本信息集合，存储用户身份和配置信息。

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _id | string | 是 | 云数据库自动生成的唯一ID |
| _openid | string | 是 | 微信 openid |
| phone_masked | string | 否 | 脱敏手机号，如 138****5678 |
| gender | string | 否 | 性别：male/female/other/unspecified |
| birthday | string | 否 | 生日，格式 YYYY-MM-DD |
| created_at | Date | 是 | 注册时间 |
| updated_at | Date | 是 | 最后更新时间 |
| status | number | 是 | 状态：0=正常，1=禁用 |
| preferences | Object | 否 | 用户偏好设置 |

**preferences 结构**:
```javascript
{
  enableNotifications: boolean,  // 是否开启通知
  defaultLanguage: string,        // 默认语言
  theme: string                    // 主题
}
```

**索引**:
```javascript
{
  _openid: 1,      // 唯一索引
  created_at: -1   // 普通索引
}
```

---

### 2. fortunes - 推算记录表

存储用户的每日推算历史记录。

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _id | string | 是 | 云数据库自动生成的唯一ID |
| _openid | string | 是 | 关联 users 表 |
| date | string | 是 | 推算日期，格式 YYYY-MM-DD |
| fortune_data | Object | 是 | 推算结果数据 |
| is_favorite | boolean | 否 | 是否收藏 |
| created_at | Date | 是 | 创建时间 |
| updated_at | Date | 是 | 更新时间 |

**fortune_data 结构**:
```javascript
{
  hexagramId: number,
  hexagramName: string,
  hexagramInterpretation: string,
  lines: number[],
  lifePathNumber: number,
  lifePathDesc: string,
  elements: {
    wood: number,
    fire: number,
    earth: number,
    metal: number,
    water: number
  },
  luckyColor: string,
  luckyNumber: number,
  cards: Card[]  // 生成的卡片列表
}
```

**索引**:
```javascript
{
  _openid: 1,
  date: -1       // 复合索引
}
```

---

### 3. daily_tasks - 每日任务表

存储用户的每日任务完成记录。

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _id | string | 是 | 云数据库自动生成的唯一ID |
| _openid | string | 是 | 关联 users 表 |
| date | string | 是 | 任务日期，格式 YYYY-MM-DD |
| tasks | Array | 是 | 任务列表 |
| completed_count | number | 是 | 已完成任务数 |
| created_at | Date | 是 | 创建时间 |
| updated_at | Date | 是 | 更新时间 |

**tasks 结构**:
```javascript
[
  {
    id: string,
    content: string,
    completed: boolean,
    completed_at?: Date
  }
]
```

**索引**:
```javascript
{
  _openid: 1,
  date: -1       // 复合索引
}
```

---

### 4. diaries - 日记表

存储用户的日记记录。

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _id | string | 是 | 云数据库自动生成的唯一ID |
| _openid | string | 是 | 关联 users 表 |
| date | string | 是 | 日记日期，格式 YYYY-MM-DD |
| content | string | 是 | 日记内容 |
| mood | string | 否 | 心情标签 |
| tags | Array | 否 | 标签列表 |
| created_at | Date | 是 | 创建时间 |
| updated_at | Date | 是 | 更新时间 |

**索引**:
```javascript
{
  _openid: 1,
  date: -1       // 复合索引
}
```

---

### 5. hexagrams - 卦象库表

存储64卦的详细信息（静态数据）。

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _id | number | 是 | 卦象ID (0-63) |
| name | string | 是 | 卦名 |
| symbol | string | 是 | 卦象符号 |
| meaning | string | 是 | 基本含义 |
| lines | string | 是 | 六爻，如 "111000" |
| interpretation | string | 是 | 详细解读 |
| advice | string | 是 | 行动建议 |

**示例数据**:
```javascript
{
  _id: 0,
  name: "乾为天",
  symbol: "䷀",
  meaning: "元亨利贞",
  lines: "111111",
  interpretation: "天行健，君子以自强不息...",
  advice: "保持进取心，勇敢向前。"
}
```

---

### 6. clothing_templates - 穿衣模板表

存储穿衣搭配模板（静态数据，可扩展）。

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _id | string | 是 | 模板ID |
| name | string | 是 | 模板名称 |
| season | string | 是 | 适用季节：spring/summer/autumn/winter |
| temperature_range | Array | 是 | 温度范围 [min, max] |
| items | Array | 是 | 搭配单品 |
| elements | Array | 是 | 适用五行 |
| tags | Array | 否 | 标签 |

**items 结构**:
```javascript
[
  {
    type: string,    // outer/inner/bottom/shoes/accessory
    name: string,
    description: string
  }
]
```

---

### 7. diet_templates - 饮食模板表

存储饮食搭配模板（静态数据，可扩展）。

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| _id | string | 是 | 模板ID |
| name | string | 是 | 模板名称 |
| type | string | 是 | 类型：breakfast/lunch/dinner/snack |
| elements | Array | 是 | 适用五行 |
| ingredients | Array | 是 | 主要食材 |
| nutrition | Object | 是 | 营养信息 |

**nutrition 结构**:
```javascript
{
  calories: number,
  protein: string,
  carbs: string,
  fat: string,
  fiber: string
}
```

---

## 数据关系图

```
users (1) ──────< (n) fortunes
users (1) ──────< (n) daily_tasks
users (1) ──────< (n) diaries

fortunes (n) ───> (1) hexagrams (lookup)
fortunes (n) ───> (m) clothing_templates (references)
fortunes (n) ───> (m) diet_templates (references)
```

---

## 数据库操作示例

### 创建用户

```javascript
const db = wx.cloud.database();
const collection = db.collection('users');

collection.add({
  data: {
    _openid: '{openid}',
    gender: 'male',
    birthday: '1990-01-01',
    phone_masked: '138****5678',
    created_at: new Date(),
    updated_at: new Date(),
    status: 0,
    preferences: {
      enableNotifications: true,
      defaultLanguage: 'zh-CN',
      theme: 'light'
    }
  }
}).then(res => {
  console.log('用户创建成功', res);
});
```

### 保存推算记录

```javascript
const db = wx.cloud.database();
const collection = db.collection('fortunes');

collection.add({
  data: {
    _openid: '{openid}',
    date: '2025-01-10',
    fortune_data: { /* FortuneResult */ },
    is_favorite: false,
    created_at: new Date(),
    updated_at: new Date()
  }
});
```

### 查询用户推算历史

```javascript
const db = wx.cloud.database();
const _ = db.command;
const $ = db.command.aggregate;

db.collection('fortunes')
  .where({
    _openid: '{openid}',
    date: _.gte('2025-01-01').and(_.lte('2025-01-31'))
  })
  .orderBy('date', 'desc')
  .limit(10)
  .get()
  .then(res => {
    console.log('查询结果', res.data);
  });
```

### 更新用户信息

```javascript
db.collection('users')
  .where({ _openid: '{openid}' })
  .update({
    data: {
      gender: 'female',
      updated_at: new Date()
    }
  });
```

---

## 数据安全策略

### 1. 权限控制

使用云开发数据库权限规则：

```json
{
  "read": "auth._openid == doc._openid",
  "write": "auth._openid == doc._openid"
}
```

### 2. 数据脱敏

- 手机号存储为脱敏格式：`138****5678`
- 日记内容不存储敏感信息
- 不收集身份证、地址等个人信息

### 3. 数据删除

用户可请求删除所有数据：

```javascript
// 删除用户所有数据
const db = wx.cloud.database();
const openid = wx.getStorageSync('openid');

Promise.all([
  db.collection('users').where({ _openid: openid }).remove(),
  db.collection('fortunes').where({ _openid: openid }).remove(),
  db.collection('daily_tasks').where({ _openid: openid }).remove(),
  db.collection('diaries').where({ _openid: openid }).remove()
]).then(() => {
  wx.showToast({ title: '数据已删除' });
  wx.clearStorageSync();
});
```

---

## 数据迁移与备份

### 定期备份

使用云开发定时任务定期备份数据：

```javascript
// 云函数 backupDatabase
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event, context) => {
  const db = cloud.database();

  // 导出各集合数据
  const collections = ['users', 'fortunes', 'daily_tasks', 'diaries'];
  const backup = {};

  for (const name of collections) {
    const res = await db.collection(name).get();
    backup[name] = res.data;
  }

  // 保存到云存储
  const result = await cloud.uploadFile({
    cloudPath: `backup/${Date.now()}.json`,
    fileContent: JSON.stringify(backup)
  });

  return { fileID: result.fileID };
};
```

---

**更新日期**: 2025-01-10
