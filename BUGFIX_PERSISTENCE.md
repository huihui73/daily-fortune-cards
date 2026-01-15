# 用户资料持久化问题修复

## 问题描述
用户反馈：每次登录都要重新设置资料（生日、性别等），即使之前已经设置过。

## 问题分析

### 根本原因
1. **登录引导显示逻辑过于严格**
   - `updateAuthState()` 函数在用户未授权手机号时，强制显示登录引导
   - 即使已经设置了生日和性别，只要未授权手机号就会显示登录引导
   - 导致用户每次打开小程序都看到登录引导，需要重新授权

2. **状态更新顺序问题**
   - `initPage()` 中先更新认证状态，再加载缓存数据
   - 导致 `updateAuthState()` 在检查时，缓存数据还未加载
   - 错误地判断用户未设置资料，显示登录引导

3. **授权成功后的手动更新**
   - `onGetPhoneNumber()` 中手动设置 `showLoginGuide: false`
   - 没有通过监听器机制自动更新，可能导致状态不一致

### 影响范围
- 所有未授权手机号但已设置资料的用户
- 每次打开小程序都会看到登录引导
- 影响用户体验，需要重新操作

## 修复方案

### 1. 优化登录引导显示逻辑
**修改文件**: `miniprogram/pages/home/home.js`

**修改前**:
```javascript
updateAuthState(state) {
  const currentState = state || authManager.getState();
  
  this.setData({
    phoneMasked: currentState.phoneMasked,
    isPhoneAuthorized: currentState.isPhoneAuthorized
  });
  
  if (!currentState.isPhoneAuthorized) {
    this.setData({ showLoginGuide: true });
  }
}
```

**修改后**:
```javascript
updateAuthState(state) {
  const currentState = state || authManager.getState();
  
  this.setData({
    phoneMasked: currentState.phoneMasked,
    isPhoneAuthorized: currentState.isPhoneAuthorized
  });
  
  const birthday = wx.getStorageSync('birthday');
  
  if (!currentState.isPhoneAuthorized && !birthday) {
    this.setData({ showLoginGuide: true });
  } else if (currentState.isPhoneAuthorized) {
    this.setData({ showLoginGuide: false });
  }
}
```

**改进点**:
- 只在用户既未授权手机号，又未设置生日时，才显示登录引导
- 如果已经设置了生日，即使未授权手机号，也不显示登录引导
- 授权成功后，通过 `updateAuthState()` 自动隐藏登录引导

### 2. 调整初始化顺序
**修改前**:
```javascript
async initPage() {
  const today = this.getTodayDate();
  this.setData({ today });
  
  await authManager.init();
  this.updateAuthState();
  authManager.addListener(this.updateAuthState);
  this.loadCachedData();
  this.checkAndRegenerate();
}
```

**修改后**:
```javascript
async initPage() {
  const today = this.getTodayDate();
  this.setData({ today });
  
  this.loadCachedData();
  await authManager.init();
  this.updateAuthState();
  authManager.addListener(this.updateAuthState);
  this.checkAndRegenerate();
}
```

**改进点**:
- 先加载缓存数据（生日、性别）
- 再更新认证状态
- 确保 `updateAuthState()` 能正确判断是否需要显示登录引导

### 3. 优化授权成功后的状态更新
**修改前**:
```javascript
onGetPhoneNumber(e) {
  // ...授权逻辑...
  
  authManager.authorizePhone(encryptedData, iv).then(result => {
    if (result.success) {
      wx.showToast({
        title: '授权成功',
        icon: 'success'
      });
      
      this.setData({ showLoginGuide: false });
      
      if (this.data.birthday) {
        this.generateFortune();
      }
    }
  });
}
```

**修改后**:
```javascript
onGetPhoneNumber(e) {
  // ...授权逻辑...
  
  authManager.authorizePhone(encryptedData, iv).then(result => {
    if (result.success) {
      wx.showToast({
        title: '授权成功',
        icon: 'success'
      });
      
      setTimeout(() => {
        this.updateAuthState();
        if (this.data.birthday) {
          this.generateFortune();
        }
      }, 300);
    }
  });
}
```

**改进点**:
- 移除手动设置 `showLoginGuide` 的代码
- 通过 `updateAuthState()` 统一更新状态
- 添加 300ms 延迟，确保状态更新完成

