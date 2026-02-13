# 架构说明（微服务版）

## 文本架构图
```text
Client
  |
  v
API Gateway (3100)
  |                         REST
  +------> Question Service (3101)
  |
  +------> Answer Service (3102) ----REST----> Question Service (3101)
```

## 请求流
1. 客户端调用网关 `GET /api/question/list` 或 `POST /api/answer`。
2. 网关把请求转发给对应微服务。
3. `answer-service` 在写入答案前，通过 REST 调用 `question-service` 校验 `questionId`。
4. 返回统一响应结构给客户端。

## 边界与责任
- `gateway`：统一入口、路由转发、故障隔离（502/503）。
- `question-service`：问卷查询与详情。
- `answer-service`：答案提交与查询，并依赖问卷服务做业务校验。

## 最小验收
- 可解释并演示链路：Client -> Gateway -> Answer Service -> Question Service -> Gateway -> Client。
