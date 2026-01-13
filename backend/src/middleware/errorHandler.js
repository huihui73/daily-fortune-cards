// backend/src/middleware/errorHandler.js
const { HTTP_STATUS, RESPONSE_MESSAGES } = require('../config/constants');

const errorHandler = (err, req, res, next) => {
  console.error('错误:', err);

  // 默认错误状态
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || RESPONSE_MESSAGES.INTERNAL_ERROR;

  // 处理特定错误类型
  if (err.name === 'ValidationError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = RESPONSE_MESSAGES.INVALID_INPUT;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = RESPONSE_MESSAGES.INVALID_TOKEN;
  } else if (err.code === 'USER_EXISTS') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = RESPONSE_MESSAGES.USER_EXISTS;
  } else if (err.code === 'PHONE_EXISTS') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = RESPONSE_MESSAGES.PHONE_EXISTS;
  } else if (err.code === 'EMAIL_EXISTS') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = RESPONSE_MESSAGES.EMAIL_EXISTS;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
