#!/bin/bash

# 测试新的页签式登录功能

API_BASE_URL="http://localhost:3000/api"

echo "=== 测试页签式登录功能 ==="
echo ""

# 测试1：发送验证码
echo "1. 测试发送验证码..."
curl -s -X POST "${API_BASE_URL}/auth/send-code" \
  -H "Content-Type: application/json" \
  -d '{"phone": "13900139000"}' | python3 -m json.tool
echo ""
echo ""

# 测试2：新用户使用验证码登录（应该失败）
echo "2. 新用户使用验证码登录（应该失败，提示设置密码）..."
curl -s -X POST "${API_BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13900139000",
    "code": "1234"
  }' | python3 -m json.tool
echo ""
echo ""

# 测试3：新用户使用密码登录（首次注册）
echo "3. 新用户使用密码登录（首次注册）..."
curl -s -X POST "${API_BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13900139000",
    "password": "testpass123"
  }' | python3 -m json.tool
echo ""
echo ""

# 测试4：已注册用户使用密码登录
echo "4. 已注册用户使用密码登录..."
RESPONSE=$(curl -s -X POST "${API_BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13900139000",
    "password": "testpass123"
  }')

echo "$RESPONSE" | python3 -m json.tool
TOKEN=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])")
echo ""
echo "Token: $TOKEN"
echo ""

# 测试5：已注册用户使用验证码登录
echo "5. 已注册用户使用验证码登录..."
curl -s -X POST "${API_BASE_URL}/auth/send-code" \
  -H "Content-Type: application/json" \
  -d '{"phone": "13900139000"}' | python3 -m json.tool
echo ""

curl -s -X POST "${API_BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13900139000",
    "code": "1234"
  }' | python3 -m json.tool
echo ""
echo ""

# 测试6：使用错误的密码登录
echo "6. 使用错误的密码登录（应该失败）..."
curl -s -X POST "${API_BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13900139000",
    "password": "wrongpass"
  }' | python3 -m json.tool
echo ""
echo ""

# 测试7：使用错误的验证码登录
echo "7. 使用错误的验证码登录（应该失败）..."
curl -s -X POST "${API_BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13900139000",
    "code": "9999"
  }' | python3 -m json.tool
echo ""
echo ""

echo "=== 测试完成 ==="
echo ""
echo "📱 现在可以访问以下地址测试新的登录页面："
echo "http://localhost:3000/login.html"
echo ""
echo "✨ 新功能："
echo "  - 页签式登录（密码登录 / 验证码登录）"
echo "  - 默认选中密码登录"
echo "  - 首次登录必须使用密码登录"
echo "  - 新用户验证码登录会自动切换到密码登录"
echo "  - 两个页签的手机号输入同步"
echo "  - 验证码发送后60秒倒计时"
echo "  - Toast 提示替代 alert"
