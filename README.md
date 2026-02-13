# low_code_fullStack

从 0 开始搭建与演进的 low-code 全栈练习仓库，包含 Mock API、React 编辑端、Next.js 消费端/BFF。

## 从0开始的使用说明

### 1) 前置依赖
- Node.js `>=18`
- npm `>=9`
- PowerShell `5.1` 或 `7+`

### 2) 安装依赖
在仓库根目录执行：

```powershell
npm --prefix apps/mock install
npm --prefix apps/low_code install
npm --prefix apps/low_code_c install
```

### 3) 启动顺序与命令
建议开 3 个终端按顺序执行：

```powershell
npm --prefix apps/mock run dev
npm --prefix apps/low_code start
npm --prefix apps/low_code_c run dev
```

也可先查看占位启动清单：

```powershell
powershell -ExecutionPolicy Bypass -File scripts/dev.ps1
```

### 4) 最小验证步骤
1. 打开 `http://localhost:3000`，确认页面可访问。
2. 触发一次问卷数据请求，确认响应为 200。
3. 检查 Mock 服务终端有请求日志。

## 下一步计划
1. 文档补全：增加模块级设计与接口变更记录。
2. 脚本自动化：将 `scripts/dev.ps1` 升级为并行启动 + 健康检查。
3. 测试与 CI：补充最小回归用例并接入自动检查。
