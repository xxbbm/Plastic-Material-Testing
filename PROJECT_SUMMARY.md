# 塑料材质识别 Web 应用 — 项目总结

## 项目概述

基于 v0 前端（Next.js 16 + React 19 + Tailwind 4 + shadcn/ui）改造完成的塑料材质识别本地 Web 应用。面向塑料回收行业从业者，提供 AI 智能咨询、分支检测流程、20+ 材质数据库、管理后台和用户反馈系统。

**位置：** `/home/andy/plastic-material-id/`
**访问：** `http://localhost:3000`（`npm run dev`）
**管理后台：** `http://localhost:3000/admin` | 口令：`admin123`

---

## 技术栈

- Next.js 16.2 + React 19.2 + TypeScript 5.7
- Tailwind CSS 4 + tw-animate-css + Framer Motion
- shadcn/ui (Radix UI) 组件库
- Sonner toast 通知
- DeepSeek API（AI 聊天 + 行情分析）
- 数据存储：服务端 JSON 文件 + localStorage

---

## 功能模块（8个页面 + 管理后台）

### 用户端页面

| 页面 | 文件 | 说明 |
|------|------|------|
| 首页 Dashboard | `components/dashboard.tsx` | 行情跑马灯 + AI 自动行情简评 + 4个入口卡片 |
| 详细检测 | `components/detailed-wizard.tsx` | 二分检测流程（火烧/物理），加权评分，跳过补偿 |
| 专家模式 | `components/expert-matrix.tsx` | 25个标签多选矩阵，实时预测结果 |
| AI 咨询 | `components/ai-chat.tsx` | DeepSeek 追问对话，快捷标签，"结果错误"重判，多会话7天过期 |
| 百科字典 | `components/encyclopedia.tsx` | 搜索 + 24种材质详情展开 |
| 检测历史 | `components/history.tsx` | 记录列表 + 一键导出剪贴板 + 清空 |
| 拍照存样 | `components/photo-log.tsx` | 拍照/上传 + 备注 + 缩略图网格 |
| 反馈系统 | `components/feedback-form.tsx` + `feedback-history.tsx` | 提交反馈 + 查看管理员处理状态 |

### 管理后台（`/admin`）

| 页面 | 文件 | 说明 |
|------|------|------|
| 后台首页 | `app/admin/page.tsx` | 材质管理 + 反馈管理入口 |
| 材质管理 | `app/admin/materials/page.tsx` | 增删改查，表单弹窗编辑 |
| 反馈管理 | `app/admin/feedback/page.tsx` | 状态筛选 + 标记已处理 + 填写回复 |

### API 路由（Next.js API Routes）

| 端点 | 文件 | 功能 |
|------|------|------|
| `/api/chat` | `app/api/chat/route.ts` | POST AI聊天代理 (限流20次/分, 5分钟缓存) |
| `/api/materials` | `app/api/materials/route.ts` | GET 全部 / POST 新增 |
| `/api/materials/[id]` | `app/api/materials/[id]/route.ts` | GET/PUT/DELETE 单个 |
| `/api/feedback` | `app/api/feedback/route.ts` | GET(按userId筛选) / POST 提交 |
| `/api/feedback/[id]` | `app/api/feedback/[id]/route.ts` | PATCH 状态 / DELETE |
| `/api/admin/auth` | `app/api/admin/auth/route.ts` | POST 口令验证，设置 cookie |

---

## 数据层

### 材质数据库（24 种）

```
PC, ABS, PC/ABS, PP+ABS, 透明ABS, POM, PP, PE, HDPE, LDPE,
PA, PS, PET, PVC, PMMA, 阻燃ABS, 加铅重料, 石头料, PLA, PBT,
PC/PBT合金, PA/ABS合金, ASA, HIPS(改苯)
```

每种包含：名称、行业黑话、密度、基本特征、燃烧特征、物理特征、安全等级、参考价

### 检测特征（8道题 × 24种材质权重）

- 火烧分支：火星走向 → 火焰颜色 → 烟雾 → 气味
- 物理分支：透明度外观 → 敲击声 → 弯折 → 表面 → 重量

### 存储策略

- 材质/反馈数据：`data/*.json`（服务端文件读写）
- 检测历史/拍照/聊天会话：localStorage（7天过期）
- 用户身份：UUID 存 localStorage

---

## 核心设计决策

1. **检测方式：先分支后打分** — 用户先选火烧或物理测试，按分支答题，加权评分综合判断，支持跨分支切换提高置信度
2. **气味选项简化** — 4档模糊分类（香的/橡胶臭/刺鼻辣眼/跳过），不要求精确气味判断
3. **AI追问模式** — 主动问关键特征，不重复问题，最多4轮强制结论
4. **管理后台** — 图形化材质 CRUD + 反馈标记处理，口令保护

---

## 文件统计

| 类别 | 文件数 | 关键行数 |
|------|--------|---------|
| 类型定义 | 1 | 85行 |
| 材质数据 | 1 | 756行 |
| 检测权重 | 1 | 321行 |
| 检测向导 | 1 | 591行 |
| AI 聊天 | 1 | 356行 |
| 首页 Dashboard | 1 | 284行 |
| API 路由 | 5 | ~250行 |
| 管理后台 | 5 | ~800行 |
| 数据存储层 | 4 | ~200行 |
| UI 组件库 | 30+ | shadcn/ui |
| **总计应用代码** | **~35** | **~3,900行** |

---

## 项目历史（21次提交）

```
初始化 → 设计文档 → 实现计划 → 13个功能任务 → 5轮修复迭代
```

### 关键修复历程

1. **AI API Key 服务端中转** — 改为 `DEEPSEEK_API_KEY`（无 `NEXT_PUBLIC_` 前缀），通过服务端 `/api/chat` 代理调用，不暴露到浏览器
2. **检测权重全量重建** — 基于权威塑料燃烧特征数据重写全部权重矩阵
3. **合金误判为纯料** — 新增透明度外观题 + 扩充合金种类
4. **AI 追问优化** — 防止重复提问 + 强制结论 + 结果错误重判按钮
5. **聊天会话管理** — 多会话切换 + 7天自动过期

---

## 启动方式

```bash
cd /home/andy/plastic-material-id
npm install
npm run dev
```

环境变量（`.env.local`）：
```
DEEPSEEK_API_KEY=sk-xxx
ADMIN_PASSWORD=admin123
```

## 文档

- 设计文档：`docs/superpowers/specs/2026-05-16-plastic-material-id-design.md`
- 实现计划：`docs/superpowers/plans/2026-05-16-plastic-material-id-plan.md`
