# BFF 层实现说明

## 概述

本项目利用 Next.js API Routes 构建了 BFF (Backend for Frontend) 层，用于解决跨域问题并为答题页启用 SSR 实现服务端预渲染，优化首屏加载时间。

## 🏗️ 架构设计

### BFF 层结构

```
src/pages/api/
├── question/
│   ├── [id].ts          # 获取问题详情 - BFF 层
│   └── list.ts          # 获取问题列表 - BFF 层
└── answer.ts            # 提交答案 - BFF 层
```

### 数据流向

```
前端 → BFF API Routes → 后端服务 (localhost:3001)
```

## 🔧 核心实现

### 1. 问题详情 API (`/api/question/[id]`)

**BFF 层特性：**

- **缓存机制**: 5 分钟内存缓存，减少重复请求
- **超时处理**: 3 秒请求超时，超时后返回过期缓存
- **CORS 头**: 统一设置跨域访问头
- **错误处理**: 完善的错误处理和降级策略

```typescript
// 缓存检查
const cached = cache.get(cacheKey);
if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
  res.setHeader("X-Cache", "HIT");
  return res.status(200).json(cached.data);
}

// 超时控制
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 3000);

// 转发到后端
const response = await fetch(`${BACKEND_HOST}/api/question/${id}`, {
  signal: controller.signal,
});
```

### 2. 答案提交 API (`/api/answer`)

**BFF 层特性：**

- **请求转发**: 将前端表单数据转发到后端服务
- **数据格式化**: 统一处理答案数据格式
- **CORS 支持**: 解决跨域问题
- **重定向处理**: 根据后端响应进行页面跳转

```typescript
// 转发到后端服务
const response = await fetch(`${BACKEND_HOST}/api/answer`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(answerInfo),
});

// 根据响应重定向
if (resData.errno === 0) {
  return res.redirect("/success");
} else {
  return res.redirect("/fail");
}
```

### 3. 前端服务调用

**关键改动：**

- 前端不再直接调用后端服务
- 所有请求通过 BFF 层 (`/api/*`)
- 避免跨域问题

```typescript
// 修改前：直接调用后端
const HOST = "http://localhost:3001";
const res = await fetch(`${HOST}${url}`);

// 修改后：通过 BFF 层
const BFF_HOST = ""; // 同域调用
const res = await fetch(`${BFF_HOST}${url}`);
```

## 🚀 SSR 服务端渲染

### 答题页面 SSR 实现

**文件**: `src/pages/question/[id].tsx`

```typescript
export const getServerSideProps = async (context: any) => {
  const { id } = context.query;

  try {
    // 通过 BFF 层获取数据
    const data = await getQuestionById(id);
    return { props: { ...data } };
  } catch (error) {
    return {
      props: {
        errno: 1,
        msg: "获取问题数据失败",
        data: null,
      },
    };
  }
};
```

**SSR 优势：**

- **首屏优化**: 数据在服务端预渲染
- **SEO 友好**: 搜索引擎可直接抓取内容
- **性能提升**: 减少客户端 JavaScript 执行时间

## 📊 性能优化

### 1. 缓存策略

- **内存缓存**: 5 分钟 TTL，减少重复请求
- **超时降级**: 超时后返回过期缓存，保证可用性

### 2. 请求优化

- **超时控制**: 3 秒超时，避免长时间等待
- **错误降级**: 完善的错误处理机制

### 3. Next.js 优化

```javascript
// next.config.js
const nextConfig = {
  compress: true, // 启用压缩
  poweredByHeader: false, // 隐藏技术栈信息
  experimental: {
    swcMinify: true, // 使用 SWC 压缩
  },
};
```

## 🔒 安全特性

### 1. CORS 头设置

```typescript
res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "Content-Type");
```

### 2. 安全响应头

```javascript
// next.config.js
headers: [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
];
```

## 🧪 测试验证

### 1. 启动项目

```bash
npm install
npm run dev
```

### 2. 测试页面

- **答题页**: `http://localhost:3000/question/1`
- **API 测试**: `node test-bff.js`

### 3. 验证要点

- ✅ 无跨域错误
- ✅ SSR 渲染正常
- ✅ 缓存机制工作
- ✅ 性能监控显示

## 📈 性能基准

| 指标           | 优秀    | 良好    | 一般    | 需要优化 |
| -------------- | ------- | ------- | ------- | -------- |
| SSR 渲染时间   | < 100ms | < 300ms | < 500ms | > 500ms  |
| 客户端渲染时间 | < 100ms | < 200ms | < 300ms | > 300ms  |
| 首屏加载时间   | < 300ms | < 500ms | < 800ms | > 800ms  |

## 🎯 BFF 层优势总结

1. **跨域问题解决**: 前端通过 BFF 层访问，避免跨域
2. **性能优化**: 缓存、超时控制、错误降级
3. **SSR 支持**: 服务端预渲染，优化首屏加载
4. **统一接口**: 前端只需调用 BFF API
5. **安全增强**: CORS 头、安全响应头
6. **可维护性**: 集中管理 API 逻辑

## 🔍 调试技巧

1. **查看 BFF 日志**: 控制台显示 `[BFF]` 前缀的日志
2. **检查缓存状态**: 响应头 `X-Cache` 显示缓存状态
3. **监控性能**: 使用性能监控组件观察渲染时间
4. **网络分析**: 查看 API 请求和响应

---

**BFF 层实现完成！现在你的项目具备了完整的 BFF 架构，解决了跨域问题，启用了 SSR，并优化了首屏加载性能。** 🚀

