// backend/src/controllers/wechatController.js
const crypto = require('crypto');
const https = require('https');
const bcrypt = require('bcryptjs');
const db = require('../database/connection');
const { generateToken } = require('../config/jwt');
const { USER_TYPES, HTTP_STATUS } = require('../config/constants');

function decryptWeChatData(encryptedData, iv, sessionKey) {
  try {
    const key = Buffer.from(sessionKey, 'base64');
    const ivBuf = Buffer.from(iv, 'base64');
    const decipher = crypto.createDecipheriv('aes-128-cbc', key, ivBuf);
    decipher.setAutoPadding(true);
    const decoded = Buffer.concat([
      decipher.update(Buffer.from(encryptedData, 'base64')),
      decipher.final()
    ]);
    const result = JSON.parse(decoded.toString('utf8'));
    return result;
  } catch (e) {
    console.error('微信数据解密失败:', e);
    return null;
  }
}

async function login(req, res) {
  try {
    const { code, encryptedData, iv } = req.body;
    if (!code || !encryptedData || !iv) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: '缺少参数' });
    }

    const appid = process.env.WECHAT_APPID;
    const secret = process.env.WECHAT_SECRET;
    if (!appid || !secret) {
      return res.status(HTTP_STATUS.NOT_IMPLEMENTED).json({ success: false, message: '未配置微信登录参数' });
    }

    const sessionUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;

    const sessionInfo = await new Promise((resolve, reject) => {
      https.get(sessionUrl, (resp) => {
        let data = '';
        resp.on('data', (chunk) => (data += chunk));
        resp.on('end', () => {
          try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
        });
        resp.on('error', reject);
      }).on('error', reject);
    });

    if (sessionInfo.errcode) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: sessionInfo.errmsg || '微信登录失败' });
    }

    const sessionKey = sessionInfo.session_key;
    const openid = sessionInfo.openid;

    const decrypted = decryptWeChatData(encryptedData, iv, sessionKey);
    const phoneNumber = decrypted && decrypted.phoneNumber;

    if (!phoneNumber) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: '获取手机号失败' });
    }

    let user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phoneNumber);
    if (!user) {
      const phoneMasked = phoneNumber.substr(0, 3) + '****' + phoneNumber.substr(7);
      const passwordHash = bcrypt.hashSync('wechat_login', 10);
      const insertStmt = db.prepare(`INSERT INTO users (phone, password, nickname, phoneMasked, first_login) VALUES (?, ?, ?, ?, 1)`);
      const result = insertStmt.run(phoneNumber, passwordHash, phoneNumber, phoneMasked);
      user = { id: result.lastInsertRowid, phone: phoneNumber, phoneMasked };
    }

    const token = generateToken({ userId: user.id, username: phoneNumber, userType: USER_TYPES.WEB });

    res.status(HTTP_STATUS.OK).json({ success: true, data: { userId: user.id, token, phoneMasked: user.phoneMasked } });
  } catch (err) {
    console.error('微信登录处理失败:', err);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: '登录失败' });
  }
}

module.exports = { login };
