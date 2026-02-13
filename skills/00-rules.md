# 仓库规则（最小版）

## 分支策略
- `main`：稳定分支。
- `feat/*`：功能开发。
- `fix/*`：缺陷修复。

## 提交信息
- 推荐格式：`type(scope): subject`
- 示例：`feat(mock): add question list api`

## 目录约定
- `apps/*`：应用代码。
- `docs/*`：项目文档。
- `scripts/*`：脚本工具。
- `skills/*`：协作规则与提示模板。

## PR 检查项
1. 变更目的与范围清晰。
2. 关键命令可复现。
3. 涉及接口变更时，已更新 `docs/03-api-contract.md`。
