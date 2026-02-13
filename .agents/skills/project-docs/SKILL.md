# Skill: project-docs

## When to use

Use this skill to create or update repo documentation in ./docs for a full-stack interview project.
Primary target environment: Windows 10/11 (PowerShell).

## Inputs (assume or infer)

- Repo structure (apps/_, packages/_, scripts/_, docs/_)
- Current run commands from package.json / scripts
- Current backend stack if present (Spring Boot, MyBatis, Redis)
- Current frontend stack if present (React/Next)

## Output files

- docs/00-overview.md
- docs/05-dev-setup-windows.md
- docs/09-interview-kit.md
  (Optional when requested)
- docs/01-roadmap.md
- docs/02-architecture.md
- docs/03-api-contract.md

## Global rules (MUST FOLLOW)

1. Keep docs short, concrete, and runnable.
2. Every doc MUST include:
   - **Ports table** (service → port → URL)
   - **Env vars table** (name → example → meaning → required/optional)
   - **Verification commands** (Windows PowerShell) that actually validate the doc content
   - **Troubleshooting**: at least 5 common issues + exact fixes/commands
   - **Trade-offs**: 3–6 explicit design decisions + why (what you sacrificed)
3. Never invent project-specific commands. Derive commands from:
   - package.json scripts
   - existing scripts/\*.ps1
   - backend build tool (mvnw.cmd / gradlew.bat) if present
     If unknown, write “TODO: confirm” and provide a safe default.
4. Prefer interview-oriented phrasing:
   - highlight reliability (traceId, error code, logging)
   - performance (cache, idempotency, rate limit, async)
   - maintainability (monorepo, contracts, lint/test)
5. Keep changes minimal:
   - If updating docs, only touch doc files unless explicitly asked.

## Doc-specific requirements

### docs/00-overview.md

Must contain:

- 1–2 sentence project summary
- Main features (bullet list)
- Quick start (single path: "clone → install → dev")
- Ports table + Env vars table
- “Demo script” (3 steps, what to click / call)
- Links to other docs in /docs

### docs/05-dev-setup-windows.md

Must contain:

- Prerequisites (Node, pnpm/npm, Java, Git) with version hints
- One-command dev instructions (or best available)
- Exact commands to run each app (if no one-command exists)
- Ports table + Env vars table
- Troubleshooting section with commands
- “Reset / Clean” section (cache, node_modules, build outputs)

### docs/09-interview-kit.md

Must contain:

- 5 resume bullets (with metric placeholders like “~X%”, “P95”, “QPS”)
- 12 deep-dive Q&A covering:
  cache (penetration/breakdown/avalanche), idempotency, rate limiting,
  MyBatis/SQL/indexes, Redis strategy, tracing/logging, error handling,
  concurrency design, contract-driven API, testing strategy
- 2-minute demo talk track
- 1-page architecture story (modules + data flow + key trade-offs)

## Output format (in chat)

1. Files updated/created
2. Short summary of what changed
3. Verification commands (PowerShell)
4. Any TODOs requiring user confirmation
