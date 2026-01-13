// cloudfunctions/getUserData/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { openid, date } = event;

  if (!openid) {
    return {
      errcode: 1001,
      errmsg: 'openid is required'
    };
  }

  try {
    const today = date || new Date().toISOString().split('T')[0];

    // Get user info
    const userRes = await db.collection('users')
      .where({ _openid: openid })
      .get();

    const user = userRes.data[0];

    // Get today's fortune
    const fortuneRes = await db.collection('fortunes')
      .where({
        _openid: openid,
        date: today
      })
      .get();

    const fortune = fortuneRes.data[0];

    // Get recent history (last 7 days)
    const historyRes = await db.collection('fortunes')
      .where({
        _openid: openid
      })
      .orderBy('date', 'desc')
      .limit(7)
      .get();

    return {
      user: user,
      fortune: fortune,
      history: historyRes.data
    };
  } catch (error) {
    console.error('getUserData error:', error);
    return {
      errcode: 500,
      errmsg: error.message || 'Internal server error'
    };
  }
};
