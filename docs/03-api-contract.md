# API 契约（最小版）

## 统一约定
- `Mock Base URL`：`http://localhost:3001`
- `BFF Base URL`：`http://localhost:3000/api`
- 请求方法：以 `GET/POST` 为主。
- 成功状态码：`200`
- 失败结构（建议统一）：

```json
{
  "code": 10001,
  "msg": "error message",
  "data": null
}
```

## 接口 1：获取问卷列表
- 方法：`GET`
- 路径：`/api/question/list`

```bash
curl "http://localhost:3001/api/question/list"
```

示例响应（最小）：
```json
{
  "code": 0,
  "data": {
    "list": []
  },
  "msg": "ok"
}
```

## 接口 2：获取问卷详情
- 方法：`GET`
- 路径：`/api/question/:id`

```bash
curl "http://localhost:3001/api/question/1001"
```

## 接口 3：提交答案
- 方法：`POST`
- 路径：`/api/answer`

```bash
curl -X POST "http://localhost:3001/api/answer" ^
  -H "Content-Type: application/json" ^
  -d "{\"questionId\":\"1001\",\"answerList\":[]}"
```

## 对齐要求
- 新增接口先更新本文件，再落地代码。
