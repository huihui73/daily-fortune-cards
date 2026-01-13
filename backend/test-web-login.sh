#!/bin/bash

echo "========================================"
echo "Web 端登录演示脚本"
echo "========================================"
echo ""

API_BASE="http://localhost:3000/api"

# 测试1: 健康检查
echo "测试1: 健康检查"
curl -s http://localhost:3000/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:3000/health
echo ""

# 测试2: 发送验证码
echo "测试2: 发送验证码 (手机号: 13800138888)"
echo ""
curl -s -X POST $API_BASE/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13800138888"
  }' | python3 -m json.tool 2>/dev/null || echo "请求失败"
echo ""
echo ""

# 测试3: 用户登录（自动注册）
echo "测试3: 用户登录/自动注册 (手机号: 13800138888, 密码: 123456)"
echo ""
curl -s -X POST $API_BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13800138888",
    "password": "123456"
  }' | python3 -m json.tool 2>/dev/null || echo "请求失败"
echo ""
echo ""

# 测试4: 获取用户信息（需要 Token）
echo "测试4: 获取用户信息"
echo ""
TOKEN=$(curl -s -X POST $API_BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138888","password":"123456"}' | python3 -c "import sys,json; data=json.load(sys.stdin); print(data.get('data', {}).get('token', ''))" 2>/dev/null)

if [ -n "$TOKEN" ]; then
  echo "使用 Token: ${TOKEN:0:50}..."
  echo ""
  
  curl -s -X GET $API_BASE/auth/profile \
    -H "Authorization: Bearer $TOKEN" | python3 -m json.tool 2>/dev/null || echo "请求失败"
fi

echo ""
echo "========================================"
echo "✅ 测试完成！"
echo "========================================"
echo ""
echo "🌐 访问方式："
echo "  登录页面: file:///Users/gonghuihui/daily-fortune-cards/web/login.html"
echo "  首页: file:///Users/gonghuihui/daily-fortune-cards/web/index.html"
echo ""
echo "📋 演示说明："
echo "  1. 输入手机号: 13800138888"
echo "  2. 点击\"发送验证码\"（演示模式，验证码自动显示）"
echo "  3. 输入验证码: 1234"
echo "  4. 点击\"下一步\""
echo "  5. 设置密码（任意6位以上）"
echo "  6. 点击\"登录/注册\"（自动注册新账号）"
echo "  7. 登录成功后跳转到首页"
echo ""
echo "💡 自动注册功能："
echo "  - 手机号不存在时自动注册"
echo "  - 手机号已存在时直接登录"
echo "  - 只需要手机号+密码"
echo ""
