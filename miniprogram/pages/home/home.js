const authManager = require('../../utils/authManager.js');
const fortuneEngine = require('../../utils/fortuneEngine.js');
const errorHandler = require('../../utils/errorHandler.js');

Page({
  data: {
    birthday: '',
    gender: 'unspecified',
    phoneMasked: '',
    isPhoneAuthorized: false,
    today: '',
    cards: [],
    fortune: null,
    isGenerating: false,
    lastGenerateDate: '',
    showLoginGuide: false
  },

  onLoad() {
    this.initPage();
  },

  onShow() {
    this.checkTodayDate();
    this.updateAuthState();
  },

  onPullDownRefresh() {
    this.initPage();
    wx.stopPullDownRefresh();
  },

  async initPage() {
    const today = this.getTodayDate();
    this.setData({ today });

    this.loadCachedData();
    await authManager.init();
    this.updateAuthState();
    authManager.addListener(this.updateAuthState);
    this.checkAndRegenerate();
  },

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
  },

  checkAuthStatus() {
    const state = authManager.getState();
    const birthday = wx.getStorageSync('birthday');
    
    if (!state.isPhoneAuthorized && !birthday) {
      this.setData({ showLoginGuide: true });
    } else if (state.isPhoneAuthorized) {
      this.setData({ showLoginGuide: false });
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
  },

  checkTodayDate() {
    const today = this.getTodayDate();
    if (this.data.today !== today) {
      this.setData({ today });
      this.checkAndRegenerate();
    }
  },

  checkAndRegenerate() {
    const { birthday, lastGenerateDate, today, isGenerating, cards } = this.data;

    if (birthday) {
      const cacheKey = fortuneEngine.getCacheKey(birthday, today);
      const cachedFortune = wx.getStorageSync(cacheKey);

      if (cachedFortune) {
        this.setData({ cards: cachedFortune });
      } else if (cards.length === 0 && !isGenerating) {
        this.generateFortune();
      } else if (lastGenerateDate !== today) {
        this.generateFortune();
      } else if (lastGenerateDate) {
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

    setTimeout(() => {
      try {
        const fortune = fortuneEngine.generateFortune(birthday, today);
        let cards = fortuneEngine.buildCards(fortune);

        const cacheKey = fortuneEngine.getCacheKey(birthday, today);
        const cachedTasks = wx.getStorageSync(`tasks_${cacheKey}`);

        if (cachedTasks) {
          cards = cards.map(card => {
            if (card.id === 'c7' && cachedTasks) {
              return {
                ...card,
                tasks: cachedTasks
              };
            }
            return card;
          });
        }

        wx.setStorageSync(cacheKey, cards);
        wx.setStorageSync('lastGenerateDate', today);

        this.saveToHistory(birthday, fortune);

        this.setData({
          cards,
          fortune,
          isGenerating: false,
          lastGenerateDate: today
        });

        wx.showToast({
          title: '生成成功',
          icon: 'success'
        });
      } catch (error) {
        errorHandler.handle(error, { showType: 'toast', customMessage: '生成失败，请重试' });
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
      this.setData({ cards: [], fortune: null });
    }
  },

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

        setTimeout(() => {
          this.updateAuthState();
          if (this.data.birthday) {
            this.generateFortune();
          }
        }, 300);
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
