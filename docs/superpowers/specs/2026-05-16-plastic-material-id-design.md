# 塑料材质识别 Web 应用 — 设计文档

## 概述

基于 v0 前端（Next.js 16 + React 19 + Tailwind 4 + shadcn/ui）进行混合方案改造：保留已有 UI 组件和动画，改造检测流程为分支决策+加权评分，补齐 AI 聊天、拍照存样、localStorage 持久化，扩展材质数据库从 8 种到 20+ 种。

## 一、整体架构

**保留不变：**
- Next.js 16 App Router + React 19 + TypeScript
- Tailwind CSS 4 + tw-animate-css
- shadcn/ui (Radix UI) 组件库
- Framer Motion 页面/组件动画
- Sonner toast 通知
- Dashboard、ExpertMatrix、ResultPage 主体结构

**需要改造：**
- `detailed-wizard.tsx` — 从线性 7 步问卷改为"先分支后打分"混合检测
- `dictionary-history.tsx` — 拆分为 Encyclopedia 和 History 两个独立页面
- `lib/plastic-data.ts` — 材质从 8 种扩展到 20+ 种，补全特征数据

**全新开发：**
- `components/ai-chat.tsx` — DeepSeek AI 聊天
- `components/photo-log.tsx` — 拍照存样
- `lib/deepseek.ts` — DeepSeek API 封装
- `lib/storage.ts` — localStorage 持久化层
- `components/encyclopedia.tsx` — 百科字典（从 dictionary-history 拆出）
- `components/history.tsx` — 检测历史（从 dictionary-history 拆出）

## 二、检测流程（核心改造）

### 第一阶段：选择测试方式

进入详细检测后展示 3 个入口：
- **火烧测试** → 火烧分支（火星走向 → 火焰颜色 → 烟雾 → 气味）
- **物理感官测试** → 物理分支（敲击声 → 折痕 → 表面纹理 → 重量）
- **不确定/先看看** → 随机展示特征对比提示，引导选择

### 第二阶段：分支内答题

每分支 3-4 道高区分度题目。答完后自动计算当前预测，用户可：
- 置信度 ≥ 60%：直接查看结果
- 置信度 < 60%：建议继续回答另一分支题目

### 置信度与补偿

- 跳过一题扣 10%
- 连续跳过 2 次触发补偿提示（推荐物理测试补充）
- 补偿测试也可跳过，额外扣 10%，toast 提醒"跳过补充测试会降低准确度"
- 置信度 < 60% 结果页显示黄色提示

### 气味选项

简化为 4 档模糊选项：「香的/不刺鼻」「橡胶/臭味」「极度刺鼻（辣眼）」「无法形容/跳过」

## 三、AI 聊天模块

### 界面
- 聊天气泡：用户右侧（绿底）、AI 左侧（灰底），类似微信
- 底部输入框 + 快捷标签（黑烟、火星聚拢、火星散开、金属声、木头纹理、POM预警、阻燃、离火即灭等）
- 点击快捷标签自动填入并发送
- AI 回复期间显示 loading 状态

### API 封装

`lib/deepseek.ts`：
- 函数 `askDeepSeek(userMessage, systemPrompt?)`
- 默认 system prompt：「你是塑料材质识别专家。用户描述塑料特征，请给出最可能的材质（含行业黑话）、可能性排序、判定依据。回答简洁专业，不超过100字。」
- 价格分析模式切换到对应 prompt
- API Key 通过 `.env.local` 的 `DEEPSEEK_API_KEY` 读取

### 错误处理
- 网络/API 异常时气泡显示「AI 暂时无法响应，请稍后重试」
- 不阻塞界面，保留聊天记录

### 联网搜索（预留）
- AI 聊天页加一个「联网搜索」开关
- 当前无搜索 API Key，开关置灰/标记「即将上线」
- 后续接入 Bing/Brave Search API 后激活

## 四、数据层

### 材质数据库扩展

从 8 种扩展到 20+ 种：

| 材质 | 行业黑话 | 密度 | 燃烧特征 | 安全 |
|------|---------|------|---------|------|
| PC | 磁碳 | 1.2 | 火星聚拢/金属脆声 | 安全 |
| ABS | 啊B死 | 1.05 | 火星散开/浓黑烟/橡胶味 | 注意 |
| PC/ABS | 合金料 | 1.15 | 火星散开/折痕发白 | 安全 |
| PP+ABS | 合金 | 1.05 | 火星散开/折痕明显发白/橡胶味 | 安全 |
| 透明ABS | 透明ABS | 1.05 | 浓黑烟/橡胶味/火星无规则 | 注意 |
| POM | 赛钢 | 1.41 | 火焰不可见/刺鼻甲醛味 | 危险 |
| PP | 百折胶 | 0.90 | 浮水/火焰黄尖/石蜡味 | 安全 |
| PE | 花料 | 0.92 | 浮水/滴蜡/蜡烛味 | 安全 |
| HDPE | 低压PE | 0.95 | 浮水/蜡烛味/硬质 | 安全 |
| LDPE | 高压PE | 0.92 | 浮水/蜡烛味/柔软 | 安全 |
| PA | 尼龙 | 1.14 | 蓝色火焰/烧焦头发味 | 注意 |
| PS | 硬胶 | 1.05 | 清脆声/极易折断/甜芳香味 | 注意 |
| PET | 宝特瓶 | 1.38 | 甜焦糖味/浓烟/透明碎片 | 安全 |
| PVC | PVC | 1.40 | 绿边火焰/刺鼻盐酸味/自熄 | 危险 |
| PMMA | 亚克力 | 1.19 | 明亮火焰/果香味/无烟 | 安全 |
| 阻燃ABS | 阻燃料 | 1.05 | 离火即灭/刺鼻气味 | 注意 |
| 加铅重料 | 石头料/重料 | >1.5 | 木质纹理/异常沉重/极脆 | 危险 |
| 石头料 | 钙粉料 | >1.5 | 异常沉重/燃烧无味/敲击死沉 | 注意 |
| PLA | 聚乳酸 | 1.24 | 焦糊甜味/58℃软化 | 安全 |
| PBT | PBT | 1.31 | 耐高温/自熄 | 安全 |

### localStorage 封装

`lib/storage.ts`：
- `getHistory()` / `addHistory(result)` / `clearHistory()` — 检测记录
- `getPhotoLogs()` / `addPhotoLog(photo)` / `deletePhotoLog(id)` — 拍照存样
- `exportToClipboard()` — 纯文本导出到剪贴板
- 照片以 base64 存，限制 200KB

## 五、拍照存样与页面拆分

### 拍照存样 (PhotoLog)
- `<input type="file" accept="image/*" capture="environment">` 支持拍照/上传
- 缩略图预览 + 备注输入（材质、来源）
- 保存到 localStorage，在历史页展示
- 单条删除

### 百科/历史拆分
- Encyclopedia — 搜索框（实时过滤） + 材质列表 + 点击展开详情
- History — 检测记录列表 + 一键导出 + 清空（需二次确认）

## 六、技术约束

- 不引入后端，纯前端运行
- DeepSeek API Key 通过 `.env.local` 环境变量配置，不硬编码
- 所有数据存 localStorage，不清除浏览器数据则持久
- 保持暗色主题（`#0A0A0B` 底色）
- 动画保持 Framer Motion + Tailwind transition

## 七、不做的事项

- 微信小程序转换
- 后端服务/数据库
- 用户登录系统
- 多设备同步
- 联网搜索（无搜索 API Key，仅预留入口）
