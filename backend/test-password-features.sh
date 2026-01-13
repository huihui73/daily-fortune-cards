#!/bin/bash

# 测试忘记密码和修改密码功能

API_BASE_URL="http://localhost:3000/api"

echo "=== 测试忘记密码和修改密码功能 ==="
echo ""

# 测试1：发送验证码
echo "1. 测试发送验证码..."
curl -s -X POST "${API_BASE_URL}/auth/send-code" \
  -H "Content-Type: application/json" \
  -d '{"phone": "13800138000"}' | python3 -m json.tool
echo ""
echo ""

# 测试2：重置密码（忘记密码）
echo "2. 测试重置密码..."
curl -s -X POST "${API_BASE_URL}/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13800138000",
    "code": "1234",
    "newPassword": "newpass123"
  }' | python3 -m json.tool
echo ""
echo ""

# 测试3：使用新密码登录获取token
echo "3. 使用新密码登录..."
RESPONSE=$(curl -s -X POST "${API_BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13800138000",
    "password": "newpass123"
  }')

echo "$RESPONSE" | python3 -m json.tool
TOKEN=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])")
echo ""
echo "Token: $TOKEN"
echo ""

# 测试4：修改密码（需要登录）
echo "4. 测试修改密码..."
curl -s -X POST "${API_BASE_URL}/auth/change-password" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "oldPassword": "newpass123",
    "newPassword": "anotherpass456"
  }' | python3 -m json.tool
echo ""
echo ""

# 测试5：使用修改后的密码登录
echo "5. 使用修改后的密码登录..."
curl -s -X POST "${API_BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13800138000",
    "password": "anotherpass456"
  }' | python3 -m json.tool
echo ""
echo ""

echo "=== 测试完成 ==="
