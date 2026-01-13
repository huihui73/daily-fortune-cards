// backend/src/controllers/cardsController.js

const fortune = require('../utils/fortuneEngine');

const getTodayCards = async (req, res) => {
  try {
    const { birthday, gender } = req.body;

    if (!birthday) {
      return res.status(400).json({
        success: false,
        message: '生日参数缺失'
      });
    }

    const today = new Date().toISOString().split('T')[0];
    const fortuneData = fortune.generateFortune(birthday, today);
    const cards = fortune.buildCards(fortuneData);

    res.json({
      success: true,
      data: {
        date: today,
        fortune: fortuneData,
        cards
      }
    });
  } catch (error) {
    console.error('生成卡片错误:', error);
    res.status(500).json({
      success: false,
      message: '生成卡片失败'
    });
  }
};

module.exports = {
  getTodayCards
};
