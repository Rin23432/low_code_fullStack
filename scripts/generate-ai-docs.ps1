# 一键生成 AI 协作文档到 docs/ 文件夹
$docsPath = Join-Path $PSScriptRoot "docs"
if (!(Test-Path $docsPath)) {
    New-Item -ItemType Directory -Path $docsPath | Out-Null
}

# 文档内容集合（每个键是文件名，每个值是 Markdown 内容）
$files = @{
    "AI_CONTEXT.md" = @"
# 项目背景与目标

本项目是一个基于 React + Spring Boot 的问卷低代码平台，目标是覆盖从前端、后端、接口、数据存储到 AI 协同开发的完整流程。

# AI 协作角色与范围

- 前端：使用 Codex 协助构建页面、联调 API
- 后端：使用 Codex 编写 Spring Boot 接口、服务、Mapper 层
- 接口：由 AI 协助生成接口文档、Mock 数据、状态码处理
- 文档：文档与结构由 AI 提供初始骨架，再由人类开发维护

# 使用建议

- 开发中每新增模块，先用提示词生成结构
- 分阶段提问，如“生成 controller 层” → “生成对应 service 层” → “生成 MyBatis XML”
"@

    "01-architecture.md" = @"
# 系统架构说明

## 微服务拆分

- user-service（用户模块）：注册、登录、认证、JWT 生成
- form-service（问卷模块）：创建、编辑、发布问卷
- response-service（答卷模块）：提交、查询、统计结果

## 技术栈

- Java 17 + Spring Boot 3 + MyBatis
- Redis 缓存用户会话与热点问卷
- MySQL 存储数据，使用分表设计
- 可选：gateway（网关）统一转发接口

## 通信方式

- 服务内部使用 HTTP，未来可替换为 Feign 或 Dubbo
"@

    "02-api-contract.md" = @"
# 接口设计文档

## user-service

- POST /api/user/register  
  请求：{ username, password }  
  响应：{ code, msg }

- POST /api/user/login  
  请求：{ username, password }  
  响应：{ token }

## form-service

- GET /api/forms  
  查询所有问卷

- POST /api/forms  
  创建新问卷

## response-service

- POST /api/response  
  提交答卷
"@

    "03-db-schema.sql" = @"
-- 用户表
CREATE TABLE user (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  password VARCHAR(100) NOT NULL COMMENT '加密密码',
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
);

-- 问卷表
CREATE TABLE form (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200),
  content TEXT,
  create_by BIGINT,
  create_time TIMESTAMP
);

-- 答卷表
CREATE TABLE response (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  form_id BIGINT,
  answer JSON,
  submit_time TIMESTAMP
);
"@

    "04-dev-setup-windows.md" = @"
# Windows 本地开发部署

## 所需环境

- Node.js + npm
- MySQL（推荐使用 8.0）
- Redis（可使用 Windows 版本）
- JDK 17 + Maven 3.9+
- Git

## 启动步骤

1. 启动 Redis、MySQL
2. 执行 `mvn clean install` 构建后端模块
3. 启动每个服务的 Spring Boot 应用
4. 前端运行 `npm install && npm run dev`
"@

    "05-coding-rules.md" = @"
# 代码规范与成长建议

## 结构规范

- 每个服务按 controller → service → mapper 分层
- 所有接口返回统一封装结构（code/msg/data）
- entity 包含注释，字段与数据库一致

## 命名规范

- controller：UserController
- service：UserServiceImpl
- mapper：UserMapper.java + XML 配对

## 调试建议

- 引入 slf4j，使用 traceId 打日志
"@

    "06-frontend-prompts.md" = @"
# 前端提示词（适用于 Codex）

## 1. 获取问卷列表

请用 React + axios 调用 \`GET /api/forms\` 接口，并渲染问卷卡片。

## 2. 用户登录流程

使用 useState + useEffect 实现用户登录表单，登录后将 JWT 存入 localStorage 并跳转首页。
"@

    "07-backend-prompts.md" = @"
# 后端提示词（Spring Boot）

## 1. 创建用户注册接口

请帮我用 Spring Boot 实现用户注册接口（POST /api/user/register），使用 UserController + UserService + MyBatis。

## 2. Mapper XML 生成

请根据 User 实体生成 MyBatis XML 文件，支持 insert/selectByUsername。
"@

    "08-debug-prompts.md" = @"
# Debug 协作提示词

## 报错排查

我收到 HTTP 500 错误，请帮我分析可能的 controller/service 层问题，并建议打日志方式。

## 打印日志 traceId

请加入 MDC traceId 日志追踪，在 controller 的入口处绑定，并在 log 中输出。
"@

    "09-interview-prompts.md" = @"
# 面试讲解提示词

## 架构讲解模板

请帮我总结我这个项目的后端架构，包括微服务拆分、技术选型、Redis 用法、接口规范。

## 优化策略讲解

请讲解如何支持高并发访问，例如热点问卷缓存、幂等性处理、异步任务使用场景。
"@
}

# 写入每个文档
foreach ($name in $files.Keys) {
    $filePath = Join-Path $docsPath $name
    Set-Content -Path $filePath -Value $files[$name] -Encoding UTF8
}

Write-Host "`n[Done] All documents have been generated into the 'docs' folder."
