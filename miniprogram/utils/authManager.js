// miniprogram/utils/authManager.js
// 认证管理器 - 统一管理微信小程序的登录和认证逻辑

class AuthManager {
  constructor() {
    this.openid = null;
    this.sessionKey = null;
    this.phone = null;
    this.userInfo = null;
    this.isLoggedIn = false;
    this.isPhoneAuthorized = false;
    this.listeners = [];
  }

  // 初始化，从本地存储加载状态
  async init() {
    const openid = wx.getStorageSync('openid');
    const sessionKey = wx.getStorageSync('session_key');
    const phone = wx.getStorageSync('phone');
    const userInfo = wx.getStorageSync('userInfo');

    this.openid = openid || null;
    this.sessionKey = sessionKey || null;
    this.phone = phone || null;
    this.userInfo = userInfo || null;

    this.isLoggedIn = !!this.openid;
    this.isPhoneAuthorized = !!this.phone;

    console.log('AuthManager 初始化', {
      isLoggedIn: this.isLoggedIn,
      isPhoneAuthorized: this.isPhoneAuthorized,
      hasOpenid: !!this.openid,
      hasPhone: !!this.phone
    });
  }

  // 添加状态监听器
  addListener(callback) {
    this.listeners.push(callback);
  }

  // 通知所有监听器
  notifyListeners() {
    const state = this.getState();
    this.listeners.forEach(callback => callback(state));
  }

  // 获取当前状态
  getState() {
    return {
      openid: this.openid,
      phone: this.phone,
      phoneMasked: this.maskPhone(this.phone),
      userInfo: this.userInfo,
      isLoggedIn: this.isLoggedIn,
      isPhoneAuthorized: this.isPhoneAuthorized
    };
  }

  // 微信静默登录
  async silentLogin() {
    try {
      const code = await this.getWxLoginCode();

      const res = await wx.cloud.callFunction({
        name: 'login',
        data: { code }
      });

      const { openid, session_key, unionid } = res.result;

      if (openid) {
        this.openid = openid;
        this.sessionKey = session_key;
        this.isLoggedIn = true;

        // 保存到本地存储
        wx.setStorageSync('openid', openid);
        wx.setStorageSync('session_key', session_key);
        if (unionid) {
          wx.setStorageSync('unionid', unionid);
        }

        this.notifyListeners();
        console.log('静默登录成功', { openid });
        return { success: true, openid };
      } else {
        console.error('静默登录失败', res.result);
        return { success: false, error: '登录失败' };
      }
    } catch (error) {
      console.error('静默登录异常', error);
      return { success: false, error: error.message };
    }
  }

  // 获取微信登录 code
  getWxLoginCode() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: res => {
          if (res.code) {
            resolve(res.code);
          } else {
            reject(new Error('获取code失败'));
          }
        },
        fail: reject
      });
    });
  }

  // 授权手机号
  async authorizePhone(encryptedData, iv) {
    try {
      if (!this.sessionKey) {
        // 先进行静默登录获取 sessionKey
        const loginResult = await this.silentLogin();
        if (!loginResult.success) {
          return { success: false, error: '登录失败，无法获取手机号' };
        }
      }

      const appId = "YOUR_APPID"; // 需要替换为实际 AppID

      const res = await wx.cloud.callFunction({
        name: 'decryptPhone',
        data: {
          sessionKey: this.sessionKey,
          encryptedData,
          iv,
          appId
        }
      });

      const phoneNumber = res.result.phoneNumber;

      if (phoneNumber) {
        this.phone = phoneNumber;
        this.isPhoneAuthorized = true;

        // 保存到本地存储
        wx.setStorageSync('phone', phoneNumber);

        this.notifyListeners();
        console.log('手机号授权成功', phoneNumber);
        return { success: true, phone: phoneNumber };
      } else {
        console.error('手机号解密失败', res.result);
        return { success: false, error: '手机号解密失败' };
      }
    } catch (error) {
      console.error('授权手机号异常', error);
      return { success: false, error: error.message };
    }
  }

  // 检查登录状态
  checkLoginStatus() {
    return this.isLoggedIn && this.isPhoneAuthorized;
  }

  // 登出
  async logout() {
    // 清除本地存储
    wx.removeStorageSync('openid');
    wx.removeStorageSync('session_key');
    wx.removeStorageSync('unionid');
    wx.removeStorageSync('phone');
    wx.removeStorageSync('userInfo');

    // 清除内存状态
    this.openid = null;
    this.sessionKey = null;
    this.phone = null;
    this.userInfo = null;
    this.isLoggedIn = false;
    this.isPhoneAuthorized = false;

    this.notifyListeners();
    console.log('登出成功');
  }

  // 脱敏手机号
  maskPhone(phone) {
    if (!phone || phone.length < 7) return phone;
    return phone.substr(0, 3) + '****' + phone.substr(7);
  }

  // 更新用户信息
  updateUserInfo(userInfo) {
    this.userInfo = userInfo;
    wx.setStorageSync('userInfo', userInfo);
    this.notifyListeners();
  }

  // 获取用户信息
  getUserInfo() {
    return this.userInfo;
  }
}

// 创建单例实例
const authManager = new AuthManager();

module.exports = authManager;
