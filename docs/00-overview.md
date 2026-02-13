# 项目总览

## 项目摘要
该仓库当前采用前后端分离，后端新增为 Node.js 微服务架构，服务之间通过 REST 通信。
后端由网关服务统一对外，问卷服务与答案服务在内部互调，形成可本地运行的最小闭环。

## 主要能力
- 微服务网关（`apps/backend/gateway.js`）
- 问卷服务（`apps/backend/question-service.js`）
- 答案服务（`apps/backend/answer-service.js`）
- 原有前端与 mock 保留（`apps/low_code`、`apps/low_code_c`、`apps/mock`）

## Quick Start（clone -> install -> dev）
```powershell
npm install --prefix apps/backend
powershell -ExecutionPolicy Bypass -File scripts/dev.ps1 -BackendOnly
```

## Ports
| Service | Port | URL |
|---|---:|---|
| API Gateway | 3100 | `http://localhost:3100` |
| Question Service | 3101 | `http://localhost:3101` |
| Answer Service | 3102 | `http://localhost:3102` |
| Mock API（保留） | 3001 | `http://localhost:3001` |
| Next 消费端/BFF（保留） | 3000 | `http://localhost:3000` |

## Env
| Name | Example | Meaning | Required |
|---|---|---|---|
| `GATEWAY_PORT` | `3100` | 网关端口 | Optional |
| `QUESTION_SERVICE_PORT` | `3101` | 问卷服务端口 | Optional |
| `ANSWER_SERVICE_PORT` | `3102` | 答案服务端口 | Optional |
| `QUESTION_SERVICE_URL` | `http://localhost:3101` | 网关/答案服务访问问卷服务地址 | Optional |
| `ANSWER_SERVICE_URL` | `http://localhost:3102` | 网关访问答案服务地址 | Optional |

## Demo Script（3 steps）
1. 执行 `powershell -ExecutionPolicy Bypass -File scripts/dev.ps1 -BackendOnly`。
2. 调用 `http://localhost:3100/api/question/list` 获取问卷列表。
3. 调用 `POST http://localhost:3100/api/answer` 提交答案，再调用 `GET /api/answer/list` 验证数据写入。

## Verification Commands (Windows PowerShell)
```powershell
Invoke-RestMethod http://localhost:3100/health | ConvertTo-Json
Invoke-RestMethod http://localhost:3100/api/question/list | ConvertTo-Json -Depth 6
Invoke-RestMethod -Method Post -Uri http://localhost:3100/api/answer -ContentType "application/json" -Body '{"questionId":"1001","answerList":[{"componentId":"c1","value":"ok"}]}' | ConvertTo-Json -Depth 6
Invoke-RestMethod http://localhost:3100/api/answer/list | ConvertTo-Json -Depth 6
```

## Troubleshooting
1. 端口冲突
- 检查：`netstat -ano | findstr :3100`
- 处理：`taskkill /PID <PID> /F`
2. 后端依赖未安装
- 处理：`npm install --prefix apps/backend`
3. 网关 502
- 检查子服务健康：`Invoke-RestMethod http://localhost:3101/health` 与 `http://localhost:3102/health`
4. 脚本执行策略限制
- 处理：`powershell -ExecutionPolicy Bypass -File scripts/dev.ps1 -BackendOnly`
5. 中文响应乱码（控制台编码）
- 处理：`chcp 65001` 后重启终端

## Trade-offs
1. 采用内存存储替代数据库
- 收益：快速跑通微服务通信链路。
- 代价：进程重启后数据丢失。
2. 网关统一对外
- 收益：前端只需对接一个入口。
- 代价：网关成为额外维护点。
3. REST 同步调用
- 收益：调试简单，日志链路直观。
- 代价：调用链延迟与故障传播更直接。
4. 保留旧 mock 与前端结构
- 收益：不破坏现有练习内容。
- 代价：短期内存在双后端入口（mock 与微服务）。

## 相关文档
- 开发环境：[`05-dev-setup-windows.md`](./05-dev-setup-windows.md)
- 架构说明：[`02-architecture.md`](./02-architecture.md)
- API 契约：[`03-api-contract.md`](./03-api-contract.md)
- 路线图：[`01-roadmap.md`](./01-roadmap.md)
