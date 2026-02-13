# Windows 开发环境搭建

## 前置条件
- Node.js：`>=18`（已验证 Node `v22.13.1` 可运行）
- npm：`>=9`（已验证 npm `10.9.2` 可运行）
- PowerShell：`5.1` 或 `7+`
- Git：`>=2.40`（建议）

## One-command dev（后端微服务）
```powershell
npm install --prefix apps/backend
powershell -ExecutionPolicy Bypass -File scripts/dev.ps1 -BackendOnly
```

## 手动启动（精确命令）
```powershell
npm --prefix apps/backend run start:question
npm --prefix apps/backend run start:answer
npm --prefix apps/backend run start:gateway
```

## Ports
| Service | Port | URL |
|---|---:|---|
| API Gateway | 3100 | `http://localhost:3100` |
| Question Service | 3101 | `http://localhost:3101` |
| Answer Service | 3102 | `http://localhost:3102` |

## Env
| Name | Example | Meaning | Required |
|---|---|---|---|
| `GATEWAY_PORT` | `3100` | 网关监听端口 | Optional |
| `QUESTION_SERVICE_PORT` | `3101` | 问卷服务监听端口 | Optional |
| `ANSWER_SERVICE_PORT` | `3102` | 答案服务监听端口 | Optional |
| `QUESTION_SERVICE_URL` | `http://localhost:3101` | 网关/答案服务访问问卷服务地址 | Optional |
| `ANSWER_SERVICE_URL` | `http://localhost:3102` | 网关访问答案服务地址 | Optional |

## Verification Commands (Windows PowerShell)
```powershell
Invoke-RestMethod http://localhost:3100/health | ConvertTo-Json
Invoke-RestMethod http://localhost:3101/health | ConvertTo-Json
Invoke-RestMethod http://localhost:3102/health | ConvertTo-Json
Invoke-RestMethod http://localhost:3100/api/question/list | ConvertTo-Json -Depth 6
Invoke-RestMethod -Method Post -Uri http://localhost:3100/api/answer -ContentType "application/json" -Body '{"questionId":"1001","answerList":[{"componentId":"c1","value":"hello"}]}' | ConvertTo-Json -Depth 6
Invoke-RestMethod http://localhost:3100/api/answer/list | ConvertTo-Json -Depth 6
```

## Troubleshooting
1. 脚本可执行但健康检查失败
- 处理：分别执行 `npm --prefix apps/backend run start:question`、`start:answer`、`start:gateway`，查看具体报错。
2. `npm install` 失败
- 处理：`npm cache clean --force` 后重试 `npm install --prefix apps/backend`。
3. 端口被占用
- 检查：`netstat -ano | findstr :3100`
- 处理：`taskkill /PID <PID> /F`
4. 提交答案返回 `invalid questionId`
- 检查 question 服务：`Invoke-RestMethod http://localhost:3101/api/question/1001`
5. `powershell` 执行策略限制
- 处理：`powershell -ExecutionPolicy Bypass -File scripts/dev.ps1 -BackendOnly`

## Reset / Clean
```powershell
taskkill /F /IM node.exe
Remove-Item -Recurse -Force apps/backend/node_modules
npm install --prefix apps/backend
```

## Trade-offs
1. 使用单仓库多进程替代容器编排
- 收益：本地调试成本最低。
- 代价：生产环境一致性不足。
2. 不引入服务注册中心
- 收益：结构更小，上手更快。
- 代价：服务地址靠环境变量管理。
3. 先保证 REST 主链路
- 收益：优先完成面试可演示能力。
- 代价：监控、鉴权、重试策略后补。
