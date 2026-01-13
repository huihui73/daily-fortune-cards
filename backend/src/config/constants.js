// backend/src/config/constants.js

const USER_TYPES = {
  WECHAT: 'wechat',
  WEB: 'web'
};

const USER_STATUS = {
  NORMAL: 0,
  DISABLED: 1
};

const LOGIN_RESULT = {
  SUCCESS: 'success',
  FAILED: 'failed'
};

const NOTIFICATION_TYPES = {
  NEW_DEVICE: 'new_device',
  SUSPICIOUS_LOGIN: 'suspicious_login',
  PASSWORD_CHANGE: 'password_change'
};

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

const RESPONSE_MESSAGES = {
  SUCCESS: '操作成功',
  UNAUTHORIZED: '未授权',
  FORBIDDEN: '禁止访问',
  NOT_FOUND: '资源不存在',
  INVALID_CREDENTIALS: '账号或密码错误',
  USER_EXISTS: '用户已存在',
  USER_NOT_FOUND: '用户不存在',
  INVALID_TOKEN: 'Token 无效或已过期',
  INVALID_INPUT: '输入参数无效',
  INTERNAL_ERROR: '服务器内部错误',
  PHONE_EXISTS: '手机号已被注册',
  EMAIL_EXISTS: '邮箱已被注册'
};

module.exports = {
  USER_TYPES,
  USER_STATUS,
  LOGIN_RESULT,
  NOTIFICATION_TYPES,
  HTTP_STATUS,
  RESPONSE_MESSAGES
};
