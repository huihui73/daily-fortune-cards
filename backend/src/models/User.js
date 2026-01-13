// backend/src/models/User.js
const pool = require('../config/database');

class User {
  // 创建 Web 用户
  static async createWebUser(userData) {
    const { username, email, passwordHash, phone, phoneMasked, gender, birthday } = userData;

    const sql = `INSERT INTO web_users
      (username, email, password_hash, phone, phone_masked, gender, birthday)
      VALUES (?, ?, ?, ?, ?, ?, ?)`;

    try {
      const [result] = await pool.execute(sql, [
        username, email, passwordHash, phone, phoneMasked, gender, birthday
      ]);
      return result.insertId;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('USER_EXISTS');
      }
      throw error;
    }
  }

  // 通过用户名/邮箱/手机号查找用户
  static async findWebUser(identifier) {
    const sql = `SELECT * FROM web_users
      WHERE username = ? OR email = ? OR phone = ?
      AND status = 0
      LIMIT 1`;

    const [rows] = await pool.execute(sql, [identifier, identifier, identifier]);
    return rows[0] || null;
  }

  // 通过 ID 查找用户
  static async findWebUserById(id) {
    const sql = `SELECT * FROM web_users WHERE id = ? AND status = 0 LIMIT 1`;
    const [rows] = await pool.execute(sql, [id]);
    return rows[0] || null;
  }

  // 更新用户最后登录时间
  static async updateLastLogin(userId, userType) {
    const tableName = userType === 'wechat' ? 'wechat_users' : 'web_users';
    const sql = `UPDATE ${tableName} SET last_login_time = NOW() WHERE id = ?`;
    await pool.execute(sql, [userId]);
  }

  // 创建登录会话
  static async createLoginSession(sessionData) {
    const { userType, userId, tokenHash, deviceInfo, ipAddress, userAgent } = sessionData;

    const sql = `INSERT INTO login_sessions
      (user_type, user_id, token_hash, device_info, ip_address, user_agent, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))`;

    try {
      const [result] = await pool.execute(sql, [
        userType, userId, tokenHash, JSON.stringify(deviceInfo), ipAddress, userAgent
      ]);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // 验证登录会话
  static async validateSession(tokenHash, userId) {
    const sql = `SELECT * FROM login_sessions
      WHERE token_hash = ? AND user_id = ? AND expires_at > NOW() AND is_active = TRUE
      LIMIT 1`;

    const [rows] = await pool.execute(sql, [tokenHash, userId]);
    return rows[0] || null;
  }

  // 记录登录日志
  static async createLoginLog(logData) {
    const { userType, userId, ipAddress, userAgent, deviceInfo, loginResult, failureReason, isSuspicious } = logData;

    const sql = `INSERT INTO login_logs
      (user_type, user_id, ip_address, user_agent, device_info, login_result, failure_reason, is_suspicious)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    await pool.execute(sql, [
      userType, userId, ipAddress, userAgent, JSON.stringify(deviceInfo), loginResult, failureReason, isSuspicious || false
    ]);
  }

  // 创建安全通知
  static async createSecurityNotification(notificationData) {
    const { userType, userId, notificationType, notificationData: data } = notificationData;

    const sql = `INSERT INTO security_notifications
      (user_type, user_id, notification_type, notification_data)
      VALUES (?, ?, ?, ?)`;

    await pool.execute(sql, [userType, userId, notificationType, JSON.stringify(data)]);
  }

  // 获取未读通知
  static async getUnreadNotifications(userType, userId) {
    const sql = `SELECT * FROM security_notifications
      WHERE user_type = ? AND user_id = ? AND is_read = FALSE
      ORDER BY created_at DESC
      LIMIT 10`;

    const [rows] = await pool.execute(sql, [userType, userId]);
    return rows;
  }

  // 标记通知为已读
  static async markNotificationAsRead(notificationId, userType, userId) {
    const sql = `UPDATE security_notifications
      SET is_read = TRUE
      WHERE id = ? AND user_type = ? AND user_id = ?`;

    await pool.execute(sql, [notificationId, userType, userId]);
  }
}

module.exports = User;
