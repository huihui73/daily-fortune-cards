#!/bin/bash

# 完整测试忘记密码和修改密码功能

API_BASE_URL="http://localhost:3000/api"

echo "=== 完整测试忘记密码和修改密码功能 ==="
echo ""

# 测试1：先注册一个用户
echo "1. 注册用户..."
curl -s -X POST "${API_BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13800138999",
    "password": "original123"
  }' | python3 -m json.tool
echo ""
echo ""

# 测试2：使用原密码登录获取token
echo "2. 使用原密码登录..."
RESPONSE=$(curl -s -X POST "${API_BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13800138999",
    "password": "original123"
  }')

echo "$RESPONSE" | python3 -m json.tool
ORIGINAL_TOKEN=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])")
echo ""
echo "Token: $ORIGINAL_TOKEN"
echo ""

# 测试3：发送验证码（忘记密码流程）
echo "3. 发送验证码（忘记密码流程）..."
curl -s -X POST "${API_BASE_URL}/auth/send-code" \
  -H "Content-Type: application/json" \
  -d '{"phone": "13800138999"}' | python3 -m json.tool
echo ""
echo ""

# 测试4：重置密码（忘记密码）
echo "4. 重置密码（忘记密码）..."
curl -s -X POST "${API_BASE_URL}/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13800138999",
    "code": "1234",
    "newPassword": "resetpass123"
  }' | python3 -m json.tool
echo ""
echo ""

# 测试5：使用重置后的密码登录
echo "5. 使用重置后的密码登录..."
curl -s -X POST "${API_BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13800138999",
    "password": "resetpass123"
  }' | python3 -m json.tool
echo ""
echo ""

# 测试6：再次登录获取token用于测试修改密码
echo "6. 使用重置后的密码登录获取token..."
RESPONSE=$(curl -s -X POST "${API_BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13800138999",
    "password": "resetpass123"
  }')

echo "$RESPONSE" | python3 -m json.tool
RESET_TOKEN=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])")
echo ""
echo "Token: $RESET_TOKEN"
echo ""

# 测试7：修改密码（需要登录）
echo "7. 修改密码（需要登录）..."
curl -s -X POST "${API_BASE_URL}/auth/change-password" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${RESET_TOKEN}" \
  -d '{
    "oldPassword": "resetpass123",
    "newPassword": "finalpass456"
  }' | python3 -m json.tool
echo ""
echo ""

# 测试8：使用修改后的密码登录
echo "8. 使用修改后的密码登录..."
curl -s -X POST "${API_BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13800138999",
    "password": "finalpass456"
  }' | python3 -m json.tool
echo ""
echo ""

# 测试9：尝试用旧密码登录（应该失败）
echo "9. 尝试用旧密码登录（应该失败）..."
curl -s -X POST "${API_BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13800138999",
    "password": "resetpass123"
  }' | python3 -m json.tool
echo ""
echo ""

# 测试10：测试错误场景 - 修改密码时旧密码错误
echo "10. 测试错误场景 - 修改密码时旧密码错误..."
curl -s -X POST "${API_BASE_URL}/auth/change-password" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${RESET_TOKEN}" \
  -d '{
    "oldPassword": "wrongpassword",
    "newPassword": "newpass789"
  }' | python3 -m json.tool
echo ""
echo ""

# 测试11：测试错误场景 - 重置密码时验证码错误
echo "11. 测试错误场景 - 重置密码时验证码错误..."
curl -s -X POST "${API_BASE_URL}/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13800138999",
    "code": "9999",
    "newPassword": "newpass789"
  }' | python3 -m json.tool
echo ""
echo ""

# 测试12：测试错误场景 - 重置未注册用户的密码
echo "12. 测试错误场景 - 重置未注册用户的密码..."
curl -s -X POST "${API_BASE_URL}/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13999999999",
    "code": "1234",
    "newPassword": "newpass789"
  }' | python3 -m json.tool
echo ""
echo ""

echo "=== 测试完成 ==="
