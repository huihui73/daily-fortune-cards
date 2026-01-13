// miniprogram/pages/login/login.js
const authManager = require('../../utils/authManager.js');

Page({
  data: {
    isLoggedIn: false,
    isPhoneAuthorized: false,
    phoneMasked: '',
    showLoginModal: false
  },

  onLoad() {
    this.initLogin();
  },

  async initLogin() {
    // 初始化认证管理器
    await authManager.init();

    // 更新页面状态
    this.updatePageState();

    // 添加状态监听
    authManager.addListener(this.updatePageState);

    // 如果未登录，进行静默登录
    if (!authManager.isLoggedIn) {
      await authManager.silentLogin();
    }
  },

  onUnload() {
    // 移除状态监听
  },

  updatePageState(state) {
    const currentState = state || authManager.getState();

    this.setData({
      isLoggedIn: currentState.isLoggedIn,
      isPhoneAuthorized: currentState.isPhoneAuthorized,
      phoneMasked: currentState.phoneMasked
    });
  },

  // 获取手机号授权
  onGetPhoneNumber(e) {
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      wx.showToast({
        title: '授权失败',
        icon: 'none'
      });
      return;
    }

    const { encryptedData, iv } = e.detail;

    wx.showLoading({ title: '处理中...' });

    authManager.authorizePhone(encryptedData, iv).then(result => {
      wx.hideLoading();

      if (result.success) {
        wx.showToast({
          title: '授权成功',
          icon: 'success'
        });

        // 延迟跳转到首页
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/home/home'
          });
        }, 1000);
      } else {
        wx.showToast({
          title: result.error || '授权失败',
          icon: 'none'
        });
      }
    });
  },

  // 重新登录
  async reLogin() {
    wx.showLoading({ title: '登录中...' });

    const result = await authManager.silentLogin();

    wx.hideLoading();

    if (result.success) {
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });
    } else {
      wx.showToast({
        title: result.error || '登录失败',
        icon: 'none'
      });
    }
  },

  // 跳转到首页
  goToHome() {
    if (this.data.isPhoneAuthorized) {
      wx.switchTab({
        url: '/pages/home/home'
      });
    }
  },

  // 跳转到个人中心
  goToProfile() {
    wx.navigateTo({
      url: '/pages/profile/profile'
    });
  }
});
