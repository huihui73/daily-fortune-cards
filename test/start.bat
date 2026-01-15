@echo off
chcp 65001 >nul
echo 🚀 正在启动每日推算卡测试页面...
echo.

REM 检查 Python
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ 检测到 Python
    python -m http.server 8000
    goto :end
)

python3 --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ 检测到 Python 3
    python3 -m http.server 8000
    goto :end
)

echo ❌ 未检测到 Python，请先安装 Python
echo.
echo 或者直接双击 test\test.html 文件在浏览器中打开
pause
exit /b 1

:end