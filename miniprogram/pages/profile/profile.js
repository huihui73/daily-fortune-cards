// miniprogram/pages/profile/profile.js
const authManager = require('../../utils/authManager.js');
const fortuneEngine = require('../../utils/fortuneEngine.js');

Page({
  data: {
    phoneMasked: '',
    birthday: '',
    gender: 'unspecified',
    historyCount: 0,
    isPhoneAuthorized: false
  },

  onLoad() {
    this.initProfile();
  },

  onShow() {
    this.updateAuthState();
  },

  initProfile() {
    this.updateAuthState();
    this.loadUserInfo();
    this.loadHistoryCount();
  },

  updateAuthState() {
    const state = authManager.getState();

    this.setData({
      phoneMasked: state.phoneMasked,
      isPhoneAuthorized: state.isPhoneAuthorized
    });

    // 如果未登录，跳转到登录页
    if (!state.isLoggedIn || !state.isPhoneAuthorized) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        showCancel: false,
        success: () => {
          wx.switchTab({
            url: '/pages/login/login'
          });
        }
      });
    }
  },

  loadUserInfo() {
    const birthday = wx.getStorageSync('birthday');
    const gender = wx.getStorageSync('gender') || 'unspecified';

    this.setData({
      birthday,
      gender
    });
  },

  loadHistoryCount() {
    // 从本地存储加载历史记录数量
    const history = wx.getStorageSync('fortuneHistory') || [];
    this.setData({
      historyCount: history.length
    });
  },

  onBirthdayChange(e) {
    const birthday = e.detail.value;
    this.setData({ birthday });
    wx.setStorageSync('birthday', birthday);
  },

  onGenderChange(e) {
    const gender = e.detail.value || 'unspecified';
    this.setData({ gender });
    wx.setStorageSync('gender', gender);
  },

  onLogout() {
    wx.showModal({
      title: '确认登出',
      content: '登出后将清除本地数据，是否继续？',
      success: (res) => {
        if (res.confirm) {
          authManager.logout();
          wx.showToast({
            title: '已登出',
            icon: 'success'
          });

          setTimeout(() => {
            wx.switchTab({
              url: '/pages/login/login'
            });
          }, 1000);
        }
      }
    });
  },

  onClearCache() {
    wx.showModal({
      title: '确认清除',
      content: '将清除所有本地缓存数据，是否继续？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync();
          wx.showToast({
            title: '缓存已清除',
            icon: 'success'
          });

          setTimeout(() => {
            wx.reLaunch({
              url: '/pages/login/login'
            });
          }, 1000);
        }
      }
    });
  },

  onShareAppMessage() {
    return {
      title: '每日推算卡',
      path: '/pages/home/home'
    };
  }
});
