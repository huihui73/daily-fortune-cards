// cloudfunctions/decryptPhone/index.js
const cloud = require('wx-server-sdk');
const crypto = require('crypto');

cloud.init();

function decryptData(encryptedData, sessionKey, iv, appId) {
  try {
    const sessionKeyBuf = Buffer.from(sessionKey, 'base64');
    const encryptedDataBuf = Buffer.from(encryptedData, 'base64');
    const ivBuf = Buffer.from(iv, 'base64');

    const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKeyBuf, ivBuf);
    decipher.setAutoPadding(true);

    let decoded = decipher.update(encryptedDataBuf, 'binary', 'utf8');
    decoded += decipher.final('utf8');

    const data = JSON.parse(decoded);

    if (data.watermark && data.watermark.appid !== appId) {
      throw new Error('Invalid AppID in watermark');
    }

    return data;
  } catch (error) {
    console.error('decrypt error:', error);
    throw new Error('Decryption failed');
  }
}

exports.main = async (event, context) => {
  const { sessionKey, encryptedData, iv, appId } = event;

  if (!sessionKey || !encryptedData || !iv || !appId) {
    return {
      errcode: 1001,
      errmsg: 'Missing required parameters'
    };
  }

  try {
    const data = decryptData(encryptedData, sessionKey, iv, appId);

    const phoneNumber = data.purePhoneNumber || data.phoneNumber;

    if (!phoneNumber) {
      return {
        errcode: 1002,
        errmsg: 'Phone number not found in decrypted data'
      };
    }

    return {
      phoneNumber,
      countryCode: data.countryCode,
      purePhoneNumber: data.purePhoneNumber
    };
  } catch (error) {
    console.error('decryptPhone error:', error);
    return {
      errcode: 1003,
      errmsg: error.message || 'Decryption failed'
    };
  }
};
