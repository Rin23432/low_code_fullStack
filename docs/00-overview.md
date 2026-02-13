# 项目总览

## 项目摘要
这是一个 low-code 全栈练习仓库，包含 Mock API、React 编辑端和 Next.js 消费端/BFF。
目标是支持从本地开发、接口联调到面试讲解的一条龙最小闭环。

## 主要能力
- 问卷编辑端（`apps/low_code`）
- 问卷消费端与 BFF（`apps/low_code_c`）
- Mock 接口服务（`apps/mock`）

## Quick Start（clone -> install -> dev）
```powershell
npm --prefix apps/mock install
npm --prefix apps/low_code install
npm --prefix apps/low_code_c install
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
| `PORT` | `3000` / `3001` | 服务监听端口（按应用） | Optional |
| `API_BASE_URL` | `http://localhost:3001` | 前端调用 Mock 的基础地址 | Optional |

## Demo Script（3 steps）
1. 启动 3 个服务（见 Quick Start）。
2. 打开 `http://localhost:3000`，进入问卷页面并触发一次数据加载。
3. 执行 `curl "http://localhost:3001/api/question/list"`，确认返回 `code=0` 或 200。

## Verification Commands (Windows PowerShell)
```powershell
curl "http://localhost:3001/api/question/list"
netstat -ano | findstr :3000
netstat -ano | findstr :3001
Get-Content docs/03-api-contract.md -TotalCount 80
```

## Troubleshooting
1. 端口被占用
- 检查：`netstat -ano | findstr :3000`
- 处理：`taskkill /PID <PID> /F`
2. npm 安装失败
- 处理：`Remove-Item -Recurse -Force apps/*/node_modules`
- 重装：`npm --prefix apps/mock install`（其余应用同理）
3. PowerShell 执行策略阻止脚本
- 处理：`powershell -ExecutionPolicy Bypass -File scripts/dev.ps1`
4. 页面打开但无数据
- 检查 Mock：`curl "http://localhost:3001/api/question/list"`
- 检查 BFF：访问 `http://localhost:3000/api/hello`
5. 启动命令报 script missing
- 检查：`Get-Content apps/mock/package.json -TotalCount 80`
- 处理：按 `scripts` 字段内命令执行

## Trade-offs
1. 使用 Mock 先行
- 收益：联调快、开发并行。
- 代价：与真实后端可能存在行为偏差。
2. 引入 BFF（Next API）
- 收益：统一前端数据结构，便于演进。
- 代价：多一层维护与排障成本。
3. React 编辑端与 Next 消费端分离
- 收益：职责清晰、迭代解耦。
- 代价：需要维护多应用依赖一致性。
4. 文档契约先行
- 收益：降低协作误解与返工。
- 代价：前期文档维护成本上升。

## 相关文档
- 开发环境：[`05-dev-setup-windows.md`](./05-dev-setup-windows.md)
- 架构说明：[`02-architecture.md`](./02-architecture.md)
- API 契约：[`03-api-contract.md`](./03-api-contract.md)
- 面试材料：[`09-interview-kit.md`](./09-interview-kit.md)
