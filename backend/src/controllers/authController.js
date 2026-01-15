// backend/src/controllers/authController.js
const User = require('../models/User');
const db = require('../database/connection');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateToken, verifyToken } = require('../config/jwt');
const { USER_TYPES, USER_STATUS, RESPONSE_MESSAGES, HTTP_STATUS } = require('../config/constants');

class AuthController {
  // 用户注册/自动注册（手机号+密码）
  async register(req, res) {
    try {
      const { phone, password, code } = req.body;

      if (!phone || !password) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: '请填写手机号和密码'
        });
      }

      // 演示模式：手机号作为用户名
      const username = phone;
      const phoneMasked = phone.substr(0, 3) + '****' + phone.substr(7);

      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const userId = DEMO_USERS.size + 1;

      // 存储用户
      DEMO_USERS.set(username, {
        id: userId,
        username,
        phone,
        phoneMasked,
        passwordHash,
        createdAt: new Date().toISOString()
      });

      const token = generateToken({
        userId,
        username,
        userType: USER_TYPES.WEB
      });

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: RESPONSE_MESSAGES.SUCCESS,
        data: {
          userId,
          username,
          phoneMasked,
          token,
          autoRegistered: true
        }
      });
    } catch (error) {
      console.error('注册失败:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: RESPONSE_MESSAGES.INTERNAL_ERROR
      });
    }
  }

  // 用户登录（支持验证码登录和密码登录）
  async login(req, res) {
    try {
      const { phone, password, code } = req.body;

      if (!phone) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: '请填写手机号'
        });
      }

      // 查找用户（从数据库）
      const existingUser = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);

      // 如果用户不存在，需要密码注册
      if (!existingUser) {
        if (!password || password.length < 6) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: '新用户请设置密码（至少6位）'
          });
        }

        console.log('用户不存在，自动注册:', phone);

        const passwordHash = await bcrypt.hash(password, 10);
        const phoneMasked = phone.substr(0, 3) + '****' + phone.substr(7);

        const insertStmt = db.prepare(`
          INSERT INTO users (phone, password, nickname, phoneMasked, first_login)
          VALUES (?, ?, ?, ?, 1)
        `);

        const result = insertStmt.run(phone, passwordHash, phone, phoneMasked);

        const userId = result.lastInsertRowid;

        const token = generateToken({
          userId,
          username: phone,
          userType: USER_TYPES.WEB
        });

        return res.status(HTTP_STATUS.OK).json({
          success: true,
          message: '注册成功',
          data: {
            userId,
            username: phone,
            phoneMasked,
            token,
            autoRegistered: true
          }
        });
      }

      // 用户存在，支持两种登录方式
      let loginMethod = '';

      // 验证码登录（演示模式验证码：1234）
      if (code) {
        if (code !== '1234') {
          return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: '验证码错误'
          });
        }
        loginMethod = '验证码';
      }
      // 密码登录
      else if (password) {
        const isValidPassword = await bcrypt.compare(password, existingUser.password);

        if (!isValidPassword) {
          return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: '密码错误'
          });
        }
        loginMethod = '密码';
      } else {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: '请输入验证码或密码'
        });
      }

      const token = generateToken({
        userId: existingUser.id,
        username: existingUser.phone,
        userType: USER_TYPES.WEB
      });

      console.log(`用户登录成功 - 手机号: ${phone}, 方式: ${loginMethod}`);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: RESPONSE_MESSAGES.SUCCESS,
        data: {
          userId: existingUser.id,
          username: existingUser.phone,
          phoneMasked: existingUser.phoneMasked,
          token,
          autoRegistered: false
        }
      });
    } catch (error) {
      console.error('登录失败:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: RESPONSE_MESSAGES.INTERNAL_ERROR
      });
    }
  }

  // 验证码获取（演示模式）
  async sendCode(req, res) {
    try {
      const { phone } = req.body;

      if (!phone) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: '请填写手机号'
        });
      }

      // 检查用户是否已注册
      const existingUser = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
      const isRegistered = !!existingUser;

      // 演示模式：验证码为 1234
      const code = '1234';

      console.log('发送验证码到手机:', phone, '验证码:', code, '已注册:', isRegistered);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: '验证码已发送',
        data: {
          phone,
          demoCode: code, // 演示模式返回验证码
          isRegistered // 返回用户是否已注册
        }
      });
    } catch (error) {
      console.error('发送验证码失败:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: RESPONSE_MESSAGES.INTERNAL_ERROR
      });
    }
  }

  // 登出
  async logout(req, res) {
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: RESPONSE_MESSAGES.SUCCESS
    });
  }

  // 获取用户信息
  async getProfile(req, res) {
    const { userId } = req.user;

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: RESPONSE_MESSAGES.USER_NOT_FOUND
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        userId: user.id,
        username: user.phone,
        phoneMasked: user.phoneMasked,
        phone: user.phone,
        gender: user.gender,
        birthday: user.birthday,
        createdAt: user.created_at
      }
    });
  }

  // 更新用户信息
  async updateProfile(req, res) {
    try {
      const { userId } = req.user;
      const { gender, birthday } = req.body;

      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
      if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: RESPONSE_MESSAGES.USER_NOT_FOUND
        });
      }

      const updates = [];
      const params = [];

      if (gender) {
        updates.push('gender = ?');
        params.push(gender);
      }
      if (birthday) {
        updates.push('birthday = ?');
        params.push(birthday);
      }

      if (updates.length > 0) {
        updates.push('first_login = 0');
        params.push(userId);

        const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
        db.prepare(sql).run(...params);
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: RESPONSE_MESSAGES.SUCCESS
      });
    } catch (error) {
      console.error('更新用户信息失败:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: RESPONSE_MESSAGES.INTERNAL_ERROR
      });
    }
  }

  hashToken(token) {
    return require('crypto').createHash('sha256').update(token).digest('hex');
  }

  async detectSuspiciousLogin(user, req) {
    return false;
  }

  // 检查用户资料完整性
  async checkProfileComplete(req, res) {
    const { userId } = req.user;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    const isComplete = !!(user.birthday && user.gender);

    res.status(200).json({
      success: true,
      data: {
        isComplete,
        hasBirthday: !!user.birthday,
        hasGender: !!user.gender,
        user: {
          userId: user.id,
          username: user.phone,
          phoneMasked: user.phoneMasked,
          gender: user.gender,
          birthday: user.birthday
        }
      }
    });
  }

  // 重置密码（忘记密码）
  async resetPassword(req, res) {
    try {
      const { phone, code, newPassword } = req.body;

      if (!phone || !code || !newPassword) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: '请填写完整信息'
        });
      }

      // 验证验证码（演示模式验证码为 1234）
      if (code !== '1234') {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: '验证码错误'
        });
      }

      // 查找用户
      const user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);

      if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: '该手机号未注册'
        });
      }

      // 更新密码
      const passwordHash = await bcrypt.hash(newPassword, 10);

      db.prepare('UPDATE users SET password = ? WHERE phone = ?').run(passwordHash, phone);

      console.log('用户密码重置成功 - 手机号:', phone);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: '密码重置成功'
      });
    } catch (error) {
      console.error('重置密码失败:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: RESPONSE_MESSAGES.INTERNAL_ERROR
      });
    }
  }

  // 修改密码（需要登录）
  async changePassword(req, res) {
    try {
      const { userId } = req.user;
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: '请填写完整信息'
        });
      }

      // 查找用户
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

      if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: RESPONSE_MESSAGES.USER_NOT_FOUND
        });
      }

      // 验证旧密码
      const isValidPassword = await bcrypt.compare(oldPassword, user.password);

      if (!isValidPassword) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: '当前密码错误'
        });
      }

      // 检查新密码是否与旧密码相同
      if (oldPassword === newPassword) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: '新密码不能与当前密码相同'
        });
      }

      // 更新密码
      const passwordHash = await bcrypt.hash(newPassword, 10);

      db.prepare('UPDATE users SET password = ? WHERE id = ?').run(passwordHash, userId);

      console.log('用户密码修改成功 - 用户ID:', userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: '密码修改成功'
      });
    } catch (error) {
      console.error('修改密码失败:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: RESPONSE_MESSAGES.INTERNAL_ERROR
      });
    }
  }
}

module.exports = new AuthController();
