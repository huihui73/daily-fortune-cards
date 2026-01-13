// miniprogram/app.js
App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请在微信开发者工具中开启云开发并使用云能力')
      return
    }

    // 替换为你在微信开发者平台配置的云环境 ID
    wx.cloud.init({ env: "YOUR_CLOUD_ENV_ID" })

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
