@echo off
echo ========================================
echo    BFF + SSR 测试环境启动脚本
echo ========================================
echo.

echo 正在启动 MOCK 服务...
start "MOCK Service" cmd /k "cd /d %~dp0..\MOCK && npm run dev"

echo 等待 MOCK 服务启动...
timeout /t 3 /nobreak > nul

echo 正在启动 Next.js 应用...
start "Next.js App" cmd /k "cd /d %~dp0 && npm run dev"

echo 等待 Next.js 应用启动...
timeout /t 5 /nobreak > nul

echo.
echo ========================================
echo    服务启动完成！
echo ========================================
echo MOCK 服务: http://localhost:3001
echo Next.js 应用: http://localhost:3000
echo.
echo 📋 页面访问地址:
echo.
echo 🔗 原版答题页: http://localhost:3000/question/test123
echo 🚀 BFF+SSR 答题页: http://localhost:3000/bff-question/test123
echo.
echo 📊 性能测试页面:
echo 🔗 原版性能页: http://localhost:3000/performance
echo 🚀 BFF 性能测试: http://localhost:3000/bff-performance-test
echo.
echo 💡 说明: BFF 页面不会覆盖您的原有页面，可以同时使用
echo ========================================
echo.
echo 按任意键退出...
pause > nul