@echo off
echo ========================================
echo    BFF 层测试环境启动脚本
echo ========================================
echo.

echo 正在检查 Node.js 环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)

echo ✅ Node.js 环境正常
echo.

echo 正在安装依赖...
call npm install
if errorlevel 1 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

echo ✅ 依赖安装完成
echo.

echo 正在启动开发服务器...
echo 服务器将在 http://localhost:3000 启动
echo.
echo 测试页面:
echo - 答题页: http://localhost:3000/question/1
echo.
echo 按 Ctrl+C 停止服务器
echo.

call npm run dev
