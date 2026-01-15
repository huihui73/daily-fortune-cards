#!/bin/bash

# 每日推算卡 - 测试页面启动脚本

echo "🚀 正在启动每日推算卡测试页面..."
echo ""

# 检查 Python 版本
if command -v python3 &> /dev/null; then
    echo "✅ 检测到 Python 3"
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "✅ 检测到 Python 2"
    python -m SimpleHTTPServer 8000
else
    echo "❌ 未检测到 Python，请先安装 Python"
    echo ""
    echo "或者直接双击 test/test.html 文件在浏览器中打开"
    exit 1
fi