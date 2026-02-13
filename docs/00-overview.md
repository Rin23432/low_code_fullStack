# 项目总览

## 一句话定位
这是一个从 0 到 1 的 low-code 全栈学习与实践仓库，包含 Mock 服务、React 前端编辑端和 Next.js 消费端/BFF。

## 仓库模块清单
- `apps/mock`：Koa + Mock.js 的本地接口服务。
- `apps/low_code`：React + TypeScript 的编辑端/管理端。
- `apps/low_code_c`：Next.js 的问卷消费端与 BFF 示例。

## 今天可跑通的最小目标
1. 在 3 个终端分别启动 `mock`、`low_code`、`low_code_c`。
2. 在浏览器打开消费端首页并可访问问卷页面。
3. 通过页面请求拿到 Mock 数据（至少 1 个列表接口成功返回）。

## 快速开始入口
- 开发环境：[`05-dev-setup-windows.md`](./05-dev-setup-windows.md)
- 架构说明：[`02-architecture.md`](./02-architecture.md)
- API 契约：[`03-api-contract.md`](./03-api-contract.md)
