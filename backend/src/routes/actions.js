// backend/src/routes/actions.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const actionsController = require('../controllers/actionsController');
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

// 记录用户行为
router.post('/track',
  authMiddleware,
  [
    body('actionType').isIn(['view', 'expand', 'collapse', 'favorite', 'complete_task']),
    body('cardType').isIn(['hexagram', 'lifepath', 'elements', 'lucky', 'clothing', 'diet', 'task', 'journal']),
    body('cardId').notEmpty().withMessage('卡片ID不能为空'),
    body('sessionId').notEmpty().withMessage('会话ID不能为空'),
    body('duration').optional().isInt().withMessage('时长必须是整数')
  ],
  validateRequest,
  actionsController.trackAction
);

// 获取用户行为统计
router.get('/stats',
  authMiddleware,
  actionsController.getStats
);

// 更新用户偏好
router.put('/preferences',
  authMiddleware,
  actionsController.updatePreferences
);

// 获取用户偏好
router.get('/preferences',
  authMiddleware,
  actionsController.getPreferences
);

// 反馈卡片内容
router.post('/feedback',
  authMiddleware,
  [
    body('cardType').isIn(['hexagram', 'lifepath', 'elements', 'lucky', 'clothing', 'diet', 'task', 'journal']),
    body('cardId').notEmpty(),
    body('feedbackType').optional().isIn(['neutral']),
    body('comment').optional().isString(),
    body('rating').optional().isInt({ min: 1, max: 5 })
  ],
  validateRequest,
  actionsController.feedback
);

// 获取个性化卡片推荐
router.post('/personalized-cards',
  authMiddleware,
  actionsController.getPersonalizedCards
);

module.exports = router;
