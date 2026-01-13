// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../config/jwt');
const { RESPONSE_MESSAGES, HTTP_STATUS } = require('../config/constants');

const authMiddleware = (req, res, next) => {
  try {
    // 从请求头获取 token
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    console.log('Auth middleware - Headers:', Object.keys(req.headers));
    console.log('Auth middleware - Authorization:', authHeader);
    console.log('Auth middleware - Token:', token);

    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: RESPONSE_MESSAGES.UNAUTHORIZED
      });
    }

    // 验证 token
    const decoded = verifyToken(token);
    if (!decoded) {
      console.log('Token verification failed');
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: RESPONSE_MESSAGES.INVALID_TOKEN
      });
    }

    console.log('Token verified successfully:', decoded);

    // 将用户信息添加到请求对象
    req.user = decoded;
    req.token = token;

    next();
  } catch (error) {
    console.error('认证中间件错误:', error);
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: RESPONSE_MESSAGES.INVALID_TOKEN
    });
  }
};

module.exports = authMiddleware;
