// miniprogram/pages/home/home.js
const authManager = require('../../utils/authManager.js');
const fortuneEngine = require('../../utils/fortuneEngine.js');

Page({
  data: {
    birthday: '',
    gender: 'unspecified',
    phoneMasked: '',
    isPhoneAuthorized: false,
    today: '',
    cards: [],
    isGenerating: false,
    lastGenerateDate: '',
    showLoginGuide: false
  },

  onLoad() {
    this.initPage();
  },

  onShow() {
    this.checkTodayDate();
    this.checkAuthStatus();
  },

  onPullDownRefresh() {
    this.initPage();
    wx.stopPullDownRefresh();
  },

  async initPage() {
    const today = this.getTodayDate();
    this.setData({ today });

    // 初始化认证管理器
    await authManager.init();

    // 更新认证状态
    this.updateAuthState();

    // 添加状态监听
    authManager.addListener(this.updateAuthState);

    // 加载缓存数据
    this.loadCachedData();

    // 检查是否需要重新生成
    this.checkAndRegenerate();
  },

  updateAuthState(state) {
    const currentState = state || authManager.getState();

    this.setData({
      phoneMasked: currentState.phoneMasked,
      isPhoneAuthorized: currentState.isPhoneAuthorized
    });

    // 如果未授权手机号，显示登录引导
    if (!currentState.isPhoneAuthorized) {
      this.setData({ showLoginGuide: true });
    }
  },

  checkAuthStatus() {
    // 每次页面显示时检查认证状态
    const state = authManager.getState();

    if (!state.isPhoneAuthorized) {
      this.setData({ showLoginGuide: true });
    }
  },

  getTodayDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

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
  },

  checkTodayDate() {
    const today = this.getTodayDate();
    if (this.data.today !== today) {
      this.setData({ today });
      this.checkAndRegenerate();
    }
  },

  checkAndRegenerate() {
    const { birthday, lastGenerateDate, today } = this.data;

    if (birthday) {
      const cacheKey = fortuneEngine.getCacheKey(birthday, today);
      const cachedFortune = wx.getStorageSync(cacheKey);

      if (cachedFortune) {
        this.setData({ cards: cachedFortune });
      } else if (lastGenerateDate !== today) {
        // New day, auto-generate if we have birthday
        this.generateFortune();
      } else {
        // Same day, try to load from previous cache
        const lastCacheKey = fortuneEngine.getCacheKey(birthday, lastGenerateDate);
        const lastCachedFortune = wx.getStorageSync(lastCacheKey);

        if (lastCachedFortune) {
          this.setData({ cards: lastCachedFortune });
        }
      }
    }
  },

  onBirthdayChange(e) {
    const birthday = e.detail.value;
    this.setData({ birthday });
    wx.setStorageSync('birthday', birthday);

    // Clear cached fortune when birthday changes
    this.clearCachedFortune();
  },

  onGenderChange(e) {
    const gender = e.detail.value || 'unspecified';
    this.setData({ gender });
    wx.setStorageSync('gender', gender);
  },

  generateFortune() {
    const { birthday, today } = this.data;

    if (!birthday) {
      wx.showToast({
        title: '请选择生日',
        icon: 'none'
      });
      return;
    }

    this.setData({ isGenerating: true });

    // Simulate a small delay for better UX
    setTimeout(() => {
      try {
        const fortune = fortuneEngine.generateFortune(birthday, today);
        const cards = fortuneEngine.buildCards(fortune);

        // Cache result
        const cacheKey = fortuneEngine.getCacheKey(birthday, today);
        wx.setStorageSync(cacheKey, cards);
        wx.setStorageSync('lastGenerateDate', today);

        // Save to history
        this.saveToHistory(birthday, fortune);

        this.setData({
          cards,
          isGenerating: false,
          lastGenerateDate: today
        });

        wx.showToast({
          title: '生成成功',
          icon: 'success'
        });
      } catch (error) {
        console.error('生成推算失败', error);
        wx.showToast({
          title: '生成失败，请重试',
          icon: 'none'
        });
        this.setData({ isGenerating: false });
      }
    }, 500);
  },

  saveToHistory(birthday, fortune) {
    try {
      let history = wx.getStorageSync('fortuneHistory') || [];

      const historyItem = {
        date: fortune.date,
        birthday,
        fortune
      };

      history.unshift(historyItem);

      // 保留最近 7 条记录
      if (history.length > 7) {
        history = history.slice(0, 7);
      }

      wx.setStorageSync('fortuneHistory', history);
    } catch (error) {
      console.error('保存历史记录失败', error);
    }
  },

  clearCachedFortune() {
    const { birthday, today } = this.data;
    if (birthday) {
      const cacheKey = fortuneEngine.getCacheKey(birthday, today);
      wx.removeStorageSync(cacheKey);
      this.setData({ cards: [] });
    }
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

    authManager.authorizePhone(encryptedData, iv).then(result => {
      if (result.success) {
        wx.showToast({
          title: '授权成功',
          icon: 'success'
        });

        // Hide login guide
        this.setData({ showLoginGuide: false });

        // Generate fortune if we have birthday
        if (this.data.birthday) {
          this.generateFortune();
        }
      } else {
        wx.showToast({
          title: result.error || '授权失败',
          icon: 'none'
        });
      }
    });
  },

  onCardToggle(e) {
    console.log('卡片切换', e.detail);
  },

  shareCard(title, content) {
    return {
      title: title || '每日推算卡',
      path: '/pages/home/home',
      imageUrl: ''
    };
  },

  onShareAppMessage() {
    const { birthday } = this.data;
    if (birthday && this.data.cards.length > 0) {
      const hexagramCard = this.data.cards.find(c => c.id === 'c1');
      if (hexagramCard) {
        return this.shareCard(hexagramCard.title, hexagramCard.content);
      }
    }
    return this.shareCard('每日推算卡', '今日运势已生成');
  }
});