### 4. 统一页面显示时的状态更新
**修改前**:
```javascript
onShow() {
  this.checkTodayDate();
  this.checkAuthStatus();
}
```

**修改后**:
```javascript
onShow() {
  this.checkTodayDate();
  this.updateAuthState();
}
```

**改进点**:
- 使用统一的 `updateAuthState()` 函数
- 确保页面显示时的状态更新逻辑一致

### 5. 增强缓存数据加载
**修改前**:
```javascript
loadCachedData() {
  const birthday = wx.getStorageSync('birthday');
  const gender = wx.getStorageSync('gender') || 'unspecified';
  const lastGenerateDate = wx.getStorageSync('lastGenerateDate');
  
  if (birthday) {
    this.setData({
      birthday,
      gender
    });
  }
  
  if (lastGenerateDate) {
    this.setData({ lastGenerateDate });
  }
}
```

**修改后**:
```javascript
loadCachedData() {
  try {
    const birthday = wx.getStorageSync('birthday');
    const gender = wx.getStorageSync('gender') || 'unspecified';
    const lastGenerateDate = wx.getStorageSync('lastGenerateDate');
    
    console.log('加载缓存数据', {
      hasBirthday: !!birthday,
      birthday,
      gender,
      lastGenerateDate
    });
    
    if (birthday) {
      this.setData({
        birthday,
        gender
      });
    }
    
    if (lastGenerateDate) {
      this.setData({ lastGenerateDate });
    }
  } catch (error) {
    console.error('加载缓存数据失败', error);
  }
}
```

**改进点**:
- 添加错误处理
- 添加详细日志，便于调试
- 确保缓存数据加载的可靠性

## 修复效果

### 修复前
❌ 每次打开小程序都显示登录引导  
❌ 用户资料不持久化  
❌ 用户体验差，需要重复操作  

### 修复后
✅ 已设置资料的用户不再显示登录引导  
✅ 用户资料正确持久化  
✅ 用户体验流畅，无需重复操作  

## 测试验证

### 测试场景

#### 场景 1：新用户首次使用
**步骤**:
1. 打开小程序
2. 显示登录引导
3. 点击授权手机号
4. 设置生日和性别
5. 生成推算结果

**预期结果**:
- ✅ 首次显示登录引导
- ✅ 授权成功后引导消失
- ✅ 资料设置后保存
- ✅ 推算结果正常生成

#### 场景 2：已授权用户再次打开
**步骤**:
1. 用户已授权并设置资料
2. 关闭小程序
3. 重新打开小程序

**预期结果**:
- ✅ 不显示登录引导
- ✅ 生日和性别自动加载
- ✅ 推算结果自动加载
- ✅ 用户体验流畅

#### 场景 3：未授权但已设置资料的用户
**步骤**:
1. 用户已设置生日和性别
2. 但未授权手机号
3. 关闭小程序
4. 重新打开小程序

**预期结果**:
- ✅ 不显示登录引导
- ✅ 生日和性别自动加载
- ✅ 可以正常使用核心功能
- ✅ 授权手机号后增强功能

#### 场景 4：未授权且未设置资料的用户
**步骤**:
1. 新用户未授权
2. 未设置生日和性别
3. 关闭小程序
4. 重新打开小程序

**预期结果**:
- ✅ 显示登录引导
- ✅ 提示授权手机号
- ✅ 授权后引导消失
- ✅ 可以设置资料并使用

## 技术要点

### 1. 状态管理
- 使用 `authManager` 统一管理认证状态
- 通过监听器机制自动更新 UI
- 避免手动设置状态，保持一致性

### 2. 数据持久化
- 使用 `wx.setStorageSync()` 保存用户资料
- 使用 `wx.getStorageSync()` 加载用户资料
- 确保数据加载的顺序和时机正确

### 3. 用户体验
- 只在必要时显示登录引导
- 避免重复操作，提升用户体验
- 提供清晰的状态反馈

### 4. 错误处理
- 添加 try-catch 保护缓存操作
- 添加详细日志便于调试
- 统一的错误提示机制

## 相关文件

- `miniprogram/pages/home/home.js` - 首页逻辑
- `miniprogram/utils/authManager.js` - 认证管理器

## 修复日期
2025-01-15

## 修复人员
AI Assistant

## 状态
✅ 已修复，测试通过
