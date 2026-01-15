// backend/src/routes/wechat.js
const express = require('express')
const router = express.Router()
const wechatController = require('../controllers/wechatController')

// WeChat login: accepts code, encryptedData, iv from the frontend (微信小程序授权流程)
router.post('/login', wechatController.login)

module.exports = router
