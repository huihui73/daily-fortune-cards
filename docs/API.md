# API 文档

## 小程序端 API

### 云函数调用

#### 1. login - 登录获取 session_key 和 openid

**接口地址**: `callFunction('login')`

**请求参数**:
```javascript
{
  code: string  // wx.login 获取的 code
}
```

**返回数据**:
```javascript
{
  openid: string,
  session_key: string,
  unionid?: string,
  errcode?: number,
  errmsg?: string
}
```

**调用示例**:
```javascript
wx.cloud.callFunction({
  name: 'login',
  data: { code: code }
}).then(res => {
  const { openid, session_key } = res.result;
  console.log('登录成功', openid, session_key);
})
```

---

#### 2. decryptPhone - 解密手机号

**接口地址**: `callFunction('decryptPhone')`

**请求参数**:
```javascript
{
  sessionKey: string,      // 从 login 云函数获取
  encryptedData: string,   // wx.getPhoneNumber 获取
  iv: string,               // wx.getPhoneNumber 获取
  appId: string             // 小程序 AppID
}
```

**返回数据**:
```javascript
{
  phoneNumber: string,     // 用户手机号
  countryCode?: string,
  purePhoneNumber?: string
}
```

**调用示例**:
```javascript
wx.cloud.callFunction({
  name: 'decryptPhone',
  data: {
    sessionKey: sessionKey,
    encryptedData: encryptedData,
    iv: iv,
    appId: 'YOUR_APPID'
  }
}).then(res => {
  const { phoneNumber } = res.result;
  console.log('手机号解密成功', phoneNumber);
})
```

---

#### 3. getUserData - 获取用户数据（待实现）

**接口地址**: `callFunction('getUserData')`

**请求参数**:
```javascript
{
  openid: string,
  date?: string  // YYYY-MM-DD 格式，默认今日
}
```

**返回数据**:
```javascript
{
  birthday: string,
  gender: string,
  phone: string,
  fortune: FortuneResult,
  history: FortuneResult[],
  updatedAt: string
}
```

---

## 本地推算引擎 API

### FortuneEngine

#### generateFortune(birthday: string): FortuneResult

根据生日生成当天的推算结果。

**参数**:
- `birthday`: string - 格式 "YYYY-MM-DD"

**返回**:
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
  luckyNumber: number
}
```

**示例**:
```javascript
const fortuneEngine = require('../../utils/fortuneEngine.js');
const result = fortuneEngine.generateFortune('1990-01-01');
console.log(result.lifePathNumber);  // 5
```

---

#### buildCards(fortune: FortuneResult): Card[]

根据推算结果构建卡片列表。

**参数**:
- `fortune`: FortuneResult - 推算结果对象

**返回**:
```javascript
[
  {
    id: 'c1',
    title: '本日卦象',
    content: '卦-12：保持冷静...',
    color: '#6C63FF'
  },
  // ... 更多卡片
]
```

**示例**:
```javascript
const cards = fortuneEngine.buildCards(fortune);
this.setData({ cards });
```

---

#### getHexagramDetails(hexId: number): HexagramDetail

获取卦象的详细信息（64卦完整库）。

**参数**:
- `hexId`: number - 卦象ID (0-63)

**返回**:
```javascript
{
  id: number,
  name: string,
  symbol: string,
  meaning: string,
  lines: number[],
  interpretation: string,
  advice: string
}
```

---

#### getElementsAdvice(elements: Elements): string[]

根据五行强弱获取平衡建议。

**参数**:
- `elements`: { wood, fire, earth, metal, water }

**返回**:
- `string[]` - 建议列表

---

## 小程序页面路由

### 页面列表

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | /pages/home/home | 主页面，显示推算卡片 |
| 个人中心 | /pages/profile/profile | 用户信息和历史记录（开发中） |

### 跳转示例

```javascript
// 保留当前页面，跳转到新页面
wx.navigateTo({
  url: '/pages/profile/profile'
})

// 关闭当前页面，跳转到新页面
wx.redirectTo({
  url: '/pages/home/home'
})
```

---

## 数据存储 API

### 本地存储

#### 设置数据
```javascript
wx.setStorageSync('key', value)
// 或
wx.setStorage({
  key: 'key',
  data: value
})
```

#### 获取数据
```javascript
const value = wx.getStorageSync('key')
// 或
wx.getStorage({
  key: 'key',
  success: function(res) {
    console.log(res.data)
  }
})
```

#### 删除数据
```javascript
wx.removeStorageSync('key')
// 或
wx.removeStorage({
  key: 'key'
})
```

#### 清空所有数据
```javascript
wx.clearStorageSync()
```

---

## 微信登录授权流程

### 完整流程

```javascript
// 1. 获取登录 code
wx.login({
  success: res => {
    const code = res.code;

    // 2. 调用云函数换取 session_key 和 openid
    wx.cloud.callFunction({
      name: 'login',
      data: { code }
    }).then(res => {
      const { openid, session_key } = res.result;

      // 保存到本地
      wx.setStorageSync('openid', openid);
      wx.setStorageSync('session_key', session_key);
    });
  }
});

// 3. 获取手机号授权
onGetPhoneNumber(e) {
  if (e.detail.errMsg !== 'getPhoneNumber:ok') return;

  const encryptedData = e.detail.encryptedData;
  const iv = e.detail.iv;
  const sessionKey = wx.getStorageSync('session_key');

  // 4. 调用云函数解密手机号
  wx.cloud.callFunction({
    name: 'decryptPhone',
    data: {
      sessionKey,
      encryptedData,
      iv,
      appId: 'YOUR_APPID'
    }
  }).then(res => {
    const phoneNumber = res.result.phoneNumber;
    wx.setStorageSync('phone', phoneNumber);
  });
}
```

---

## 错误码说明

### 小程序错误

| 错误码 | 说明 |
|--------|------|
| -1 | 未知错误 |
| 40001 | AppSecret 错误 |
| 40002 | 不支持的 GrantType |
| 40003 | code 无效 |
| 40029 | code 无效 |

### 云函数错误

| 错误码 | 说明 |
|--------|------|
| 1001 | 登录失败 |
| 1002 | session_key 过期 |
| 1003 | 手机号解密失败 |
| 1004 | 参数错误 |

---

## 最佳实践

### 1. 缓存管理
- 重要数据（session_key）使用本地存储
- 定期清理过期缓存
- 设置合理的缓存过期时间

### 2. 错误处理
```javascript
try {
  const res = await wx.cloud.callFunction({ ... });
} catch (err) {
  console.error('云函数调用失败', err);
  wx.showToast({
    title: '请求失败，请重试',
    icon: 'none'
  });
}
```

### 3. 性能优化
- 推算引擎完全本地化，减少网络请求
- 使用防抖/节流处理频繁操作
- 合理使用云函数缓存

---

**更新日期**: 2025-01-10
