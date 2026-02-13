# 架构说明（最小版）

## 文本架构图
```text
Browser
  |\
  | \---> apps/low_code (React 编辑端)
  |\
  | \---> apps/low_code_c (Next.js 消费端 + BFF API)
               |
               v
          apps/mock (Koa Mock API)
```

## 请求流
1. 浏览器访问 `apps/low_code_c` 页面。
2. 页面优先请求 Next.js API/BFF（`/api/bff/...`）。
3. BFF 再调用 `apps/mock` 对应接口并整理响应。
4. 前端根据统一结构渲染页面。

## 边界与责任
- `apps/low_code`：问卷编辑、组件配置、管理页面。
- `apps/low_code_c`：问卷展示、SSR/BFF、前后端中转。
- `apps/mock`：提供开发期稳定假数据接口，不承载业务真实持久化。

## 最小验收
- 可解释一次完整链路：页面 -> BFF -> Mock -> 页面渲染。
