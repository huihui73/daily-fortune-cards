// cloudfunctions/login/index.js
const cloud = require('wx-server-sdk');
const rp = require('request-promise-native');

cloud.init();

const APPID = process.env.APPID;
const APPSECRET = process.env.APPSECRET;

exports.main = async (event, context) => {
  const { code } = event;

  if (!code) {
    return {
      errcode: 40001,
      errmsg: 'code is required'
    };
  }

  if (!APPID || !APPSECRET) {
    return {
      errcode: 40002,
      errmsg: 'APPID or APPSECRET not configured'
    };
  }

  try {
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${APPID}&secret=${APPSECRET}&js_code=${code}&grant_type=authorization_code`;

    const resp = await rp({
      uri: url,
      json: true,
      timeout: 10000
    });

    if (resp.errcode) {
      return {
        errcode: resp.errcode,
        errmsg: resp.errmsg
      };
    }

    // resp: { openid, session_key, unionid, errcode, errmsg }
    return {
      openid: resp.openid,
      session_key: resp.session_key,
      unionid: resp.unionid
    };
  } catch (error) {
    console.error('login error:', error);
    return {
      errcode: 500,
      errmsg: 'Internal server error'
    };
  }
};
