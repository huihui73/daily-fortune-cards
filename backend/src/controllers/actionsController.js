// backend/src/controllers/actionsController.js
const db = require('../db');

class ActionsController {
  // 记录用户行为
  async trackAction(req, res) {
    try {
      const { userId } = req.user;
      const { actionType, cardType, cardId, sessionId, duration = 0, metadata = {} } = req.body;

      console.log('=== 记录用户行为 ===');
      console.log('userId:', userId);
      console.log('actionType:', actionType);
      console.log('cardType:', cardType);
      console.log('cardId:', cardId);
      console.log('duration:', duration);

      // 简化版本：直接返回成功
      res.status(200).json({
        success: true,
        message: '行为记录成功'
      });
    } catch (error) {
      console.error('记录用户行为错误:', error);
      res.status(500).json({
        success: false,
        message: '记录失败'
      });
    }
  }

  // 获取用户行为统计
  async getStats(req, res) {
    try {
      const { userId } = req.user;
      const { days = 7 } = req.query;

      res.status(200).json({
        success: true,
        data: {
          actionDistribution: {},
          topCardTypes: [],
          period: `${days}天`
        }
      });
    } catch (error) {
      console.error('获取行为统计错误:', error);
      res.status(500).json({
        success: false,
        message: '获取失败'
      });
    }
  }

  // 更新用户偏好
  async updatePreferences(req, res) {
    try {
      const { userId } = req.user;
      const { cardTypeWeights, contentStyle, interests, dislikedCardTypes } = req.body;

      console.log('=== 更新用户偏好 ===');
      console.log('userId:', userId);
      console.log('cardTypeWeights:', cardTypeWeights);

      // 简化版本：直接返回成功
      res.status(200).json({
        success: true,
        message: '偏好更新成功'
      });
    } catch (error) {
      console.error('更新用户偏好错误:', error);
      res.status(500).json({
        success: false,
        message: '更新失败'
      });
    }
  }

  // 获取用户偏好
  async getPreferences(req, res) {
    try {
      const { userId } = req.user;

      // 简化版本：返回默认偏好
      res.status(200).json({
        success: true,
        data: {
          cardTypeWeights: {
            hexagram: 1.0,
            lifepath: 1.0,
            elements: 1.0,
            lucky: 1.0,
            clothing: 1.5,
            diet: 1.0,
            task: 1.2,
            journal: 1.0
          },
          contentStyle: 'balanced',
          interests: [],
          dislikedCardTypes: [],
          feedbackStats: {
            likeCount: 0,
            dislikeCount: 0
          }
        }
      });
    } catch (error) {
      console.error('获取用户偏好错误:', error);
      res.status(500).json({
        success: false,
        message: '获取失败'
      });
    }
  }

  async getPersonalizedCards(req, res) {
    try {
      const { userId } = req.user;
      const { birthday, gender } = req.body || {};

      console.log('=== 获取个性化卡片 ===');
      console.log('userId:', userId);
      console.log('birthday:', birthday);
      console.log('gender:', gender);

      const fortune = require('../utils/fortuneEngine');
      const fortuneResult = fortune.generateFortune(birthday);
      const cards = fortune.buildCards(fortuneResult);

      res.status(200).json({
        success: true,
        data: {
          cards
        }
      });
    } catch (error) {
      console.error('获取个性化卡片错误:', error);
      res.status(500).json({
        success: false,
        message: '获取失败'
      });
    }
  }

  // 反馈卡片内容
  async feedback(req, res) {
    try {
      const { userId } = req.user;
      const { cardType, cardId, feedbackType, comment, rating } = req.body;

      console.log('=== 反馈卡片内容 ===');
      console.log('userId:', userId);
      console.log('cardType:', cardType);
      console.log('cardId:', cardId);
      console.log('feedbackType:', feedbackType);

      res.status(200).json({
        success: true,
        message: '反馈成功'
      });
    } catch (error) {
      console.error('反馈错误:', error);
      res.status(500).json({
        success: false,
        message: '反馈失败'
      });
    }
  }
}

module.exports = new ActionsController();
