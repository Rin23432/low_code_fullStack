# 架构设计

## 微服务架构概览
- **React 编辑端 (3002)：** 前端SPA，负责问卷创建、编辑、管理。
- **Next.js 消费端/BFF (3000)：** 前端SSR页面，负责问卷展示和答题，同时作为BFF转发请求。
- **后端服务 (8080)**：Spring Boot 实现的REST API，负责业务逻辑和数据存储。（开发期以Mock服务3001模拟）

各模块通过REST接口交互，浏览器只需调用BFF提供的统一接口。

## 模块职责
- **编辑端：** 提供问卷可视化编辑，处理用户账户登录、注册，问卷的增删改等操作，通过API调用后端保存数据。
- **消费端/BFF：** 提供问卷填答页面，并通过Next API Routes充当BFF，将前端请求转发给后端或Mock。统一数据格式，解决跨域，进行SSR提升性能。
- **后端服务：** 提供用户、问卷、答案等核心接口，进行数据校验和持久化。统一错误码和日志输出，保障安全与可观察性。

## 核心接口设计
- **用户接口：** POST /api/user/register 注册，POST /api/user/login 登录，GET /api/user/info 获取用户信息。采用JWT认证。
- **问卷接口：** POST /api/question 创建问卷，GET /api/question 查询问卷列表（支持筛选），GET /api/question/{id} 获取问卷详情，PATCH /api/question/{id} 更新问卷属性，POST /api/question/duplicate/{id} 复制问卷，DELETE /api/question 批量删除问卷。
- **答卷接口：** POST /api/answer 提交答卷，GET /api/stat/{questionId} 获取问卷总统计，GET /api/stat/{questionId}/{componentId} 获取指定题目的统计数据。

所有接口响应格式统一为 {"errno":0,"data":...,"msg":""}。前端通过 Axios 拦截器统一处理非零 errno 的错误:contentReference[oaicite:58]{index=58}。

## 端口分配
| 模块                 | 端口 | 说明               |
|--------------------|-----:|------------------|
| React 编辑端        | 3002 | 开发服务器，HMR支持 |
| Next.js BFF        | 3000 | 开发服务器，提供SSR |
| Mock API (开发专用) | 3001 | Koa假数据服务      |
| Spring Boot API    | 8080 | 实际后端服务      |
| MySQL 数据库       | 3306 | 数据存储          |
| Redis 缓存         | 6379 | 缓存服务          |

## Redis 应用
- 缓存热点问卷详情和统计结果，减轻数据库读负载。
- 存储用户会话/Token黑名单，实现集中会话管理。
- 采用缓存穿透、击穿、雪崩防护策略保障缓存层稳定（如空结果缓存、互斥锁、过期时间随机等）。
