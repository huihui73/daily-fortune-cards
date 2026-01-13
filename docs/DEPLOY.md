# 部署指南

本文档提供「每日推算卡」小程序的完整部署步骤。

---

## 目录

1. [前置要求](#前置要求)
2. [小程序端部署](#小程序端部署)
3. [云开发环境配置](#云开发环境配置)
4. [云函数部署](#云函数部署)
5. [数据库初始化](#数据库初始化)
6. [测试验证](#测试验证)
7. [常见问题](#常见问题)

---

## 前置要求

### 必需工具

- **微信开发者工具** (最新版)
  - 下载地址：https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html

- **微信小程序账号**
  - 注册地址：https://mp.weixin.qq.com/
  - 需要已认证的小程序账号

- **Node.js** (v14+)
  - 下载地址：https://nodejs.org/

### 账号信息准备

准备以下信息：
- `AppID`: 小程序 AppID
- `AppSecret`: 小程序 AppSecret（在微信公众平台获取）

---

## 小程序端部署

### 1. 导入项目

1. 打开微信开发者工具
2. 点击「+」导入项目
3. 选择项目目录：`daily-fortune-cards/miniprogram`
4. 填写 AppID（选择测试号或填入你的 AppID）
5. 项目名称：`每日推算卡`
6. 点击「导入」

### 2. 配置项目

编辑 `project.config.json` 文件，填入你的 AppID：

```json
{
  "appid": "你的AppID",
  "projectname": "daily-fortune-cards",
  ...
}
```

### 3. 配置云环境 ID

编辑 `miniprogram/app.js`，填入你的云环境 ID：

```javascript
App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请在微信开发者工具中开启云开发并使用云能力')
      return
    }
    wx.cloud.init({ env: "你的云环境ID" })
  }
})
```

### 4. 修改云函数中的 AppID

在 `pages/home/home.js` 中修改：

```javascript
const appId = "你的AppID";
```

---

## 云开发环境配置

### 1. 开通云开发

1. 在微信开发者工具中，点击左侧菜单「云开发」
2. 点击「开通」
3. 选择环境类型（按需选择免费版或付费版）
4. 填写环境名称，如：`daily-fortune-dev`
5. 点击「确定」

### 2. 获取云环境 ID

开通后，在云开发控制台可以看到环境 ID，格式如：
```
daily-fortune-dev-xxxxx
```

### 3. 创建数据库集合

1. 在云开发控制台 → 数据库
2. 创建以下集合：
   - `users` (用户表)
   - `fortunes` (推算记录表)
   - `daily_tasks` (每日任务表)
   - `diaries` (日记表)
   - `hexagrams` (卦象库表)
   - `clothing_templates` (穿衣模板表)
   - `diet_templates` (饮食模板表)

### 4. 配置数据库权限

为每个集合设置权限：
- 读权限：`自定义`
- 写权限：`自定义`
- 规则设置：
```json
{
  "read": "auth._openid == doc._openid",
  "write": "auth._openid == doc._openid"
}
```

---

## 云函数部署

### 1. 配置环境变量

在云开发控制台 → 云函数 → 设置 → 环境变量中添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| APPID | 你的AppID | 小程序 AppID |
| APPSECRET | 你的AppSecret | 小程序 AppSecret |

### 2. 安装云函数依赖

在项目根目录执行：

```bash
cd cloudfunctions/login
npm install

cd ../decryptPhone
npm install

cd ../getUserData
npm install
```

### 3. 上传并部署云函数

#### 部署 login 云函数

1. 在微信开发者工具中，右键点击 `cloudfunctions/login` 目录
2. 选择「上传并部署：云端安装依赖」
3. 等待部署完成

#### 部署 decryptPhone 云函数

1. 右键点击 `cloudfunctions/decryptPhone` 目录
2. 选择「上传并部署：云端安装依赖」
3. 等待部署完成

#### 部署 getUserData 云函数（可选）

1. 右键点击 `cloudfunctions/getUserData` 目录
2. 选择「上传并部署：云端安装依赖」
3. 等待部署完成

### 4. 测试云函数

在云开发控制台 → 云函数中，可以在线测试：

**测试 login 云函数**：
```json
{
  "code": "你的wx.login返回的code"
}
```

**测试 decryptPhone 云函数**：
```json
{
  "sessionKey": "从login返回的session_key",
  "encryptedData": "手机号加密数据",
  "iv": "iv值",
  "appId": "你的AppID"
}
```

---

## 数据库初始化

### 1. 初始化卦象库数据

在云开发控制台 → 数据库 → `hexagrams` 集合中，导入64卦数据：

```javascript
// 示例数据
{
  "_id": 0,
  "name": "乾为天",
  "symbol": "䷀",
  "meaning": "元亨利贞",
  "lines": "111111",
  "interpretation": "天行健，君子以自强不息。象征刚健、进取、领导力强。",
  "advice": "保持进取心，勇敢向前，适合开始新项目。"
}
```

完整数据参考 `docs/hexagrams.json`（需要手动创建此文件）

### 2. 初始化穿衣模板数据

在 `clothing_templates` 集合中导入模板数据：

```javascript
{
  "_id": "template_001",
  "name": "冬季保暖",
  "season": "winter",
  "temperature_range": [-10, 5],
  "items": [
    {"type": "outer", "name": "加厚羽绒外套", "description": "保暖防风"},
    {"type": "inner", "name": "羊毛内衣", "description": "贴身保暖"},
    {"type": "bottom", "name": "保暖裤", "description": "厚实防寒"}
  ],
  "elements": ["water"],
  "tags": ["保暖", "冬季"]
}
```

### 3. 初始化饮食模板数据

在 `diet_templates` 集合中导入模板数据：

```javascript
{
  "_id": "diet_001",
  "name": "五行平衡早餐",
  "type": "breakfast",
  "elements": ["wood", "fire"],
  "ingredients": ["燕麦", "鸡蛋", "蓝莓", "蜂蜜"],
  "nutrition": {
    "calories": 350,
    "protein": "15g",
    "carbs": "40g",
    "fat": "10g",
    "fiber": "8g"
  }
}
```

---

## 测试验证

### 1. 功能测试清单

- [ ] 登录流程正常
- [ ] 手机号授权成功
- [ ] 生日输入正常
- [ ] 推算结果生成正确
- [ ] 卡片展示正常
- [ ] 卡片可折叠/展开
- [ ] 本地缓存正常
- [ ] 每日刷新功能正常

### 2. 测试步骤

#### 测试登录流程

1. 打开小程序
2. 点击「使用微信手机号登录」
3. 确认授权
4. 检查是否显示脱敏手机号

#### 测试推算功能

1. 填写生日
2. 选择性别（可选）
3. 点击「生成今日卡片」
4. 检查8张卡片是否正常显示
5. 检查卡片内容是否合理

#### 测试缓存功能

1. 生成一次卡片后关闭小程序
2. 重新打开小程序
3. 检查上次输入和结果是否保留

### 3. 调试工具

- 使用微信开发者工具的「调试器」查看日志
- 使用「云开发控制台」查看数据库和云函数日志
- 使用「模拟器」测试不同机型

---

## 常见问题

### Q1: 云函数上传失败

**原因**：
- 网络问题
- Node.js 版本不匹配
- 依赖安装失败

**解决方法**：
```bash
# 重新安装依赖
cd cloudfunctions/login
rm -rf node_modules package-lock.json
npm install

# 然后重新上传
```

### Q2: 手机号解密失败

**原因**：
- session_key 过期
- encryptedData 或 iv 错误
- AppID 不匹配

**解决方法**：
1. 重新调用 wx.login 获取新的 session_key
2. 确保 encryptedData 和 iv 来自最新的授权结果
3. 检查 AppID 是否正确

### Q3: 云开发初始化失败

**原因**：
- 云环境 ID 错误
- 云开发未开通
- 网络问题

**解决方法**：
1. 确认云环境 ID 是否正确
2. 在云开发控制台检查环境状态
3. 检查网络连接

### Q4: 数据库权限错误

**原因**：
- 权限规则配置错误
- 用户未登录

**解决方法**：
1. 检查数据库权限规则
2. 确保用户已通过微信登录
3. 检查 _openid 是否正确

### Q5: 推算结果重复

**原因**：
- 算法使用相同的种子
- 日期未变化

**解决方法**：
1. 检查算法是否使用了日期作为随机种子的一部分
2. 测试不同日期是否生成不同结果

---

## 生产环境部署

### 1. 发布小程序

1. 在微信开发者工具中，点击「上传」
2. 填写版本号和项目备注
3. 在微信公众平台 → 版本管理 → 开发版本
4. 点击「提交审核」
5. 审核通过后点击「发布」

### 2. 性能优化建议

- 开启「分包加载」
- 使用「按需加载」云函数
- 优化图片资源
- 启用缓存策略

### 3. 监控与日志

- 在云开发控制台设置「告警规则」
- 定期查看云函数执行日志
- 监控数据库读写次数

---

## 安全检查清单

发布前请检查：

- [ ] 移除测试账号和测试数据
- [ ] 检查环境变量是否正确配置
- [ ] 验证数据库权限规则
- [ ] 测试用户数据删除功能
- [ ] 确认隐私政策已添加到小程序
- [ ] 检查是否有敏感信息泄露风险

---

## 回滚策略

如果遇到问题需要回滚：

1. **小程序版本回滚**
   - 在微信公众平台 → 版本管理中删除新版本
   - 重新发布上一个稳定版本

2. **云函数回滚**
   - 在云开发控制台 → 云函数中选择对应云函数
   - 点击「回滚」选择之前的版本

3. **数据库回滚**
   - 使用备份恢复数据
   - 或手动修改回滚数据

---

**更新日期**: 2025-01-10
