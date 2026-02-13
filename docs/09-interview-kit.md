# 面试讲解包

## 5 条简历亮点（含指标占位）
1. 设计并落地 low-code 三层架构（编辑端 + 消费端/BFF + Mock），将联调等待时间降低约 `~X%`。
2. 建立接口契约先行流程，核心页面联调失败率下降约 `~X%`。
3. 引入 BFF 统一响应结构，关键页面 P95 从 `~X ms` 优化到 `~Y ms`（待压测确认）。
4. 梳理错误码与排障文档，线上问题定位时长从 `~X min` 降到 `~Y min`。
5. 建立可复用启动与验证脚本，开发环境初始化耗时降低约 `~X%`。

## 2 分钟 Demo 讲稿
1. 先说明模块：`apps/low_code` 负责编辑，`apps/low_code_c` 负责消费和 BFF，`apps/mock` 提供数据。
2. 现场启动并访问页面，演示一次从页面到 BFF 再到 Mock 的请求链路。
3. 最后展示 API 契约文档和故障排查命令，强调可维护性与协作效率。

## 1 页架构故事（模块 + 数据流）
- 模块分工：编辑端负责问卷配置，消费端负责渲染与提交，BFF 负责聚合与协议稳定，Mock 负责开发期数据。
- 数据流：Browser -> Next API/BFF -> Mock API -> BFF 标准化 -> Browser。
- 可靠性：统一错误结构与日志入口，便于 traceId 扩展。
- 性能：BFF 层便于后续增加缓存与限流。
- 可维护性：文档契约、脚本化验证、模块边界清晰。

## Ports
| Service | Port | URL |
|---|---:|---|
| Mock API (`apps/mock`) | 3001 | `http://localhost:3001` |
| Next 消费端/BFF (`apps/low_code_c`) | 3000 | `http://localhost:3000` |
| React 编辑端 (`apps/low_code`) | TODO: 启动日志确认 | `http://localhost:<port>` |

## Env
| Name | Example | Meaning | Required |
|---|---|---|---|
| `NODE_ENV` | `development` | 运行环境 | Optional |
| `PORT` | `3000` / `3001` | 服务端口 | Optional |
| `API_BASE_URL` | `http://localhost:3001` | API 基地址 | Optional |

## Verification Commands (Windows PowerShell)
```powershell
curl "http://localhost:3001/api/question/list"
curl "http://localhost:3000/api/hello"
Get-Content docs/02-architecture.md -TotalCount 120
Get-Content docs/03-api-contract.md -TotalCount 120
```

## 深入问答（12 题）
1. Q: 如何处理缓存穿透？
- A: 空值缓存 + 布隆过滤器（后续引入），避免无效 key 打穿后端。
2. Q: 如何处理缓存击穿？
- A: 热点 key 加互斥锁或单飞策略，限制同一时刻重建。
3. Q: 如何处理缓存雪崩？
- A: 过期时间随机抖动 + 分层降级。
4. Q: 幂等如何设计？
- A: 提交接口带幂等键（如 requestId），服务端去重。
5. Q: 限流放在哪？
- A: 优先 BFF/网关层按用户和 IP 双维度限流。
6. Q: MyBatis/SQL 索引怎么讲？
- A: 先按查询路径建组合索引，避免函数操作导致索引失效。
7. Q: Redis 策略怎么选？
- A: 读多写少用 Cache-Aside，热点数据短 TTL + 预热。
8. Q: 链路追踪如何落地？
- A: 统一 traceId 透传，日志按 traceId 聚合。
9. Q: 错误处理如何统一？
- A: 统一错误码结构，前端按 code 分级提示。
10. Q: 并发写冲突怎么处理？
- A: 乐观锁版本号或幂等去重，结合重试退避。
11. Q: 契约驱动 API 的价值？
- A: 降低前后端沟通成本，减少联调返工。
12. Q: 测试策略如何设计？
- A: 接口契约测试 + 关键路径 E2E + 冒烟脚本。

## Troubleshooting
1. Demo 时接口不通
- 检查：`curl "http://localhost:3001/api/question/list"`
- 修复：重启 `apps/mock`
2. 页面无数据但接口正常
- 检查 BFF：`curl "http://localhost:3000/api/hello"`
- 修复：重启 `apps/low_code_c`
3. 讲解时端口冲突
- 检查：`netstat -ano | findstr :3000`
- 修复：`taskkill /PID <PID> /F`
4. PowerShell 脚本无法运行
- 修复：`powershell -ExecutionPolicy Bypass -File scripts/dev.ps1`
5. 面试现场依赖缺失
- 修复：按顺序执行三个 `npm --prefix ... install`

## Trade-offs
1. Mock 优先于真实后端
- 收益：快速演示与开发并行。
- 牺牲：真实业务边界覆盖不足。
2. BFF 统一数据协议
- 收益：前端开发复杂度下降。
- 牺牲：新增一层性能与维护成本。
3. 多应用分仓内协作
- 收益：职责边界清晰。
- 牺牲：版本与依赖一致性管理更复杂。
4. 文档驱动交付
- 收益：新人上手快、可复盘。
- 牺牲：需要持续维护文档准确性。
