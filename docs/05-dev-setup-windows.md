# Windows 开发环境搭建

## 前置条件
- Node.js：建议 `>=18`
- npm：建议 `>=9`
- PowerShell：`5.1` 或 `7+`

## 一次性安装依赖
在仓库根目录执行：

```powershell
npm --prefix apps/mock install
npm --prefix apps/low_code install
npm --prefix apps/low_code_c install
```

## 分别启动服务
```powershell
npm --prefix apps/mock run dev
npm --prefix apps/low_code start
npm --prefix apps/low_code_c run dev
```

## 最小验证步骤
1. 打开 `http://localhost:3000`（Next 消费端）。
2. 打开 `http://localhost:3001`（Mock 服务，确认进程正常）。
3. 在页面触发一次数据加载，确认接口返回 200。

## 常见问题排查
- 端口占用：`netstat -ano | findstr :3000`（或 `:3001`）。
- 安装失败：删除 `node_modules` 与锁文件后重装。
- 脚本无法执行：使用 `powershell -ExecutionPolicy Bypass -File ...` 临时执行。
