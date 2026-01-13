#!/bin/bash

echo "========================================"
echo "后端服务器测试脚本（演示模式）"
echo "========================================"
echo ""

API_BASE="http://localhost:3000/api"

# 测试1: 健康检查
echo "测试1: 健康检查"
echo "GET http://localhost:3000/health"
echo ""
curl -s http://localhost:3000/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:3000/health
echo ""
echo ""

# 测试2: 用户注册
echo "测试2: 用户注册"
echo "POST $API_BASE/auth/register"
echo ""
REGISTER_RESULT=$(curl -s -X POST $API_BASE/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "demo_user",
    "email": "demo@example.com",
    "phone": "13800138999",
    "password": "demo123456"
  }')

echo "$REGISTER_RESULT" | python3 -m json.tool 2>/dev/null || echo "$REGISTER_RESULT"
echo ""
echo ""

# 提取 Token
TOKEN=$(echo "$REGISTER_RESULT" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('token', ''))" 2>/dev/null)

if [ -n "$TOKEN" ]; then
  echo "获得 Token: ${TOKEN:0:50}..."
  echo ""
  echo ""

  # 测试3: 使用 Token 获取用户信息
  echo "测试3: 使用 Token 获取用户信息"
  echo "GET $API_BASE/auth/profile"
  echo ""
  PROFILE_RESULT=$(curl -s -X GET $API_BASE/auth/profile \
    -H "Authorization: Bearer $TOKEN")

  echo "$PROFILE_RESULT" | python3 -m json.tool 2>/dev/null || echo "$PROFILE_RESULT"
  echo ""
  echo ""

  # 测试4: 用户登录
  echo "测试4: 用户登录（新用户）"
  echo "POST $API_BASE/auth/login"
  echo ""
  LOGIN_RESULT=$(curl -s -X POST $API_BASE/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "identifier": "newuser",
      "password": "demo123456"
    }')

  echo "$LOGIN_RESULT" | python3 -m json.tool 2>/dev/null || echo "$LOGIN_RESULT"
  echo ""
  echo ""

  # 提取新 Token
  NEW_TOKEN=$(echo "$LOGIN_RESULT" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('token', ''))" 2>/dev/null)

  if [ -n "$NEW_TOKEN" ]; then
    echo "获得新 Token: ${NEW_TOKEN:0:50}..."

    echo ""
    echo "========================================"
    echo "✅ 所有测试完成！"
    echo "========================================"
    echo ""
    echo "Web 登录页面已打开"
    echo "后端服务器运行在: http://localhost:3000"
    echo ""
    echo "可以在浏览器中访问登录页面进行测试"
    echo ""
  fi
else
  echo "❌ 未能获取 Token，注册失败"
fi

echo "========================================"
