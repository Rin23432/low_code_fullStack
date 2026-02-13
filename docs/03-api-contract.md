# API 契约（微服务网关版）

## 统一约定
- `Gateway Base URL`：`http://localhost:3100`
- 成功状态码：`200`
- 失败结构：

```json
{
  "code": 10001,
  "msg": "error message",
  "data": null
}
```

## 接口 1：网关健康检查
- 方法：`GET`
- 路径：`/health`

```powershell
Invoke-RestMethod http://localhost:3100/health | ConvertTo-Json
```

## 接口 2：获取问卷列表
- 方法：`GET`
- 路径：`/api/question/list`

```powershell
Invoke-RestMethod http://localhost:3100/api/question/list | ConvertTo-Json -Depth 6
```

## 接口 3：获取问卷详情
- 方法：`GET`
- 路径：`/api/question/:id`

```powershell
Invoke-RestMethod http://localhost:3100/api/question/1001 | ConvertTo-Json -Depth 6
```

## 接口 4：提交答案
- 方法：`POST`
- 路径：`/api/answer`

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3100/api/answer -ContentType "application/json" -Body '{"questionId":"1001","answerList":[{"componentId":"c1","value":"ok"}]}' | ConvertTo-Json -Depth 6
```

## 接口 5：获取答案列表
- 方法：`GET`
- 路径：`/api/answer/list`

```powershell
Invoke-RestMethod http://localhost:3100/api/answer/list | ConvertTo-Json -Depth 6
```

## 对齐要求
- 新增接口必须先更新本文件，再更新网关与对应微服务实现。
