const errorHandler = require('./errorHandler.js');

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

  addListener(callback) {
    this.listeners.push(callback);
  }

  notifyListeners() {
    const state = this.getState();
    this.listeners.forEach(callback => callback(state));
  }

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
      errorHandler.handle(error, { showType: 'toast', customMessage: '登录失败，请重试' });
      return { success: false, error: error.message };
    }
  }

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

  async authorizePhone(encryptedData, iv) {
    try {
      if (!this.sessionKey) {
        const loginResult = await this.silentLogin();
        if (!loginResult.success) {
          return { success: false, error: '登录失败，无法获取手机号' };
        }
      }

      const appId = "YOUR_APPID";

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

        wx.setStorageSync('phone', phoneNumber);

        this.notifyListeners();
        console.log('手机号授权成功', phoneNumber);
        return { success: true, phone: phoneNumber };
      } else {
        console.error('手机号解密失败', res.result);
        return { success: false, error: '手机号解密失败' };
      }
    } catch (error) {
      errorHandler.handle(error, { showType: 'toast', customMessage: '授权失败，请重试' });
      return { success: false, error: error.message };
    }
  }

  checkLoginStatus() {
    return this.isLoggedIn && this.isPhoneAuthorized;
  }

  async logout() {
    wx.removeStorageSync('openid');
    wx.removeStorageSync('session_key');
    wx.removeStorageSync('unionid');
    wx.removeStorageSync('phone');
    wx.removeStorageSync('userInfo');

    this.openid = null;
    this.sessionKey = null;
    this.phone = null;
    this.userInfo = null;
    this.isLoggedIn = false;
    this.isPhoneAuthorized = false;

    this.notifyListeners();
    console.log('登出成功');
  }

  maskPhone(phone) {
    if (!phone || phone.length < 7) return phone;
    return phone.substr(0, 3) + '****' + phone.substr(7);
  }

  updateUserInfo(userInfo) {
    this.userInfo = userInfo;
    wx.setStorageSync('userInfo', userInfo);
    this.notifyListeners();
  }

  getUserInfo() {
    return this.userInfo;
  }
}

const authManager = new AuthManager();

module.exports = authManager;
