# 🚀 AI Resume Builder

<p align="center">
  <strong>一款面向现代求职场景的 AI 简历平台</strong><br/>
  <em>AI + Full-Stack + Engineering-First</em>
</p>

<p align="center">
  <img alt="Monorepo" src="https://img.shields.io/badge/Monorepo-Turborepo-blue?style=flat-square" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img alt="NestJS" src="https://img.shields.io/badge/NestJS-Backend-E0234E?style=flat-square&logo=nestjs&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white" />
  <img alt="Docker" src="https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white" />
</p>

---

## ✨ 项目亮点

- 🤖 **AI 原生简历工作台**：ATS 分析、面试题生成、简历优化建议、多语言翻译
- 🧠 **Prompt Engineering 实践**：针对不同任务设计结构化 Prompt，并强约束 JSON 输出
- 🧱 **Monorepo 工程化**：基于 Turborepo + pnpm workspace 的多包协同开发
- 🔐 **企业级后端能力**：NestJS + Prisma + JWT 鉴权 + 限流 + 安全中间件
- ⚙️ **异步 AI 任务队列**：BullMQ + Redis（可选）支持异步生成与状态轮询
- 🐳 **容器化开发体验**：一键启动 PostgreSQL，快速进入全栈开发

---

## 🏗️ 技术架构

```text
ai-resume/
├─ apps/
│  ├─ web/        # React 19 + Vite + TanStack Query + Zustand
│  └─ api/        # NestJS + Prisma + BullMQ + Zod
├─ packages/
│  ├─ shared/     # 跨端类型、常量、协议
│  └─ ui/         # 可复用 UI 组件库
├─ docker-compose.yml
├─ turbo.json
└─ pnpm-workspace.yaml
```

---

## 🤖 AI 能力设计（技术向）

### 1) 结构化输出（Structured Output）
所有 AI 任务都要求模型返回 **合法 JSON**，后端通过容错解析器处理：
- 优先 `JSON.parse`
- 失败时自动抽取 JSON 片段兜底
- 输出统一转换为前端可消费的数据结构

### 2) Prompt Engineering
按任务分治，针对不同目标定义规则与输出契约：
- `generate_summary`：职业摘要 + 关键词 + 多版本候选
- `optimize_experience`：STAR 法则 + 量化成果
- `analyze_ats`：匹配度、缺失关键词、优化建议
- `generate_interview_questions`：HR 面 + 技术深挖链路
- `translate`：简历字段级翻译
- `suggest_improvements`：全局评分 + 分项建议

### 3) 多模型 Provider 抽象
统一 LLM Client，支持多供应商切换：
- `deepseek`
- `openai`
- `gemini`

通过环境变量 `AI_MODEL_PROVIDER` 无缝切换。

### 4) Async Job Pipeline
- 同步生成：`POST /api/ai/generate`
- 异步生成：`POST /api/ai/generate/async`
- 状态查询：`GET /api/ai/jobs/:jobId`

支持队列排队、重试、失败追踪与运营统计。

### 5) RAG 扩展位（已预留）
项目已提供 `embeddings-sync` 脚本占位，可扩展：
- 知识分块（Knowledge Chunk）
- 向量化与回填
- 检索增强生成（RAG）链路

---

## 📦 核心技术栈

### Frontend
- React 19 + Vite 6
- TypeScript 5
- TanStack Query
- Zustand
- React Hook Form + Zod
- Radix UI + 自定义 UI 包

### Backend
- NestJS 10
- Prisma 6 + PostgreSQL
- BullMQ（可选 Redis）
- JWT 鉴权
- Helmet + CORS + Rate Limit

### Engineering
- Turborepo
- pnpm workspace
- 统一 TS 基础配置
- Docker Compose（PostgreSQL）

---

## 🚀 快速开始

### 1. 克隆与安装

```bash
git clone <your-repo-url>
cd ai-resume
pnpm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env`（最少需要数据库 + 一个 AI Provider）：

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ai-resume"

AI_MODEL_PROVIDER="deepseek" # deepseek | openai | gemini
DEEPSEEK_API_KEY="sk-..."
OPENAI_API_KEY="sk-..."
GEMINI_API_KEY="..."

NEXT_PUBLIC_API_URL="http://localhost:3001"
API_PORT=3001
API_CORS_ORIGIN="http://localhost:5173"
```

### 3. 启动数据库（Docker）

```bash
docker compose up -d
```

### 4. 初始化 Prisma

```bash
pnpm db:generate
pnpm db:push
```

### 5. 启动开发环境

```bash
pnpm dev
```

默认访问：
- Web: `http://localhost:5173`
- API: `http://localhost:3001`

---

## 🧪 常用命令

```bash
pnpm dev            # 启动所有应用
pnpm build          # 构建全项目
pnpm lint           # 代码检查
pnpm check-types    # 类型检查

pnpm db:generate    # Prisma Client 生成
pnpm db:push        # 推送 schema 到数据库
pnpm db:migrate     # 创建并执行迁移
pnpm db:studio      # 打开 Prisma Studio
```

---

## 🧹 工程优化（已完成）

- ✅ 移除重复配置文件：`apps/web/vite.config.js`（统一以 `vite.config.ts` 为准）
- ✅ 清理未被引用的旧 AI 组件：`apps/web/src/components/ai/AiPanel.tsx`
- ✅ 补齐仓库忽略规则：`*.tsbuildinfo`、`_docx_build/`、`exp2_assets/`
- ✅ 降低无效变更噪音，提升代码审查与 CI 稳定性

---

## 🔌 AI 接口示例

### 同步生成

```bash
curl -X POST http://localhost:3001/api/ai/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "resumeId": "<resume_id>",
    "action": "analyze_ats",
    "targetJobDescription": "我们正在招聘一名全栈工程师..."
  }'
```

### 异步生成 + 轮询

```bash
curl -X POST http://localhost:3001/api/ai/generate/async \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "resumeId": "<resume_id>",
    "action": "generate_interview_questions"
  }'
```

```bash
curl -X GET http://localhost:3001/api/ai/jobs/<job_id> \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

---

## 🗃️ 数据模型（摘要）

- `User`：用户信息
- `Resume`：简历主实体
- `ResumeExperience / ResumeEducation / ResumeSkill`：结构化履历
- `AISession`：AI 任务输入输出、耗时、错误、token
- `AIFeedback`：用户对 AI 结果反馈
- `ResumeVersion`：简历快照版本管理

---

## 🐳 Docker 说明

当前 `docker-compose.yml` 默认提供：
- PostgreSQL 16（带健康检查）
- 命名卷持久化存储

如需完整本地异步队列，可额外接入 Redis 并设置 `REDIS_URL`。

---

## 🛣️ Roadmap

- [ ] 接入完整 RAG（向量检索 + JD 语义匹配）
- [ ] AI 输出质量评估与自动回归测试
- [ ] 模板市场与主题系统增强
- [ ] 多语言简历 PDF 导出优化
- [ ] 多租户与团队协作能力

---

## 🤝 贡献指南

欢迎 PR 与 Issue，一起把这套 AI 简历工程打磨成真正可复用的全栈范式。

```bash
# 1) Fork & Clone
# 2) 新建分支
git checkout -b feat/your-feature

# 3) 提交代码
git commit -m "feat: add your feature"

# 4) 推送并发起 PR
git push origin feat/your-feature
```

---

## 📄 License

MIT

---

<p align="center">
  Built with ❤️ by Full-Stack Engineers, for AI-Native Career Builders.
</p>
