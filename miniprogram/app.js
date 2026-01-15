// miniprogram/app.js
App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请在微信开发者工具中开启云开发并使用云能力')
      return
    }

    // 云环境初始化（请替换为实际环境ID；若未配置实际ID，将不启用云能力）\n    try {\n      const CLOUD_ENV_ID = "YOUR_CLOUD_ENV_ID"; // 生产环境请改为实际值\n      if (CLOUD_ENV_ID && CLOUD_ENV_ID !== "YOUR_CLOUD_ENV_ID" && wx.cloud) {\n        wx.cloud.init({ env: CLOUD_ENV_ID });\n        console.log('云开发已初始化，环境ID：', CLOUD_ENV_ID);\n        globalThis.__cloudAvailable = true;\n      } else {\n        console.warn('未配置实际云环境ID，云能力不可用');\n        globalThis.__cloudAvailable = false;\n      }\n    } catch (err) {\n      console.warn('云开发初始化失败，后续云函数调用将失败:', err && err.message ? err.message : err);\n      globalThis.__cloudAvailable = false;\n    }

    // 检查并初始化用户状态
    this.checkUserStatus()
  },

  checkUserStatus() {
    const openid = wx.getStorageSync('openid')
    const phone = wx.getStorageSync('phone')
    const birthday = wx.getStorageSync('birthday')

    console.log('用户状态检查', {
      hasOpenid: !!openid,
      hasPhone: !!phone,
      hasBirthday: !!birthday
    })
  },

  globalData: {
    userInfo: null,
    openid: null,
    phone: null,
    sessionKey: null
  }
})
