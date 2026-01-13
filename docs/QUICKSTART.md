# 快速开始指南

欢迎使用「每日推算卡」小程序！本指南将帮助你在10分钟内完成项目部署和运行。

---

## 前置检查清单

在开始之前，请确保你已经：

- [ ] 安装了微信开发者工具
- [ ] 注册了微信小程序账号
- [ ] 开通了云开发服务

---

## 第一步：导入项目

1. 打开微信开发者工具
2. 点击「+」按钮导入项目
3. 选择 `daily-fortune-cards/miniprogram` 目录
4. 填入你的 `AppID`（或选择测试号）
5. 点击「导入」

---

## 第二步：配置云环境

### 1. 开启云开发

在微信开发者工具中：
1. 点击左侧菜单「云开发」
2. 点击「开通」
3. 选择环境类型（免费版即可）
4. 环境名称：`daily-fortune-dev`
5. 点击「确定」
6. 复制生成的环境 ID（格式：`daily-fortune-dev-xxxxx`）

### 2. 更新配置文件

打开 `miniprogram/app.js`，将云环境 ID 替换为你的：

```javascript
wx.cloud.init({ env: "YOUR_CLOUD_ENV_ID" })
```

改为：

```javascript
wx.cloud.init({ env: "daily-fortune-dev-xxxxx" })
```

### 3. 配置 AppID

在 `pages/home/home.js` 中找到：

```javascript
const appId = "YOUR_APPID";
```

替换为你的小程序 AppID。

---

## 第三步：配置云函数环境变量

1. 在云开发控制台 → 云函数 → 设置 → 环境变量
2. 添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| APPID | 你的AppID | 在微信公众平台获取 |
| APPSECRET | 你的AppSecret | 在微信公众平台获取 |

### 获取 AppID 和 AppSecret

1. 访问 [微信公众平台](https://mp.weixin.qq.com/)
2. 登录你的小程序账号
3. 进入「开发」→「开发管理」→「开发设置」
4. 复制 `AppID`
5. 点击「重置」生成新的 `AppSecret`（首次需要设置密码）

---

## 第四步：上传云函数

### 1. 安装依赖

在项目根目录打开终端，执行：

```bash
cd cloudfunctions/login
npm install

cd ../decryptPhone
npm install

cd ../getUserData
npm install
```

### 2. 上传云函数

在微信开发者工具中：

1. 右键点击 `cloudfunctions/login` 目录
2. 选择「上传并部署：云端安装依赖」
3. 等待上传完成
4. 重复以上步骤，上传 `decryptPhone` 和 `getUserData`

### 3. 测试云函数

在云开发控制台 → 云函数中，测试 `login` 函数：

输入：
```json
{
  "code": "你的wx.login返回的code"
}
```

预期输出：
```json
{
  "openid": "xxx",
  "session_key": "xxx"
}
```

---

## 第五步：创建数据库集合

在云开发控制台 → 数据库中，创建以下集合：

1. `users` - 用户表
2. `fortunes` - 推算记录表
3. `daily_tasks` - 每日任务表
4. `diaries` - 日记表
5. `hexagrams` - 卦象库表
6. `clothing_templates` - 穿衣模板表
7. `diet_templates` - 饮食模板表

### 配置数据库权限

为每个集合设置权限：

1. 点击集合 → 权限设置
2. 选择「自定义」
3. 输入权限规则：

```json
{
  "read": "auth._openid == doc._openid",
  "write": "auth._openid == doc._openid"
}
```

---

## 第六步：导入卦象数据（可选）

在云开发控制台 → 数据库 → `hexagrams` 集合中：

1. 点击「导入」
2. 选择 `docs/hexagrams.json` 文件
3. 点击「确认导入」

---

## 第七步：运行小程序

1. 在微信开发者工具中点击「编译」
2. 扫描二维码在手机上预览
3. 测试功能流程：

**测试流程**：

1. 选择生日
2. 选择性别（可选）
3. 点击「使用微信手机号登录」
4. 授权手机号
5. 点击「生成今日卡片」
6. 查看生成的8-10张卡片

---

## 常见问题

### Q: 云函数上传失败？

**A**: 检查网络连接，或重新安装依赖：
```bash
cd cloudfunctions/login
rm -rf node_modules
npm install
```

### Q: 手机号解密失败？

**A**:
1. 检查环境变量是否正确配置
2. 确认 AppID 和 AppSecret 是否正确
3. 检查 session_key 是否过期（2小时有效期）

### Q: 云开发初始化失败？

**A**:
1. 确认云环境 ID 是否正确
2. 检查云开发是否已开通
3. 尝试重新编译

### Q: 卡片生成失败？

**A**:
1. 确保已选择生日
2. 检查控制台错误日志
3. 查看网络连接

---

## 下一步

项目已成功部署！接下来你可以：

1. **自定义样式**
   - 修改 `app.wxss` 中的颜色和样式
   - 调整卡片组件的视觉效果

2. **扩展内容**
   - 在 `fortuneEngine.js` 中添加更多卦象解读
   - 创建新的穿衣和饮食模板

3. **添加新功能**
   - 实现日记功能
   - 添加历史记录查看
   - 开发社交分享功能

4. **发布上线**
   - 在微信开发者工具中点击「上传」
   - 在微信公众平台提交审核
   - 审核通过后发布

---

## 获取帮助

如果遇到问题，请查看：

- **文档**: `docs/` 目录
- **API文档**: `docs/API.md`
- **部署指南**: `docs/DEPLOY.md`
- **数据库设计**: `docs/DATABASE.md`

或提交 Issue 获取支持。

---

祝你使用愉快！🎉

**更新日期**: 2025-01-10
