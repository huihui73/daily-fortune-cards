#!/bin/bash

echo "=== 后端功能测试 ==="
echo ""

API_BASE_URL="http://localhost:3000/api"

# 测试1：健康检查
echo "1. 测试健康检查..."
curl -s http://localhost:3001/health | python3 -m json.tool
echo ""

# 测试2：登录获取 Token
echo "2. 测试登录..."
curl -s -X POST "${API_BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13800138000",
    "password": "testpass123"
  }' | python3 -m json.tool
echo ""

echo ""
echo "如果上面显示错误，说明后端服务器有问题。"
