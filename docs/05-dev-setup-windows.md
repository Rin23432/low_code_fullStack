# Windows 开发环境搭建

## 前置条件
- Node.js：建议 `>=18`
- npm：建议 `>=9`
- PowerShell：`5.1` 或 `7+`
- Git：建议 `>=2.40`
- Java：TODO: confirm（当前仓库未发现 Spring 启动脚本）

## One-command dev（best available）
```powershell
powershell -ExecutionPolicy Bypass -File scripts/dev.ps1
```
说明：当前脚本为占位版，只打印将启动的服务与命令。

## 手动启动（精确命令）
```powershell
npm --prefix apps/mock run dev
npm --prefix apps/low_code start
npm --prefix apps/low_code_c run dev
```

## Ports
| Service | Port | URL |
|---|---:|---|
| Mock API (`apps/mock`) | 3001 | `http://localhost:3001` |
| Next 消费端/BFF (`apps/low_code_c`) | 3000 | `http://localhost:3000` |
| React 编辑端 (`apps/low_code`) | TODO: 启动日志确认 | `http://localhost:<port>` |

## Env
| Name | Example | Meaning | Required |
|---|---|---|---|
| `NODE_ENV` | `development` | Node 运行模式 | Optional |
| `PORT` | `3000` / `3001` | 各服务监听端口 | Optional |
| `API_BASE_URL` | `http://localhost:3001` | 前端请求后端地址 | Optional |

## Verification Commands (Windows PowerShell)
```powershell
curl "http://localhost:3001/api/question/list"
netstat -ano | findstr :3000
netstat -ano | findstr :3001
Get-Process node | Select-Object Id,ProcessName
```

## Troubleshooting
1. 3000/3001 端口冲突
- 检查：`netstat -ano | findstr :3000` / `:3001`
- 处理：`taskkill /PID <PID> /F`
2. 依赖安装慢或失败
- 清理：`npm cache clean --force`
- 重试：`npm --prefix apps/mock install`
3. PowerShell 执行策略报错
- 临时运行：`powershell -ExecutionPolicy Bypass -File scripts/dev.ps1`
4. curl 调用失败（连接拒绝）
- 检查 mock 终端是否在运行
- 重启：`npm --prefix apps/mock run dev`
5. 前端页面空白或请求 404
- 检查：`Get-Content apps/low_code_c/package.json -TotalCount 120`
- 确认：`npm --prefix apps/low_code_c run dev` 正常启动

## Reset / Clean
```powershell
Remove-Item -Recurse -Force apps/mock/node_modules
Remove-Item -Recurse -Force apps/low_code/node_modules
Remove-Item -Recurse -Force apps/low_code_c/node_modules
npm --prefix apps/mock install
npm --prefix apps/low_code install
npm --prefix apps/low_code_c install
```

## Trade-offs
1. 先用 npm（非 pnpm workspace）
- 收益：上手门槛低。
- 代价：跨应用依赖去重能力较弱。
2. 手动三终端启动
- 收益：问题定位更直接。
- 代价：操作成本高，易漏步骤。
3. 脚本先占位后完善
- 收益：快速建立协作入口。
- 代价：当前还不具备自动健康检查。
4. 环境变量最小化
- 收益：新同学快速跑通。
- 代价：后续环境分层（dev/test/prod）需补齐。
