#!/bin/bash

echo "========================================"
echo "后端服务器测试脚本"
echo "========================================"
echo ""

API_BASE="http://localhost:3000/api"

# 测试1: 健康检查
echo "测试1: 健康检查"
curl -s http://localhost:3000/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:3000/health
echo ""
echo ""

# 测试2: 用户注册
echo "测试2: 用户注册"
echo "POST $API_BASE/auth/register"
echo ""
curl -s -X POST $API_BASE/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser001",
    "email": "testuser001@example.com",
    "phone": "13800138001",
    "password": "test123456"
  }' | python3 -m json.tool 2>/dev/null || echo "请求失败"
echo ""
echo ""

# 测试3: 用户登录（用户名）
echo "测试3: 用户登录（用户名）"
echo "POST $API_BASE/auth/login"
echo ""
curl -s -X POST $API_BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "testuser001",
    "password": "test123456"
  }' | python3 -m json.tool 2>/dev/null || echo "请求失败"
echo ""
echo ""

# 测试4: 用户登录（邮箱）
echo "测试4: 用户登录（邮箱）"
echo "POST $API_BASE/auth/login"
echo ""
curl -s -X POST $API_BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "testuser001@example.com",
    "password": "test123456"
  }' | python3 -m json.tool 2>/dev/null || echo "请求失败"
echo ""
echo ""

# 测试5: 用户登录（手机号）
echo "测试5: 用户登录（手机号）"
echo "POST $API_BASE/auth/login"
echo ""
curl -s -X POST $API_BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "13800138001",
    "password": "test123456"
  }' | python3 -m json.tool 2>/dev/null || echo "请求失败"
echo ""
echo ""

echo "========================================"
echo "测试完成！"
echo "========================================"
