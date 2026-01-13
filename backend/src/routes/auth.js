// backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// 验证中间件
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: '输入参数无效',
      errors: errors.array()
    });
  }
  next();
};

// 手机号验证（11位数字）
const isPhone = (value) => {
  if (!value) return false;
  return /^1[3-9]\d{9}$/.test(value);
};

// 公开路由
router.post('/register',
  [
    body('phone').custom(isPhone).withMessage('手机号格式不正确'),
    body('password').isLength({ min: 6 }).withMessage('密码至少6位'),
    body('code').optional().isLength({ min: 4, max: 6 }).withMessage('验证码格式不正确')
  ],
  validateRequest,
  authController.register
);

router.post('/login',
  [
    body('phone').custom(isPhone).withMessage('手机号格式不正确'),
    body('password').optional().isLength({ min: 6 }).withMessage('密码至少6位'),
    body('code').optional().isLength({ min: 4, max: 6 }).withMessage('验证码格式不正确')
  ],
  validateRequest,
  authController.login
);

router.post('/send-code',
  [
    body('phone').custom(isPhone).withMessage('手机号格式不正确')
  ],
  validateRequest,
  authController.sendCode
);

// 需要认证的路由
router.post('/logout',
  authMiddleware,
  authController.logout
);

router.get('/profile',
  authMiddleware,
  authController.getProfile
);

router.put('/profile',
  authMiddleware,
  [
    body('gender').optional().isIn(['male', 'female', 'other', 'unspecified']),
    body('birthday').optional().isDate()
  ],
  validateRequest,
  authController.updateProfile
);

router.get('/profile/complete',
  authMiddleware,
  authController.checkProfileComplete
);

// 重置密码（忘记密码）
router.post('/reset-password',
  [
    body('phone').custom(isPhone).withMessage('手机号格式不正确'),
    body('code').isLength({ min: 4, max: 6 }).withMessage('验证码格式不正确'),
    body('newPassword').isLength({ min: 6, max: 20 }).withMessage('密码长度为6-20位')
  ],
  validateRequest,
  authController.resetPassword
);

// 修改密码（需要登录）
router.post('/change-password',
  authMiddleware,
  [
    body('oldPassword').isLength({ min: 6, max: 20 }).withMessage('密码长度为6-20位'),
    body('newPassword').isLength({ min: 6, max: 20 }).withMessage('密码长度为6-20位')
  ],
  validateRequest,
  authController.changePassword
);

module.exports = router;
