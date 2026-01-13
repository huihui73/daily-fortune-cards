-- backend/database/init.sql

-- 创建数据库
CREATE DATABASE IF NOT EXISTS daily_fortune CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE daily_fortune;

-- 微信用户表
CREATE TABLE IF NOT EXISTS wechat_users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openid VARCHAR(100) UNIQUE NOT NULL COMMENT '微信openid',
  phone VARCHAR(20) UNIQUE NOT NULL COMMENT '手机号',
  phone_masked VARCHAR(20) COMMENT '脱敏手机号',
  gender ENUM('male', 'female', 'other', 'unspecified') DEFAULT 'unspecified',
  birthday DATE COMMENT '生日',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  status TINYINT DEFAULT 0 COMMENT '状态：0=正常, 1=禁用',
  last_login_time TIMESTAMP NULL,
  device_info JSON COMMENT '设备信息',
  INDEX idx_phone (phone),
  INDEX idx_openid (openid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='微信用户表';

-- Web用户表
CREATE TABLE IF NOT EXISTS web_users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
  email VARCHAR(100) UNIQUE NOT NULL COMMENT '邮箱',
  password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
  phone VARCHAR(20) UNIQUE NOT NULL COMMENT '手机号',
  phone_masked VARCHAR(20) COMMENT '脱敏手机号',
  gender ENUM('male', 'female', 'other', 'unspecified') DEFAULT 'unspecified',
  birthday DATE COMMENT '生日',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  status TINYINT DEFAULT 0 COMMENT '状态：0=正常, 1=禁用',
  last_login_time TIMESTAMP NULL,
  email_verified BOOLEAN DEFAULT FALSE COMMENT '邮箱是否验证',
  device_info JSON COMMENT '设备信息',
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Web用户表';

-- 登录会话表
CREATE TABLE IF NOT EXISTS login_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_type ENUM('wechat', 'web') NOT NULL COMMENT '用户类型',
  user_id INT NOT NULL COMMENT '用户ID',
  token_hash VARCHAR(255) NOT NULL COMMENT 'Token哈希',
  device_info JSON COMMENT '设备信息',
  ip_address VARCHAR(45) COMMENT 'IP地址',
  user_agent TEXT COMMENT '用户代理',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL COMMENT '过期时间',
  is_active BOOLEAN DEFAULT TRUE COMMENT '是否活跃',
  INDEX idx_token (token_hash),
  INDEX idx_user (user_type, user_id),
  INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='登录会话表';

-- 登录日志表
CREATE TABLE IF NOT EXISTS login_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_type ENUM('wechat', 'web') NOT NULL COMMENT '用户类型',
  user_id INT NOT NULL COMMENT '用户ID',
  login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '登录时间',
  ip_address VARCHAR(45) COMMENT 'IP地址',
  user_agent TEXT COMMENT '用户代理',
  device_info JSON COMMENT '设备信息',
  login_result ENUM('success', 'failed') NOT NULL COMMENT '登录结果',
  failure_reason VARCHAR(255) COMMENT '失败原因',
  is_suspicious BOOLEAN DEFAULT FALSE COMMENT '是否可疑',
  INDEX idx_user (user_type, user_id),
  INDEX idx_time (login_time),
  INDEX idx_suspicious (is_suspicious)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='登录日志表';

-- 异常登录通知表
CREATE TABLE IF NOT EXISTS security_notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_type ENUM('wechat', 'web') NOT NULL COMMENT '用户类型',
  user_id INT NOT NULL COMMENT '用户ID',
  notification_type ENUM('new_device', 'suspicious_login', 'password_change') NOT NULL COMMENT '通知类型',
  notification_data JSON COMMENT '通知数据',
  is_read BOOLEAN DEFAULT FALSE COMMENT '是否已读',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_type, user_id),
  INDEX idx_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='异常登录通知表';
