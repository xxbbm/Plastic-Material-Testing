# 塑料材质识别 Web 应用 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 v0 前端改造为完整的塑料材质识别应用，包含分支检测流程、AI 聊天、20+ 材质数据库、管理后台和反馈系统。

**Architecture:** Next.js 16 App Router，前端复用 shadcn/ui + Framer Motion，数据层用服务端 JSON 文件（材质/反馈）+ localStorage（用户个人数据），DeepSeek API 驱动 AI 聊天，管理后台通过 `/admin` 路由访问。

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Framer Motion, Sonner, DeepSeek API, UUID

---

### Task 1: 项目基础配置

**Files:**
- Create: `.env.local`
- Create: `data/materials.json`
- Create: `data/feedback.json`
- Create: `lib/types.ts`
- Create: `lib/uuid.ts`

- [ ] **Step 1: 创建 .env.local 环境变量文件**

```bash
cat > .env.local << 'EOF'
DEEPSEEK_API_KEY=sk-89e00d5b1c3847d08f612f72af388513
ADMIN_PASSWORD=admin123
EOF
```

- [ ] **Step 2: 创建 data 目录和初始 JSON 文件**

```bash
mkdir -p data
```

```bash
cat > data/feedback.json << 'EOF'
[]
EOF
```

- [ ] **Step 3: 创建 materials.json（20 种材质完整数据）**

文件: `data/materials.json`

```json
[
  {
    "id": "pc",
    "name": "PC",
    "fullName": "聚碳酸酯",
    "slang": "磁碳",
    "density": 1.2,
    "characteristics": ["透明度高", "耐冲击", "耐热性好"],
    "burnCharacteristics": ["火星聚拢", "慢速燃烧", "轻微黑烟"],
    "physicalCharacteristics": ["金属脆声", "表面光滑", "折痕不发白"],
    "densityCharacteristics": ["常规重量"],
    "safetyLevel": "safe",
    "currentPrice": 15800,
    "priceUnit": "元/吨",
    "priceChange": 1.2
  },
  {
    "id": "abs",
    "name": "ABS",
    "fullName": "丙烯腈-丁二烯-苯乙烯",
    "slang": "啊B死",
    "density": 1.05,
    "characteristics": ["不透明", "韧性好", "易加工"],
    "burnCharacteristics": ["火星散开", "快速燃烧", "浓黑烟", "橡胶臭味"],
    "physicalCharacteristics": ["沉闷声", "表面哑光", "折痕发白"],
    "densityCharacteristics": ["常规重量"],
    "safetyLevel": "caution",
    "safetyWarning": "燃烧产生刺鼻气味，注意通风",
    "currentPrice": 12500,
    "priceUnit": "元/吨",
    "priceChange": -0.8
  },
  {
    "id": "pc-abs",
    "name": "PC/ABS",
    "fullName": "PC/ABS合金",
    "slang": "合金料",
    "density": 1.15,
    "characteristics": ["兼具PC和ABS特性", "平衡性好"],
    "burnCharacteristics": ["火星散开", "中速燃烧", "黑烟中等"],
    "physicalCharacteristics": ["介于金属声和沉闷声之间", "折痕轻微发白"],
    "densityCharacteristics": ["常规重量"],
    "safetyLevel": "safe",
    "currentPrice": 14200,
    "priceUnit": "元/吨",
    "priceChange": 0.5
  },
  {
    "id": "pp-abs",
    "name": "PP+ABS",
    "fullName": "PP/ABS合金",
    "slang": "合金",
    "density": 1.05,
    "characteristics": ["半透明", "韧性中等"],
    "burnCharacteristics": ["火星散开", "橡胶臭味", "黑烟中等"],
    "physicalCharacteristics": ["折痕明显发白", "沉闷声"],
    "densityCharacteristics": ["常规重量"],
    "safetyLevel": "safe",
    "currentPrice": 10800,
    "priceUnit": "元/吨",
    "priceChange": -0.3
  },
  {
    "id": "transparent-abs",
    "name": "透明ABS",
    "fullName": "透明ABS",
    "slang": "透明ABS",
    "density": 1.05,
    "characteristics": ["透明度中等", "韧性好"],
    "burnCharacteristics": ["浓黑烟", "橡胶苦味", "火星无规则"],
    "physicalCharacteristics": ["沉闷声", "折痕发白"],
    "densityCharacteristics": ["常规重量"],
    "safetyLevel": "caution",
    "safetyWarning": "燃烧产生浓黑烟，注意通风",
    "currentPrice": 15800,
    "priceUnit": "元/吨",
    "priceChange": 0.2
  },
  {
    "id": "pom",
    "name": "POM",
    "fullName": "聚甲醛",
    "slang": "赛钢",
    "density": 1.41,
    "characteristics": ["乳白色", "自润滑", "耐磨"],
    "burnCharacteristics": ["火焰几乎不可见", "蓝色淡火焰", "持续燃烧", "甲醛气味"],
    "physicalCharacteristics": ["金属脆声", "蜡质手感", "表面有光泽"],
    "densityCharacteristics": ["异常沉重"],
    "safetyLevel": "danger",
    "safetyWarning": "极度危险！燃烧时火焰几乎不可见，释放有毒甲醛气体。必须在通风环境下操作，避免吸入。",
    "currentPrice": 16500,
    "priceUnit": "元/吨",
    "priceChange": 0.3
  },
  {
    "id": "pp",
    "name": "PP",
    "fullName": "聚丙烯",
    "slang": "百折胶",
    "density": 0.9,
    "characteristics": ["半透明", "耐化学", "密度最低"],
    "burnCharacteristics": ["火星少", "火焰尖端黄色", "石蜡味", "无烟或少烟"],
    "physicalCharacteristics": ["沉闷声", "蜡质手感", "可弯折不断", "折痕不明显"],
    "densityCharacteristics": ["异常轻", "浮水"],
    "safetyLevel": "safe",
    "currentPrice": 8200,
    "priceUnit": "元/吨",
    "priceChange": -1.5
  },
  {
    "id": "pe",
    "name": "PE",
    "fullName": "聚乙烯",
    "slang": "花料",
    "density": 0.92,
    "characteristics": ["半透明", "柔软", "耐腐蚀"],
    "burnCharacteristics": ["火星少", "明亮火焰", "蜡烛味", "熔融滴落"],
    "physicalCharacteristics": ["沉闷声", "蜡质手感", "表面较滑"],
    "densityCharacteristics": ["异常轻", "浮水"],
    "safetyLevel": "safe",
    "currentPrice": 8800,
    "priceUnit": "元/吨",
    "priceChange": -0.5
  },
  {
    "id": "hdpe",
    "name": "HDPE",
    "fullName": "高密度聚乙烯",
    "slang": "低压PE",
    "density": 0.95,
    "characteristics": ["乳白色半透明", "刚性强", "抗冲击"],
    "burnCharacteristics": ["火星少", "蜡烛味", "熔融滴落"],
    "physicalCharacteristics": ["沉闷声", "蜡质手感", "硬度比LDPE高"],
    "densityCharacteristics": ["浮水"],
    "safetyLevel": "safe",
    "currentPrice": 9200,
    "priceUnit": "元/吨",
    "priceChange": -0.2
  },
  {
    "id": "ldpe",
    "name": "LDPE",
    "fullName": "低密度聚乙烯",
    "slang": "高压PE",
    "density": 0.92,
    "characteristics": ["透明度较高", "柔软有韧性", "耐低温"],
    "burnCharacteristics": ["火星少", "蜡烛味", "熔融滴落"],
    "physicalCharacteristics": ["沉闷声", "蜡质手感", "柔软可弯折"],
    "densityCharacteristics": ["浮水"],
    "safetyLevel": "safe",
    "currentPrice": 8600,
    "priceUnit": "元/吨",
    "priceChange": -0.6
  },
  {
    "id": "pa",
    "name": "PA",
    "fullName": "尼龙",
    "slang": "尼龙",
    "density": 1.14,
    "characteristics": ["乳白色", "耐磨", "高强度", "韧性极强"],
    "burnCharacteristics": ["蓝色火焰", "烧焦头发味", "滴落拉丝"],
    "physicalCharacteristics": ["金属脆声", "表面略有光泽"],
    "densityCharacteristics": ["常规重量"],
    "safetyLevel": "caution",
    "safetyWarning": "燃烧时滴落物温度高，注意防护",
    "currentPrice": 22000,
    "priceUnit": "元/吨",
    "priceChange": 2.1
  },
  {
    "id": "ps",
    "name": "PS",
    "fullName": "聚苯乙烯",
    "slang": "硬胶",
    "density": 1.05,
    "characteristics": ["透明或发泡白", "硬脆", "光泽好"],
    "burnCharacteristics": ["浓密黑烟", "甜芳香味", "橙色火花"],
    "physicalCharacteristics": ["清脆敲击声", "极易折断", "断面光滑"],
    "densityCharacteristics": ["常规重量"],
    "safetyLevel": "caution",
    "safetyWarning": "燃烧产生大量黑烟和苯乙烯气体",
    "currentPrice": 9500,
    "priceUnit": "元/吨",
    "priceChange": 0.1
  },
  {
    "id": "pet",
    "name": "PET",
    "fullName": "聚对苯二甲酸乙二醇酯",
    "slang": "宝特瓶",
    "density": 1.38,
    "characteristics": ["高透明", "坚硬", "耐热中等"],
    "burnCharacteristics": ["甜焦糖味", "浓烟", "微黑烟灰"],
    "physicalCharacteristics": ["清脆声", "透明碎片状"],
    "densityCharacteristics": ["沉水"],
    "safetyLevel": "safe",
    "currentPrice": 7200,
    "priceUnit": "元/吨",
    "priceChange": -1.0
  },
  {
    "id": "pvc",
    "name": "PVC",
    "fullName": "聚氯乙烯",
    "slang": "PVC",
    "density": 1.4,
    "characteristics": ["透明至不透明", "可软可硬", "耐腐蚀"],
    "burnCharacteristics": ["黄色火焰带绿边", "刺鼻盐酸味", "浓密黑烟", "自熄"],
    "physicalCharacteristics": ["硬质坚硬", "软质有弹性"],
    "densityCharacteristics": ["沉水"],
    "safetyLevel": "danger",
    "safetyWarning": "燃烧释放氯化氢气体和剧毒二噁英，极度危险！不可燃烧测试！",
    "currentPrice": 6500,
    "priceUnit": "元/吨",
    "priceChange": -0.4
  },
  {
    "id": "pmma",
    "name": "PMMA",
    "fullName": "亚克力",
    "slang": "亚克力",
    "density": 1.19,
    "characteristics": ["高透明", "硬脆", "光学级"],
    "burnCharacteristics": ["明亮火焰", "噼啪声", "果香味", "无烟"],
    "physicalCharacteristics": ["金属脆声", "透明如玻璃", "易碎"],
    "densityCharacteristics": ["常规重量"],
    "safetyLevel": "safe",
    "currentPrice": 18500,
    "priceUnit": "元/吨",
    "priceChange": 0.8
  },
  {
    "id": "fr-abs",
    "name": "阻燃ABS",
    "fullName": "阻燃ABS",
    "slang": "阻燃料",
    "density": 1.05,
    "characteristics": ["不透明", "阻燃V0级", "抗冲击"],
    "burnCharacteristics": ["离火即灭", "难以点燃", "刺鼻气味"],
    "physicalCharacteristics": ["沉闷声", "表面哑光"],
    "densityCharacteristics": ["常规重量"],
    "safetyLevel": "caution",
    "safetyWarning": "含溴系阻燃剂，燃烧产生刺鼻气体",
    "currentPrice": 18500,
    "priceUnit": "元/吨",
    "priceChange": 0.5
  },
  {
    "id": "lead-filled",
    "name": "加铅重料",
    "fullName": "含铅填充塑料",
    "slang": "石头料/重料",
    "density": 1.6,
    "characteristics": ["异常沉重", "极脆易碎", "无回收价值"],
    "burnCharacteristics": ["燃烧困难", "几乎无火焰"],
    "physicalCharacteristics": ["木质纹理/裂纹", "异常沉重", "敲击死沉"],
    "densityCharacteristics": ["异常沉重"],
    "safetyLevel": "danger",
    "safetyWarning": "含重金属铅，建议按杂料处理。处理时戴手套，避免接触皮肤。",
    "currentPrice": 2000,
    "priceUnit": "元/吨",
    "priceChange": 0
  },
  {
    "id": "stone-filled",
    "name": "石头料",
    "fullName": "高填充钙粉料",
    "slang": "钙粉料",
    "density": 1.55,
    "characteristics": ["异常沉重", "燃烧无味", "敲击死沉"],
    "burnCharacteristics": ["燃烧无味", "几乎无火焰", "不滴落"],
    "physicalCharacteristics": ["异常沉重", "敲击死沉", "断面粗糙"],
    "densityCharacteristics": ["异常沉重"],
    "safetyLevel": "caution",
    "safetyWarning": "几乎无回收价值，燃烧无意义",
    "currentPrice": 1500,
    "priceUnit": "元/吨",
    "priceChange": 0
  },
  {
    "id": "pla",
    "name": "PLA",
    "fullName": "聚乳酸",
    "slang": "聚乳酸",
    "density": 1.24,
    "characteristics": ["半透明", "可生物降解", "58℃软化"],
    "burnCharacteristics": ["焦糊甜味", "黄色火焰", "少量烟"],
    "physicalCharacteristics": ["清脆声", "较脆", "不耐热"],
    "densityCharacteristics": ["常规重量"],
    "safetyLevel": "safe",
    "currentPrice": 28000,
    "priceUnit": "元/吨",
    "priceChange": 0.3
  },
  {
    "id": "pbt",
    "name": "PBT",
    "fullName": "聚对苯二甲酸丁二醇酯",
    "slang": "PBT",
    "density": 1.31,
    "characteristics": ["乳白色不透明", "耐高温120-150℃", "自润滑"],
    "burnCharacteristics": ["自熄", "黄色火焰", "甜味"],
    "physicalCharacteristics": ["金属脆声", "表面光滑"],
    "densityCharacteristics": ["常规重量"],
    "safetyLevel": "safe",
    "currentPrice": 25000,
    "priceUnit": "元/吨",
    "priceChange": 0.7
  }
]
```

- [ ] **Step 4: 提取共享类型定义**

文件: `lib/types.ts`

```typescript
export interface PlasticMaterial {
  id: string
  name: string
  fullName: string
  slang: string
  density: number
  characteristics: string[]
  burnCharacteristics: string[]
  physicalCharacteristics: string[]
  densityCharacteristics: string[]
  safetyLevel: 'safe' | 'caution' | 'danger'
  safetyWarning?: string
  currentPrice?: number
  priceUnit: string
  priceChange?: number
}

export interface DetectionResult {
  id: string
  material: PlasticMaterial
  confidence: number
  matchedFeatures: string[]
  timestamp: Date
  notes?: string
  imageUrl?: string
}

export interface WizardQuestion {
  id: string
  question: string
  tip?: string
  branch: 'burn' | 'physical' | 'both'
  options: {
    label: string
    value: string
    weight: Record<string, number>
  }[]
}

export interface ExpertTag {
  id: string
  label: string
  weight: Record<string, number>
}

export interface ExpertTagCategory {
  [category: string]: ExpertTag[]
}

export interface PhotoLogEntry {
  id: string
  imageData: string
  note: string
  timestamp: number
}

export interface FeedbackEntry {
  id: string
  userId: string
  type: 'unknown_material' | 'inaccurate_result' | 'bug_report'
  description: string
  contact?: string
  status: 'pending' | 'processed'
  adminNote?: string
  createdAt: number
}

export interface MarketPrice {
  name: string
  price: number
  change: number
  unit: string
}

export type PageType = 
  | 'dashboard'
  | 'wizard'
  | 'expert'
  | 'result'
  | 'encyclopedia'
  | 'history'
  | 'ai-chat'
  | 'photo-log'
  | 'feedback-form'
  | 'feedback-history'
```

- [ ] **Step 5: 创建 UUID 工具函数**

文件: `lib/uuid.ts`

```typescript
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
```

- [ ] **Step 6: 提交**

```bash
git add -A
git commit -m "feat: 项目基础配置 — .env.local, data/ JSON, 类型定义, UUID"
```

---

### Task 2: DeepSeek API 客户端

**Files:**
- Create: `lib/deepseek.ts`

- [ ] **Step 1: 实现 DeepSeek API 封装**

文件: `lib/deepseek.ts`

```typescript
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

const API_KEY = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || ''
const BASE_URL = 'https://api.deepseek.com/v1/chat/completions'

const DEFAULT_SYSTEM_PROMPT = `你是塑料材质识别专家。用户描述塑料特征，请给出最可能的材质（含行业黑话）、可能性排序、判定依据。回答简洁专业，不超过100字。`

const PRICE_SYSTEM_PROMPT = `你是塑料回收市场分析师。根据当前市场情况，给出指定材质的参考回收价及涨跌原因。回答简洁，不超过80字。`

export async function askDeepSeek(
  userMessage: string,
  options?: {
    systemPrompt?: string
    mode?: 'identify' | 'price'
  }
): Promise<string> {
  const systemPrompt = options?.systemPrompt
    || (options?.mode === 'price' ? PRICE_SYSTEM_PROMPT : DEFAULT_SYSTEM_PROMPT)

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ]

  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`DeepSeek API error ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || 'AI 未返回有效响应'
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`AI 请求失败: ${error.message}`)
    }
    throw new Error('AI 请求失败: 未知错误')
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add lib/deepseek.ts
git commit -m "feat: DeepSeek API 客户端封装"
```

---

### Task 3: localStorage 持久化层

**Files:**
- Create: `lib/storage.ts`

- [ ] **Step 1: 实现 storage.ts**

文件: `lib/storage.ts`

```typescript
import { DetectionResult, PhotoLogEntry } from './types'

const HISTORY_KEY = 'detectHistory'
const PHOTO_KEY = 'photoLogs'
const USER_ID_KEY = 'userId'

export function getUserId(): string {
  if (typeof window === 'undefined') return ''
  let userId = localStorage.getItem(USER_ID_KEY)
  if (!userId) {
    userId = crypto.randomUUID()
    localStorage.setItem(USER_ID_KEY, userId)
  }
  return userId
}

export function getHistory(): DetectionResult[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addHistory(result: DetectionResult): void {
  const history = getHistory()
  history.unshift(result)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY)
}

export function getPhotoLogs(): PhotoLogEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(PHOTO_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addPhotoLog(entry: PhotoLogEntry): void {
  const logs = getPhotoLogs()
  logs.unshift(entry)
  localStorage.setItem(PHOTO_KEY, JSON.stringify(logs))
}

export function deletePhotoLog(id: string): void {
  const logs = getPhotoLogs().filter(l => l.id !== id)
  localStorage.setItem(PHOTO_KEY, JSON.stringify(logs))
}

export function exportToClipboard(history: DetectionResult[]): void {
  const text = history.map(r =>
    `${r.material.name} (${r.material.slang}) | 置信度: ${r.confidence}% | ${new Date(r.timestamp).toLocaleString('zh-CN')} | 特征: ${r.matchedFeatures.join('、')}`
  ).join('\n')
  navigator.clipboard.writeText(text)
}
```

- [ ] **Step 2: 提交**

```bash
git add lib/storage.ts
git commit -m "feat: localStorage 持久化层 — 检测历史/拍照/用户ID"
```

---

### Task 4: API Routes — 材质 CRUD

**Files:**
- Create: `app/api/materials/route.ts`
- Create: `app/api/materials/[id]/route.ts`
- Create: `lib/materials-store.ts`

- [ ] **Step 1: 实现材质数据读写模块**

文件: `lib/materials-store.ts`

```typescript
import fs from 'fs'
import path from 'path'
import { PlasticMaterial } from './types'

const DATA_DIR = path.join(process.cwd(), 'data')
const MATERIALS_FILE = path.join(DATA_DIR, 'materials.json')

export function readMaterials(): PlasticMaterial[] {
  try {
    const raw = fs.readFileSync(MATERIALS_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function writeMaterials(materials: PlasticMaterial[]): void {
  fs.writeFileSync(MATERIALS_FILE, JSON.stringify(materials, null, 2), 'utf-8')
}

export function getMaterialById(id: string): PlasticMaterial | undefined {
  return readMaterials().find(m => m.id === id)
}

export function addMaterial(material: PlasticMaterial): PlasticMaterial {
  const materials = readMaterials()
  materials.push(material)
  writeMaterials(materials)
  return material
}

export function updateMaterial(id: string, updates: Partial<PlasticMaterial>): PlasticMaterial | null {
  const materials = readMaterials()
  const index = materials.findIndex(m => m.id === id)
  if (index === -1) return null
  materials[index] = { ...materials[index], ...updates }
  writeMaterials(materials)
  return materials[index]
}

export function deleteMaterial(id: string): boolean {
  const materials = readMaterials()
  const filtered = materials.filter(m => m.id !== id)
  if (filtered.length === materials.length) return false
  writeMaterials(filtered)
  return true
}
```

- [ ] **Step 2: 实现 GET/POST API 路由**

文件: `app/api/materials/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { readMaterials, addMaterial } from '@/lib/materials-store'
import { PlasticMaterial } from '@/lib/types'

export async function GET() {
  const materials = readMaterials()
  return NextResponse.json(materials)
}

export async function POST(request: NextRequest) {
  const body: PlasticMaterial = await request.json()
  if (!body.id || !body.name) {
    return NextResponse.json({ error: 'id 和 name 为必填' }, { status: 400 })
  }
  const material = addMaterial(body)
  return NextResponse.json(material, { status: 201 })
}
```

- [ ] **Step 3: 实现 GET/PUT/DELETE [id] 路由**

文件: `app/api/materials/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getMaterialById, updateMaterial, deleteMaterial } from '@/lib/materials-store'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const material = getMaterialById(id)
  if (!material) {
    return NextResponse.json({ error: '未找到' }, { status: 404 })
  }
  return NextResponse.json(material)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const updated = updateMaterial(id, body)
  if (!updated) {
    return NextResponse.json({ error: '未找到' }, { status: 404 })
  }
  return NextResponse.json(updated)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const deleted = deleteMaterial(id)
  if (!deleted) {
    return NextResponse.json({ error: '未找到' }, { status: 404 })
  }
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 4: 提交**

```bash
git add app/api/materials lib/materials-store.ts
git commit -m "feat: 材质 CRUD API 路由 + JSON 存储层"
```

---

### Task 5: API Routes — 反馈系统

**Files:**
- Create: `app/api/feedback/route.ts`
- Create: `app/api/feedback/[id]/route.ts`
- Create: `lib/feedback-store.ts`

- [ ] **Step 1: 实现反馈数据读写模块**

文件: `lib/feedback-store.ts`

```typescript
import fs from 'fs'
import path from 'path'
import { FeedbackEntry } from './types'

const DATA_DIR = path.join(process.cwd(), 'data')
const FEEDBACK_FILE = path.join(DATA_DIR, 'feedback.json')

export function readFeedback(): FeedbackEntry[] {
  try {
    const raw = fs.readFileSync(FEEDBACK_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function writeFeedback(feedback: FeedbackEntry[]): void {
  fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(feedback, null, 2), 'utf-8')
}

export function addFeedback(entry: FeedbackEntry): FeedbackEntry {
  const feedback = readFeedback()
  feedback.unshift(entry)
  writeFeedback(feedback)
  return entry
}

export function updateFeedbackStatus(id: string, status: 'pending' | 'processed', adminNote?: string): FeedbackEntry | null {
  const feedback = readFeedback()
  const index = feedback.findIndex(f => f.id === id)
  if (index === -1) return null
  feedback[index].status = status
  if (adminNote !== undefined) feedback[index].adminNote = adminNote
  writeFeedback(feedback)
  return feedback[index]
}

export function deleteFeedback(id: string): boolean {
  const feedback = readFeedback()
  const filtered = feedback.filter(f => f.id !== id)
  if (filtered.length === feedback.length) return false
  writeFeedback(filtered)
  return true
}
```

- [ ] **Step 2: 实现反馈 API 路由**

文件: `app/api/feedback/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { readFeedback, addFeedback } from '@/lib/feedback-store'
import { FeedbackEntry } from '@/lib/types'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  let feedback = readFeedback()
  if (userId) {
    feedback = feedback.filter(f => f.userId === userId)
  }
  return NextResponse.json(feedback)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  if (!body.userId || !body.type || !body.description) {
    return NextResponse.json({ error: 'userId, type, description 为必填' }, { status: 400 })
  }
  const entry: FeedbackEntry = {
    id: `fb-${Date.now()}`,
    userId: body.userId,
    type: body.type,
    description: body.description,
    contact: body.contact || '',
    status: 'pending',
    createdAt: Date.now(),
  }
  addFeedback(entry)
  return NextResponse.json(entry, { status: 201 })
}
```

- [ ] **Step 3: 实现反馈状态更新 API**

文件: `app/api/feedback/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { updateFeedbackStatus, deleteFeedback } from '@/lib/feedback-store'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const updated = updateFeedbackStatus(id, body.status, body.adminNote)
  if (!updated) {
    return NextResponse.json({ error: '未找到' }, { status: 404 })
  }
  return NextResponse.json(updated)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const deleted = deleteFeedback(id)
  if (!deleted) {
    return NextResponse.json({ error: '未找到' }, { status: 404 })
  }
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 4: 提交**

```bash
git add app/api/feedback lib/feedback-store.ts
git commit -m "feat: 反馈提交/处理 API 路由"
```

---

### Task 6: 改造检测向导 — 分支+加权评分

**Files:**
- Modify: `components/detailed-wizard.tsx` (完全重写)
- Create: `lib/wizard-data.ts`

- [ ] **Step 1: 提取向导题目和权重数据**

文件: `lib/wizard-data.ts`

```typescript
import { WizardQuestion, ExpertTagCategory } from './types'

export const branchQuestions: WizardQuestion[] = [
  // 火烧分支
  {
    id: 'burn-spark',
    question: '火烧后火星走向？',
    tip: 'PC 火星聚拢，合金散开，POM 几乎不可见',
    branch: 'burn',
    options: [
      { label: '向中间聚拢', value: 'spark-gather', weight: { pc: 3, pmma: 1 } },
      { label: '向四周散开', value: 'spark-spread', weight: { abs: 3, 'pc-abs': 2, 'pp-abs': 2, 'transparent-abs': 2 } },
      { label: '几乎无火星', value: 'spark-none', weight: { pp: 2, pe: 2, hdpe: 2, ldpe: 2, pom: 1, pvc: 1 } },
    ],
  },
  {
    id: 'flame-color',
    question: '火焰颜色？',
    tip: 'PVC 火焰有绿色边缘；POM 火焰几乎不可见',
    branch: 'burn',
    options: [
      { label: '明亮黄色火焰', value: 'flame-yellow', weight: { pp: 2, pe: 2, hdpe: 2, ldpe: 2, ps: 1, pmma: 1 } },
      { label: '淡蓝/几乎不可见', value: 'flame-invisible', weight: { pom: 5, 'fr-abs': 2 } },
      { label: '蓝色火焰', value: 'flame-blue', weight: { pa: 3, pom: 2 } },
      { label: '黄色带绿边', value: 'flame-green-edge', weight: { pvc: 5 } },
    ],
  },
  {
    id: 'smoke',
    question: '燃烧时烟雾情况？',
    tip: 'ABS 浓黑烟，PS 浓黑烟带甜味',
    branch: 'burn',
    options: [
      { label: '浓黑烟', value: 'smoke-heavy', weight: { abs: 3, ps: 3, 'transparent-abs': 2, pvc: 2 } },
      { label: '中等黑烟', value: 'smoke-medium', weight: { 'pc-abs': 2, pc: 1, pet: 1 } },
      { label: '无烟或少烟', value: 'smoke-light', weight: { pp: 2, pe: 2, hdpe: 2, ldpe: 2, pmma: 2, pom: 1, pla: 1 } },
    ],
  },
  {
    id: 'smell',
    question: '气味感受？',
    tip: 'PE/PP 蜡烛味；ABS 橡胶臭；PVC 刺鼻盐酸；POM 极度刺鼻',
    branch: 'burn',
    options: [
      { label: '香的/不刺鼻', value: 'smell-pleasant', weight: { pe: 2, hdpe: 2, ldpe: 2, pp: 1, pmma: 1, pet: 1 } },
      { label: '橡胶/臭味', value: 'smell-rubber', weight: { abs: 3, 'pc-abs': 1, 'pp-abs': 2, 'transparent-abs': 2 } },
      { label: '极度刺鼻（辣眼）', value: 'smell-pungent', weight: { pom: 4, pvc: 3, 'fr-abs': 1 } },
      { label: '无法形容/跳过', value: 'smell-skip', weight: {} },
    ],
  },
  // 物理分支
  {
    id: 'sound',
    question: '敲击样品的声音？',
    tip: '金属脆声 = PC/POM/PMMA/PA；沉闷声 = ABS/PP/PE',
    branch: 'physical',
    options: [
      { label: '金属脆声', value: 'sound-crisp', weight: { pc: 2, pom: 2, pmma: 2, pa: 2, ps: 2, pet: 1, pla: 1 } },
      { label: '沉闷声', value: 'sound-dull', weight: { abs: 2, pp: 2, pe: 2, hdpe: 2, ldpe: 2, 'pc-abs': 1, 'pp-abs': 1 } },
      { label: '死沉无声', value: 'sound-dead', weight: { 'lead-filled': 3, 'stone-filled': 3 } },
    ],
  },
  {
    id: 'bend',
    question: '弯折测试结果？',
    tip: '折痕发白 = ABS/合金',
    branch: 'physical',
    options: [
      { label: '折痕发白', value: 'bend-white', weight: { abs: 3, 'pp-abs': 3, 'pc-abs': 1 } },
      { label: '折痕不变色', value: 'bend-normal', weight: { pc: 2, pom: 1, pa: 1 } },
      { label: '可大幅弯折不断', value: 'bend-flexible', weight: { pp: 3, pe: 2, hdpe: 1, ldpe: 2 } },
      { label: '易碎/断裂', value: 'bend-brittle', weight: { ps: 3, pmma: 2, pla: 2, 'lead-filled': 2 } },
    ],
  },
  {
    id: 'surface',
    question: '表面纹理和手感？',
    tip: '蜡质/油滑感 = PP/PE',
    branch: 'physical',
    options: [
      { label: '光滑有光泽', value: 'surface-glossy', weight: { pc: 2, pmma: 2, pom: 1, pet: 1, pa: 1 } },
      { label: '哑光质感', value: 'surface-matte', weight: { abs: 2, 'fr-abs': 2, 'pc-abs': 1, 'pp-abs': 1 } },
      { label: '蜡质/油滑感', value: 'surface-waxy', weight: { pp: 3, pe: 3, hdpe: 2, ldpe: 2, pom: 1 } },
      { label: '木质纹理/裂纹', value: 'surface-wood', weight: { 'lead-filled': 4, 'stone-filled': 2 } },
    ],
  },
  {
    id: 'weight',
    question: '相对重量感受？',
    tip: 'POM/加铅/石头料异常沉重；PP/PE 异常轻',
    branch: 'physical',
    options: [
      { label: '异常沉重', value: 'weight-heavy', weight: { pom: 3, 'lead-filled': 3, 'stone-filled': 3, pvc: 1 } },
      { label: '常规重量', value: 'weight-normal', weight: { pc: 1, abs: 1, 'pc-abs': 1, 'pp-abs': 1, pa: 1, ps: 1, pmma: 1, pet: 1, 'fr-abs': 1, pla: 1, pbt: 1 } },
      { label: '异常轻', value: 'weight-light', weight: { pp: 3, pe: 3, hdpe: 2, ldpe: 2 } },
    ],
  },
]

export const expertTags: ExpertTagCategory = {
  '燃烧特征': [
    { id: 'spark-gather', label: '火星聚拢', weight: { pc: 3, pmma: 1 } },
    { id: 'spark-spread', label: '火星散开', weight: { abs: 3, 'pc-abs': 2, 'pp-abs': 2 } },
    { id: 'flame-invisible', label: '火焰不可见', weight: { pom: 5 } },
    { id: 'smoke-heavy', label: '浓黑烟', weight: { abs: 3, ps: 3, pvc: 2 } },
    { id: 'flame-blue', label: '蓝色火焰', weight: { pa: 3, pom: 2 } },
    { id: 'flame-green-edge', label: '火焰绿边', weight: { pvc: 5 } },
    { id: 'self-extinguish', label: '离火即灭', weight: { 'fr-abs': 4, pvc: 3, pbt: 3 } },
  ],
  '物理感官': [
    { id: 'sound-crisp', label: '金属脆声', weight: { pc: 2, pom: 2, pmma: 2, pa: 2, ps: 2, pet: 1 } },
    { id: 'sound-dull', label: '沉闷声', weight: { abs: 2, pp: 2, pe: 2, hdpe: 2, ldpe: 2 } },
    { id: 'sound-dead', label: '敲击死沉', weight: { 'lead-filled': 3, 'stone-filled': 3 } },
    { id: 'texture-waxy', label: '蜡质手感', weight: { pp: 3, pe: 3, hdpe: 2, ldpe: 2, pom: 1 } },
    { id: 'bend-white', label: '折痕发白', weight: { abs: 3, 'pp-abs': 3, 'pc-abs': 1 } },
    { id: 'texture-glossy', label: '高光泽', weight: { pc: 2, pmma: 2, pet: 1 } },
    { id: 'brittle', label: '易碎', weight: { ps: 3, pmma: 2, pla: 2, 'lead-filled': 2 } },
    { id: 'wood-texture', label: '木质纹理', weight: { 'lead-filled': 4, 'stone-filled': 2 } },
  ],
  '重量密度': [
    { id: 'weight-heavy', label: '异常沉重', weight: { pom: 3, 'lead-filled': 3, 'stone-filled': 3, pvc: 1 } },
    { id: 'weight-normal', label: '常规重量', weight: { pc: 1, abs: 1, 'pc-abs': 1, 'pp-abs': 1, pa: 1, ps: 1, pmma: 1, pet: 1, 'fr-abs': 1, pla: 1, pbt: 1 } },
    { id: 'weight-light', label: '异常轻', weight: { pp: 3, pe: 3, hdpe: 2, ldpe: 2 } },
  ],
  '外观特征': [
    { id: 'transparent-high', label: '高透明', weight: { pc: 2, pmma: 3, pet: 2 } },
    { id: 'transparent-medium', label: '半透明', weight: { pp: 2, pe: 2, hdpe: 1, ldpe: 1 } },
    { id: 'opaque', label: '不透明', weight: { abs: 2, pom: 1, 'fr-abs': 2, pbt: 2 } },
    { id: 'self-lubricating', label: '自润滑', weight: { pom: 2, pa: 1, pbt: 1 } },
  ],
}
```

- [ ] **Step 2: 重写 detailed-wizard.tsx**

文件: `components/detailed-wizard.tsx` (完整重写)

```tsx
'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, Home, HelpCircle, Lightbulb, AlertTriangle, Flame, Hand
} from 'lucide-react'
import { toast } from 'sonner'
import { PageType, DetectionResult, PlasticMaterial } from '@/lib/types'
import { branchQuestions } from '@/lib/wizard-data'
import { cn } from '@/lib/utils'

interface DetailedWizardProps {
  onNavigate: (page: PageType) => void
  onComplete: (result: DetectionResult) => void
  materials: PlasticMaterial[]
}

type Phase = 'select' | 'burn' | 'physical'

export function DetailedWizard({ onNavigate, onComplete, materials }: DetailedWizardProps) {
  const [phase, setPhase] = useState<Phase>('select')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [skippedCount, setSkippedCount] = useState(0)
  const [answeredBurn, setAnsweredBurn] = useState(false)
  const [answeredPhysical, setAnsweredPhysical] = useState(false)
  const [showCompensation, setShowCompensation] = useState(false)

  const burnQuestions = branchQuestions.filter(q => q.branch === 'burn')
  const physicalQuestions = branchQuestions.filter(q => q.branch === 'physical')

  const { confidence, topMaterial } = useMemo(() => {
    const scores: Record<string, number> = {}
    Object.entries(answers).forEach(([questionId, answerValue]) => {
      const question = branchQuestions.find(q => q.id === questionId)
      if (question) {
        const option = question.options.find(o => o.value === answerValue)
        if (option) {
          Object.entries(option.weight).forEach(([materialId, weight]) => {
            scores[materialId] = (scores[materialId] || 0) + weight
          })
        }
      }
    })

    let maxScore = 0
    let topId = 'pc'
    Object.entries(scores).forEach(([id, score]) => {
      if (score > maxScore) { maxScore = score; topId = id }
    })

    const answeredCount = Object.keys(answers).length
    const baseConfidence = answeredCount > 0 ? (maxScore / (answeredCount * 3)) * 100 : 0
    const skipPenalty = skippedCount * 10
    const finalConfidence = Math.min(100, Math.max(0, baseConfidence - skipPenalty))

    return {
      confidence: Math.round(finalConfidence),
      topMaterial: materials.find(m => m.id === topId) || materials[0],
    }
  }, [answers, skippedCount, materials])

  const handleSelectPhase = (p: Phase) => {
    if (p === 'select') {
      toast.info('请选择一个测试方式开始检测')
      return
    }
    setPhase(p)
  }

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const handleSkip = (questionId: string) => {
    setSkippedCount(prev => {
      const next = prev + 1
      if (next >= 2) setShowCompensation(true)
      return next
    })
    toast.warning('跳过此测试会降低准确度')
  }

  const handleComplete = () => {
    const matchedFeatures = Object.entries(answers).map(([qId, val]) => {
      const q = branchQuestions.find(q => q.id === qId)
      const opt = q?.options.find(o => o.value === val)
      return opt?.label || ''
    }).filter(Boolean)

    const result: DetectionResult = {
      id: `det-${Date.now()}`,
      material: topMaterial,
      confidence,
      matchedFeatures,
      timestamp: new Date(),
    }
    onComplete(result)
  }

  const currentBranchQuestions = phase === 'burn' ? burnQuestions : physicalQuestions
  const unansweredInBranch = currentBranchQuestions.filter(q => !answers[q.id])

  const showSwitchBranch = answeredBurn || answeredPhysical

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0B]">
      <header className="flex items-center justify-between px-4 py-4 border-b border-[#27272A]">
        <button
          onClick={() => phase !== 'select' ? setPhase('select') : onNavigate('dashboard')}
          className="p-2 rounded-lg bg-[#1A1A1D] hover:bg-[#27272A] transition-colors active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-medium text-[#71717A]">
          {phase === 'select' ? '选择测试方式' : phase === 'burn' ? '火烧测试' : '物理感官测试'}
        </span>
        <button
          onClick={() => onNavigate('dashboard')}
          className="p-2 rounded-lg bg-[#1A1A1D] hover:bg-[#27272A] transition-colors active:scale-95"
        >
          <Home className="w-5 h-5" />
        </button>
      </header>

      {/* 置信度进度条 */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#71717A]">置信度</span>
          <span className={cn("text-sm font-semibold",
            confidence >= 70 ? "text-[#10B981]" : confidence >= 40 ? "text-[#F59E0B]" : "text-[#71717A]"
          )}>{confidence}%</span>
        </div>
        <div className="h-1.5 bg-[#1A1A1D] rounded-full overflow-hidden">
          <motion.div
            className={cn("h-full rounded-full",
              confidence >= 70 ? "bg-[#10B981]" : confidence >= 40 ? "bg-[#F59E0B]" : "bg-[#3F3F46]"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${confidence}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="flex-1 px-4 py-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          {phase === 'select' ? (
            <motion.div key="select" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h2 className="text-lg font-semibold mb-6">请选择测试方式：</h2>
              <div className="space-y-3">
                <button onClick={() => handleSelectPhase('burn')}
                  className="w-full p-5 rounded-xl bg-[#111113] border border-[#27272A] hover:border-[#10B981]/50 text-left transition-all active:scale-[0.98]">
                  <Flame className="w-8 h-8 text-[#F59E0B] mb-2" />
                  <h3 className="font-semibold text-base">🔥 火烧测试</h3>
                  <p className="text-xs text-[#71717A] mt-1">观察火星走向、火焰颜色、烟雾、气味</p>
                </button>
                <button onClick={() => handleSelectPhase('physical')}
                  className="w-full p-5 rounded-xl bg-[#111113] border border-[#27272A] hover:border-[#10B981]/50 text-left transition-all active:scale-[0.98]">
                  <Hand className="w-8 h-8 text-[#10B981] mb-2" />
                  <h3 className="font-semibold text-base">✋ 物理感官测试</h3>
                  <p className="text-xs text-[#71717A] mt-1">敲击声、折痕、表面纹理、重量</p>
                </button>
                <button onClick={() => {
                  const randomTip = Math.random() > 0.5 ? 'burn' : 'physical'
                  toast.info(randomTip === 'burn' ? '建议从火烧测试开始，区分度最高' : '建议从物理感官开始，最安全')
                }}
                  className="w-full p-5 rounded-xl bg-[#111113] border border-[#27272A] hover:border-[#3F3F46] text-left transition-all active:scale-[0.98]">
                  <HelpCircle className="w-8 h-8 text-[#71717A] mb-2" />
                  <h3 className="font-semibold text-base">不确定 / 先看看</h3>
                  <p className="text-xs text-[#71717A] mt-1">获取随机建议，再决定测试方式</p>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key={phase} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {confidence > 20 && (
                <div className="mb-4 p-3 rounded-lg bg-[#111113] border border-[#27272A]">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-[#71717A]">当前预测:</span>
                    <span className="font-semibold text-[#10B981]">{topMaterial.name}</span>
                    <span className="text-[#71717A]">({topMaterial.slang})</span>
                  </div>
                </div>
              )}

              {currentBranchQuestions.filter(q => !answers[q.id]).slice(0, 1).map(q => (
                <div key={q.id}>
                  <h2 className="text-lg font-semibold mb-6">{q.question}</h2>
                  <div className="space-y-3">
                    {q.options.map(opt => {
                      const selected = answers[q.id] === opt.value
                      return (
                        <motion.button key={opt.value}
                          onClick={() => handleAnswer(q.id, opt.value)}
                          whileTap={{ scale: 0.98 }}
                          className={cn("w-full p-4 rounded-xl border text-left transition-all",
                            selected ? "bg-[#10B981]/10 border-[#10B981]" : "bg-[#111113] border-[#27272A] hover:border-[#3F3F46]"
                          )}>
                          <span className="font-medium">{opt.label}</span>
                        </motion.button>
                      )
                    })}
                  </div>
                  <div className="mt-4 flex justify-center">
                    <button onClick={() => handleSkip(q.id)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-[#71717A] hover:text-[#A1A1AA] transition-colors">
                      <HelpCircle className="w-4 h-4" /> 不确定 / 跳过
                    </button>
                  </div>
                  {q.tip && (
                    <div className="mt-4 p-3 rounded-lg bg-[#111113] border border-[#27272A]">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-[#F59E0B] mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-[#A1A1AA]"><span className="font-medium text-[#F59E0B]">小贴士：</span>{q.tip}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 底部操作 */}
      <div className="px-4 pb-4 space-y-3">
        {phase !== 'select' && showSwitchBranch && (
          <button onClick={() => setPhase(phase === 'burn' ? 'physical' : 'burn')}
            className="w-full py-3 rounded-xl bg-[#111113] border border-[#27272A] text-sm font-medium hover:border-[#3F3F46] transition-all active:scale-[0.98]">
            切换到{phase === 'burn' ? '物理感官' : '火烧'}测试（提高准确度）
          </button>
        )}
        {showCompensation && (
          <div className="p-3 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-sm text-[#F59E0B]">
            多次跳过可能影响准确性，建议补充物理测试
          </div>
        )}
        {Object.keys(answers).length > 0 && (
          <button onClick={handleComplete}
            className="w-full py-4 rounded-xl bg-[#10B981] text-[#0A0A0B] font-semibold text-base transition-all hover:bg-[#10B981]/90 active:scale-[0.98]">
            完成检测 → 查看结果 (置信度 {confidence}%)
          </button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: 提交**

```bash
git add components/detailed-wizard.tsx lib/wizard-data.ts
git commit -m "feat: 改造检测向导 — 分支选择 + 加权评分 + 补偿机制"
```

---

### Task 7: AI 聊天组件

**Files:**
- Create: `components/ai-chat.tsx`

- [ ] **Step 1: 实现 AI 聊天界面**

文件: `components/ai-chat.tsx`

```tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Home, Send, Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageType } from '@/lib/types'
import { askDeepSeek } from '@/lib/deepseek'
import { cn } from '@/lib/utils'

interface AIChatProps {
  onNavigate: (page: PageType) => void
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const quickTags = [
  '黑烟', '火星聚拢', '火星散开', '金属声',
  '木头纹理', 'POM预警', '阻燃', '离火即灭',
  '蜡烛味', '橡胶臭味', '刺鼻辣眼',
]

export function AIChat({ onNavigate }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchEnabled, setSearchEnabled] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const reply = await askDeepSeek(text, { mode: 'identify' })
      const aiMsg: Message = { id: `a-${Date.now()}`, role: 'assistant', content: reply }
      setMessages(prev => [...prev, aiMsg])
    } catch (error) {
      const errMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: 'AI 暂时无法响应，请稍后重试',
      }
      setMessages(prev => [...prev, errMsg])
      toast.error('AI 请求失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0B]">
      <header className="flex items-center justify-between px-4 py-4 border-b border-[#27272A]">
        <h1 className="text-lg font-bold">AI 咨询</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchEnabled(!searchEnabled)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              searchEnabled
                ? "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30"
                : "bg-[#1A1A1D] text-[#52525B] border border-[#27272A] cursor-not-allowed"
            )}
            disabled
            title="即将上线"
          >
            <Search className="w-3.5 h-3.5" />
            联网搜索
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-2 rounded-lg bg-[#1A1A1D] hover:bg-[#27272A] transition-colors active:scale-95"
          >
            <Home className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#52525B]">描述你遇到的塑料特征，AI 帮你识别</p>
            <p className="text-xs text-[#3F3F46] mt-2">试试点击下方的快捷标签，或直接输入描述</p>
          </div>
        )}
        {messages.map(msg => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}
          >
            <div className={cn(
              "max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
              msg.role === 'user'
                ? "bg-[#10B981] text-[#0A0A0B] rounded-br-md"
                : "bg-[#1A1A1D] text-[#F5F5F5] rounded-bl-md border border-[#27272A]"
            )}>
              {msg.content}
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-[#1A1A1D] border border-[#27272A]">
              <Loader2 className="w-4 h-4 animate-spin text-[#71717A]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 pb-3">
        <div className="flex flex-wrap gap-2 mb-3">
          {quickTags.map(tag => (
            <button
              key={tag}
              onClick={() => sendMessage(tag)}
              disabled={loading}
              className="px-3 py-1.5 rounded-full text-xs bg-[#1A1A1D] border border-[#27272A] text-[#A1A1AA] hover:border-[#10B981]/50 hover:text-[#F5F5F5] transition-all active:scale-95 disabled:opacity-50"
            >
              {tag}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="描述塑料特征..."
            className="flex-1 px-4 py-3 rounded-xl bg-[#111113] border border-[#27272A] text-sm placeholder:text-[#52525B] focus:outline-none focus:border-[#10B981]/50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3 rounded-xl bg-[#10B981] text-[#0A0A0B] disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add components/ai-chat.tsx
git commit -m "feat: AI 聊天组件 — DeepSeek 对话 + 快捷标签 + 联网搜索预留"
```

---

### Task 8: 百科字典页面

**Files:**
- Create: `components/encyclopedia.tsx`

- [ ] **Step 1: 实现百科字典组件**

文件: `components/encyclopedia.tsx`

```tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Search, BookOpen, AlertTriangle, Flame, Scale, ChevronDown, ChevronUp } from 'lucide-react'
import { PageType, PlasticMaterial } from '@/lib/types'
import { cn } from '@/lib/utils'

interface EncyclopediaProps {
  onNavigate: (page: PageType) => void
  materials: PlasticMaterial[]
}

export function Encyclopedia({ onNavigate, materials }: EncyclopediaProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = materials.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.slang.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getSafetyIcon = (level: string) => {
    switch (level) {
      case 'danger': return <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
      case 'caution': return <Flame className="w-4 h-4 text-[#F59E0B]" />
      default: return <Scale className="w-4 h-4 text-[#10B981]" />
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0B]">
      <header className="flex items-center justify-between px-4 py-4 border-b border-[#27272A]">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#10B981]" />
          <h1 className="text-lg font-bold">材料百科</h1>
        </div>
        <button
          onClick={() => onNavigate('dashboard')}
          className="p-2 rounded-lg bg-[#1A1A1D] hover:bg-[#27272A] transition-colors active:scale-95"
        >
          <Home className="w-5 h-5" />
        </button>
      </header>

      <div className="px-4 pt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525B]" />
          <input
            type="text"
            placeholder="搜索材料名称、行业黑话..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#111113] border border-[#27272A] text-sm placeholder:text-[#52525B] focus:outline-none focus:border-[#10B981]/50"
          />
        </div>
      </div>

      <div className="flex-1 px-4 py-4 overflow-y-auto space-y-2">
        {filtered.map((material, index) => (
          <motion.div
            key={material.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className={cn(
              "rounded-xl border transition-all",
              material.safetyLevel === 'danger'
                ? "bg-[#111113] border-[#EF4444]/30"
                : "bg-[#111113] border-[#27272A]"
            )}
          >
            <button
              onClick={() => setExpandedId(expandedId === material.id ? null : material.id)}
              className="w-full p-4 text-left"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("text-lg font-bold",
                      material.safetyLevel === 'danger' ? "text-[#EF4444]" : "text-[#F5F5F5]"
                    )}>{material.name}</span>
                    <span className="text-sm text-[#71717A]">{material.fullName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs bg-[#1A1A1D] text-[#A1A1AA]">{material.slang}</span>
                    {getSafetyIcon(material.safetyLevel)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {material.currentPrice && (
                    <div className="text-right">
                      <div className="text-sm font-semibold">¥{material.currentPrice.toLocaleString()}</div>
                      <div className="text-[10px] text-[#52525B]">/吨</div>
                    </div>
                  )}
                  {expandedId === material.id ? <ChevronUp className="w-4 h-4 text-[#52525B]" /> : <ChevronDown className="w-4 h-4 text-[#52525B]" />}
                </div>
              </div>
            </button>
            <AnimatePresence>
              {expandedId === material.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 pb-4 space-y-3 overflow-hidden"
                >
                  <div>
                    <h4 className="text-xs font-semibold text-[#71717A] mb-2 uppercase tracking-wider">基本特征</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {material.characteristics.map((c, i) => (
                        <span key={i} className="px-2 py-1 rounded text-[11px] bg-[#0A0A0B] text-[#A1A1AA]">{c}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#71717A] mb-2 uppercase tracking-wider">燃烧特征</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {material.burnCharacteristics.map((c, i) => (
                        <span key={i} className="px-2 py-1 rounded text-[11px] bg-[#0A0A0B] text-[#F59E0B]">{c}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#71717A] mb-2 uppercase tracking-wider">物理特征</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {material.physicalCharacteristics.map((c, i) => (
                        <span key={i} className="px-2 py-1 rounded text-[11px] bg-[#0A0A0B] text-[#10B981]">{c}</span>
                      ))}
                    </div>
                  </div>
                  {material.safetyWarning && (
                    <div className={cn("p-3 rounded-lg text-sm",
                      material.safetyLevel === 'danger'
                        ? "bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444]"
                        : "bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B]"
                    )}>
                      ⚠️ {material.safetyWarning}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#52525B]">未找到匹配的材料</div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add components/encyclopedia.tsx
git commit -m "feat: 百科字典页面 — 搜索 + 可展开材质详情"
```

---

### Task 9: 历史记录页面 + 拍照存样

**Files:**
- Create: `components/history.tsx`
- Create: `components/photo-log.tsx`

- [ ] **Step 1: 实现历史记录组件**

文件: `components/history.tsx`

```tsx
'use client'

import { motion } from 'framer-motion'
import { Home, Clock, Download, Trash2, ChevronRight, Camera } from 'lucide-react'
import { toast } from 'sonner'
import { PageType, DetectionResult } from '@/lib/types'
import { exportToClipboard } from '@/lib/storage'
import { cn } from '@/lib/utils'

interface HistoryProps {
  onNavigate: (page: PageType) => void
  history: DetectionResult[]
  onViewResult: (result: DetectionResult) => void
  onClear: () => void
}

export function History({ onNavigate, history, onViewResult, onClear }: HistoryProps) {
  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(date)

  const handleExport = () => {
    if (history.length === 0) { toast.error('暂无记录可导出'); return }
    exportToClipboard(history)
    toast.success('已复制到剪贴板')
  }

  const handleClear = () => {
    if (confirm('确定要清空所有检测记录吗？此操作不可撤销。')) {
      onClear()
      toast.success('记录已清空')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0B]">
      <header className="flex items-center justify-between px-4 py-4 border-b border-[#27272A]">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#10B981]" />
          <h1 className="text-lg font-bold">检测记录</h1>
        </div>
        <button
          onClick={() => onNavigate('dashboard')}
          className="p-2 rounded-lg bg-[#1A1A1D] hover:bg-[#27272A] transition-colors active:scale-95"
        >
          <Home className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 px-4 py-4 overflow-y-auto space-y-2">
        {history.length > 0 ? (
          history.map((record, index) => (
            <motion.button
              key={record.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}
              onClick={() => onViewResult(record)}
              className="w-full p-4 rounded-xl bg-[#111113] border border-[#27272A] hover:border-[#3F3F46] transition-all text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center font-bold",
                    record.material.safetyLevel === 'danger' ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#10B981]/10 text-[#10B981]"
                  )}>{record.material.name}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{record.material.fullName}</span>
                      <span className={cn("text-xs",
                        record.confidence >= 70 ? "text-[#10B981]" : record.confidence >= 40 ? "text-[#F59E0B]" : "text-[#71717A]"
                      )}>{record.confidence}%</span>
                    </div>
                    <div className="text-xs text-[#52525B] mt-0.5">{formatDate(record.timestamp)}</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#52525B]" />
              </div>
            </motion.button>
          ))
        ) : (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-[#27272A] mx-auto mb-3" />
            <p className="text-[#52525B]">暂无检测记录</p>
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="px-4 pb-4 grid grid-cols-2 gap-3">
          <button onClick={handleExport}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#111113] border border-[#27272A] text-sm font-medium hover:bg-[#1A1A1D] active:scale-[0.98] transition-all">
            <Download className="w-4 h-4" /> 导出记录
          </button>
          <button onClick={handleClear}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-sm font-medium hover:bg-[#EF4444]/20 active:scale-[0.98] transition-all">
            <Trash2 className="w-4 h-4" /> 清空记录
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: 实现拍照存样组件**

文件: `components/photo-log.tsx`

```tsx
'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Camera, X, Plus, Image } from 'lucide-react'
import { toast } from 'sonner'
import { PageType, PhotoLogEntry } from '@/lib/types'
import { getPhotoLogs, addPhotoLog, deletePhotoLog } from '@/lib/storage'

interface PhotoLogProps {
  onNavigate: (page: PageType) => void
}

export function PhotoLog({ onNavigate }: PhotoLogProps) {
  const [photos, setPhotos] = useState<PhotoLogEntry[]>(getPhotoLogs())
  const [note, setNote] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 200 * 1024) {
      toast.error('图片不能超过 200KB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    if (!preview) { toast.error('请先拍摄或选择图片'); return }
    const entry: PhotoLogEntry = {
      id: `photo-${Date.now()}`,
      imageData: preview,
      note,
      timestamp: Date.now(),
    }
    addPhotoLog(entry)
    setPhotos(prev => [entry, ...prev])
    setPreview(null)
    setNote('')
    toast.success('已保存')
  }

  const handleDelete = (id: string) => {
    deletePhotoLog(id)
    setPhotos(prev => prev.filter(p => p.id !== id))
    toast.success('已删除')
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0B]">
      <header className="flex items-center justify-between px-4 py-4 border-b border-[#27272A]">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-[#10B981]" />
          <h1 className="text-lg font-bold">拍照存样</h1>
        </div>
        <button
          onClick={() => onNavigate('dashboard')}
          className="p-2 rounded-lg bg-[#1A1A1D] hover:bg-[#27272A] transition-colors active:scale-95"
        >
          <Home className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 px-4 py-4 overflow-y-auto">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        <AnimatePresence>
          {preview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-4 rounded-xl bg-[#111113] border border-[#27272A]"
            >
              <div className="relative mb-3">
                <img src={preview} alt="预览" className="w-full h-48 object-cover rounded-lg" />
                <button onClick={() => setPreview(null)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-[#0A0A0B]/80 hover:bg-[#0A0A0B]">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="添加备注（材质、来源等）"
                className="w-full px-3 py-2.5 rounded-lg bg-[#0A0A0B] border border-[#27272A] text-sm placeholder:text-[#52525B] focus:outline-none focus:border-[#10B981]/50 mb-3"
              />
              <button onClick={handleSave}
                className="w-full py-2.5 rounded-lg bg-[#10B981] text-[#0A0A0B] font-medium text-sm active:scale-[0.98] transition-all">
                保存照片
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => fileRef.current?.click()}
            className="aspect-square rounded-xl bg-[#111113] border border-dashed border-[#27272A] flex flex-col items-center justify-center gap-2 hover:border-[#10B981]/50 transition-colors"
          >
            <Plus className="w-8 h-8 text-[#52525B]" />
            <span className="text-xs text-[#52525B]">拍摄/上传</span>
          </button>
          {photos.map(photo => (
            <motion.div key={photo.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="relative aspect-square rounded-xl overflow-hidden border border-[#27272A] group">
              <img src={photo.imageData} alt={photo.note} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button onClick={() => handleDelete(photo.id)}
                  className="p-2 rounded-full bg-[#EF4444] text-white">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
              {photo.note && (
                <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/70 text-xs text-[#A1A1AA] truncate">
                  {photo.note}
                </div>
              )}
            </motion.div>
          ))}
        </div>
        {photos.length === 0 && !preview && (
          <div className="text-center py-12 text-[#52525B]">
            <Image className="w-12 h-12 mx-auto mb-3 text-[#27272A]" />
            <p>暂无拍照记录</p>
          </div>
        )}
      </div>
    </div>
  )
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  )
}
```

- [ ] **Step 3: 提交**

```bash
git add components/history.tsx components/photo-log.tsx
git commit -m "feat: 历史记录 + 拍照存样组件"
```

---

### Task 10: 用户反馈系统（前端）

**Files:**
- Create: `components/feedback-form.tsx`
- Create: `components/feedback-history.tsx`

- [ ] **Step 1: 实现反馈提交表单**

文件: `components/feedback-form.tsx`

```tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Home, Send, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { PageType } from '@/lib/types'
import { getUserId } from '@/lib/storage'

interface FeedbackFormProps {
  onNavigate: (page: PageType) => void
}

const feedbackTypes = [
  { value: 'unknown_material', label: '未知材质' },
  { value: 'inaccurate_result', label: '检测结果不准确' },
  { value: 'bug_report', label: 'Bug 报告' },
] as const

export function FeedbackForm({ onNavigate }: FeedbackFormProps) {
  const [type, setType] = useState<string>('unknown_material')
  const [description, setDescription] = useState('')
  const [contact, setContact] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) { toast.error('请填写描述'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: getUserId(), type, description, contact }),
      })
      if (!res.ok) throw new Error()
      toast.success('反馈已提交，感谢！')
      setDescription('')
      setContact('')
    } catch {
      toast.error('提交失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0B]">
      <header className="flex items-center justify-between px-4 py-4 border-b border-[#27272A]">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#10B981]" />
          <h1 className="text-lg font-bold">提交反馈</h1>
        </div>
        <button onClick={() => onNavigate('dashboard')}
          className="p-2 rounded-lg bg-[#1A1A1D] hover:bg-[#27272A] transition-colors active:scale-95">
          <Home className="w-5 h-5" />
        </button>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 px-4 py-4 space-y-4">
        <div>
          <label className="text-sm font-medium text-[#A1A1AA] mb-2 block">反馈类型</label>
          <div className="grid grid-cols-3 gap-2">
            {feedbackTypes.map(t => (
              <button key={t.value} type="button"
                onClick={() => setType(t.value)}
                className={`py-3 rounded-lg text-sm font-medium border transition-all active:scale-95 ${
                  type === t.value
                    ? 'bg-[#10B981]/10 border-[#10B981] text-[#10B981]'
                    : 'bg-[#111113] border-[#27272A] text-[#71717A] hover:border-[#3F3F46]'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-[#A1A1AA] mb-2 block">详细描述 <span className="text-[#EF4444]">*</span></label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="请描述你遇到的材质特征或问题..."
            rows={5}
            className="w-full px-4 py-3 rounded-xl bg-[#111113] border border-[#27272A] text-sm placeholder:text-[#52525B] focus:outline-none focus:border-[#10B981]/50 resize-none"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-[#A1A1AA] mb-2 block">联系方式（选填）</label>
          <input
            type="text"
            value={contact}
            onChange={e => setContact(e.target.value)}
            placeholder="微信号或手机号，方便我们回复"
            className="w-full px-4 py-3 rounded-xl bg-[#111113] border border-[#27272A] text-sm placeholder:text-[#52525B] focus:outline-none focus:border-[#10B981]/50"
          />
        </div>
        <motion.button
          type="submit"
          disabled={submitting || !description.trim()}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-xl bg-[#10B981] text-[#0A0A0B] font-semibold text-base transition-all hover:bg-[#10B981]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          <Send className="w-4 h-4" />
          {submitting ? '提交中...' : '提交反馈'}
        </motion.button>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: 实现反馈历史组件**

文件: `components/feedback-history.tsx`

```tsx
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Home, Clock, CheckCircle2, Circle } from 'lucide-react'
import { PageType, FeedbackEntry } from '@/lib/types'
import { getUserId } from '@/lib/storage'

interface FeedbackHistoryProps {
  onNavigate: (page: PageType) => void
}

export function FeedbackHistory({ onNavigate }: FeedbackHistoryProps) {
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/feedback?userId=${getUserId()}`)
      .then(res => res.json())
      .then(data => setFeedback(data))
      .finally(() => setLoading(false))
  }, [])

  const typeLabels: Record<string, string> = {
    unknown_material: '未知材质',
    inaccurate_result: '结果不准确',
    bug_report: 'Bug 报告',
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0B]">
      <header className="flex items-center justify-between px-4 py-4 border-b border-[#27272A]">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#10B981]" />
          <h1 className="text-lg font-bold">我的反馈</h1>
        </div>
        <button onClick={() => onNavigate('dashboard')}
          className="p-2 rounded-lg bg-[#1A1A1D] hover:bg-[#27272A] transition-colors active:scale-95">
          <Home className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 px-4 py-4 overflow-y-auto space-y-2">
        {loading ? (
          <div className="text-center py-12 text-[#52525B]">加载中...</div>
        ) : feedback.length > 0 ? (
          feedback.map((item, index) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}
              className="p-4 rounded-xl bg-[#111113] border border-[#27272A]">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs bg-[#1A1A1D] text-[#A1A1AA]">{typeLabels[item.type] || item.type}</span>
                  {item.status === 'processed' ? (
                    <span className="flex items-center gap-1 text-xs text-[#10B981]"><CheckCircle2 className="w-3 h-3" /> 已处理</span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-[#F59E0B]"><Circle className="w-3 h-3" /> 待处理</span>
                  )}
                </div>
                <span className="text-xs text-[#52525B]">{new Date(item.createdAt).toLocaleDateString('zh-CN')}</span>
              </div>
              <p className="text-sm text-[#A1A1AA] mb-2">{item.description}</p>
              {item.adminNote && (
                <div className="p-2 rounded-lg bg-[#10B981]/5 border border-[#10B981]/20 text-xs text-[#10B981]">
                  💬 管理员回复：{item.adminNote}
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12 text-[#52525B]">暂无反馈记录</div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: 提交**

```bash
git add components/feedback-form.tsx components/feedback-history.tsx
git commit -m "feat: 用户反馈表单 + 反馈历史（含处理状态）"
```

---

### Task 11: 管理后台

**Files:**
- Create: `app/admin/page.tsx`
- Create: `app/admin/layout.tsx`
- Create: `app/admin/materials/page.tsx`
- Create: `app/admin/feedback/page.tsx`
- Create: `components/admin-auth.tsx`

- [ ] **Step 1: 管理后台认证组件**

文件: `components/admin-auth.tsx`

```tsx
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'

export function AdminAuth({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    // 检查是否已有 session cookie
    const auth = document.cookie.includes('admin_auth=1')
    setAuthenticated(auth)
  }, [])

  const handleLogin = async () => {
    const res = await fetch('/api/admin/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) })
    if (res.ok) {
      setAuthenticated(true)
      setError(false)
    } else {
      setError(true)
    }
  }

  if (authenticated) return <>{children}</>

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm mx-4 p-6 rounded-xl bg-[#111113] border border-[#27272A]">
        <div className="flex flex-col items-center mb-6">
          <Lock className="w-10 h-10 text-[#10B981] mb-3" />
          <h2 className="text-xl font-bold">管理后台</h2>
          <p className="text-sm text-[#71717A] mt-1">请输入管理口令</p>
        </div>
        <input
          type="password"
          value={password}
          onChange={e => { setPassword(e.target.value); setError(false) }}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          placeholder="输入口令..."
          className="w-full px-4 py-3 rounded-lg bg-[#0A0A0B] border border-[#27272A] text-sm placeholder:text-[#52525B] focus:outline-none focus:border-[#10B981]/50 mb-3"
        />
        {error && <p className="text-sm text-[#EF4444] mb-3">口令错误</p>}
        <button onClick={handleLogin}
          className="w-full py-3 rounded-lg bg-[#10B981] text-[#0A0A0B] font-medium text-sm active:scale-[0.98] transition-all">
          进入后台
        </button>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 2: 管理后台布局 + 首页**

文件: `app/admin/layout.tsx`

```tsx
import { AdminAuth } from '@/components/admin-auth'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminAuth>{children}</AdminAuth>
}
```

文件: `app/admin/page.tsx`

```tsx
'use client'

import Link from 'next/link'
import { ArrowLeft, Package, MessageSquare } from 'lucide-react'

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="p-2 rounded-lg bg-[#1A1A1D] hover:bg-[#27272A]">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">管理后台</h1>
        </div>
        <div className="grid gap-4">
          <Link href="/admin/materials"
            className="p-6 rounded-xl bg-[#111113] border border-[#27272A] hover:border-[#10B981]/50 transition-all flex items-center gap-4">
            <Package className="w-8 h-8 text-[#10B981]" />
            <div>
              <h3 className="font-semibold text-lg">材质管理</h3>
              <p className="text-sm text-[#71717A] mt-1">添加、编辑、删除材质数据</p>
            </div>
          </Link>
          <Link href="/admin/feedback"
            className="p-6 rounded-xl bg-[#111113] border border-[#27272A] hover:border-[#10B981]/50 transition-all flex items-center gap-4">
            <MessageSquare className="w-8 h-8 text-[#10B981]" />
            <div>
              <h3 className="font-semibold text-lg">用户反馈</h3>
              <p className="text-sm text-[#71717A] mt-1">查看和处理用户反馈</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: 创建 /api/admin/auth 认证 API**

文件: `app/api/admin/auth/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { password } = await request.json()
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  
  if (password === adminPassword) {
    const response = NextResponse.json({ success: true })
    response.cookies.set('admin_auth', '1', { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 })
    return response
  }
  return NextResponse.json({ error: '口令错误' }, { status: 401 })
}
```

- [ ] **Step 4: 材质管理页面**

文件: `app/admin/materials/page.tsx`

```tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Search, Plus, X, Save, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PlasticMaterial } from '@/lib/types'

const emptyMaterial: PlasticMaterial = {
  id: '', name: '', fullName: '', slang: '', density: 1.0,
  characteristics: [], burnCharacteristics: [], physicalCharacteristics: [], densityCharacteristics: [],
  safetyLevel: 'safe', priceUnit: '元/吨',
}

export default function MaterialsManager() {
  const [materials, setMaterials] = useState<PlasticMaterial[]>([])
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<PlasticMaterial | null>(null)
  const [showForm, setShowForm] = useState(false)

  const loadMaterials = async () => {
    const res = await fetch('/api/materials')
    setMaterials(await res.json())
  }

  useEffect(() => { loadMaterials() }, [])

  const handleSave = async () => {
    if (!editing) return
    const method = materials.find(m => m.id === editing.id) ? 'PUT' : 'POST'
    const url = method === 'PUT' ? `/api/materials/${editing.id}` : '/api/materials'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) })
    if (res.ok) {
      toast.success(method === 'PUT' ? '已更新' : '已添加')
      setShowForm(false); setEditing(null); loadMaterials()
    } else {
      toast.error('保存失败')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除？')) return
    const res = await fetch(`/api/materials/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('已删除'); loadMaterials() } else { toast.error('删除失败') }
  }

  const filtered = materials.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.fullName.toLowerCase().includes(search.toLowerCase()) ||
    m.slang.toLowerCase().includes(search.toLowerCase())
  )

  const safetyColors: Record<string, string> = { safe: 'text-[#10B981]', caution: 'text-[#F59E0B]', danger: 'text-[#EF4444]' }

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin" className="p-2 rounded-lg bg-[#1A1A1D] hover:bg-[#27272A]"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-xl font-bold flex-1">材质管理</h1>
          <button onClick={() => { setEditing({ ...emptyMaterial, id: `mat-${Date.now()}` }); setShowForm(true) }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#10B981] text-[#0A0A0B] text-sm font-medium active:scale-95">
            <Plus className="w-4 h-4" /> 新增
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525B]" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索材质..."
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#111113] border border-[#27272A] text-sm focus:outline-none focus:border-[#10B981]/50" />
        </div>

        <div className="space-y-2">
          {filtered.map(m => (
            <div key={m.id} className="flex items-center justify-between p-4 rounded-xl bg-[#111113] border border-[#27272A]">
              <div className="flex items-center gap-3">
                <span className="font-bold">{m.name}</span>
                <span className="text-sm text-[#71717A]">{m.slang}</span>
                <span className={safetyColors[m.safetyLevel] || ''}>{m.safetyLevel}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setEditing({ ...m }); setShowForm(true) }}
                  className="px-3 py-1.5 rounded text-xs bg-[#1A1A1D] hover:bg-[#27272A] transition-colors">编辑</button>
                <button onClick={() => handleDelete(m.id)}
                  className="p-1.5 rounded text-xs text-[#EF4444] hover:bg-[#EF4444]/10"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>

        <AnimatePresence>
          {showForm && editing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-lg max-h-[80vh] overflow-y-auto bg-[#111113] border border-[#27272A] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold">{materials.find(m => m.id === editing.id) ? '编辑材质' : '新增材质'}</h2>
                  <button onClick={() => { setShowForm(false); setEditing(null) }}><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-[#71717A] mb-1 block">ID</label>
                      <input value={editing.id} onChange={e => setEditing({ ...editing, id: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#0A0A0B] border border-[#27272A] text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-[#71717A] mb-1 block">名称 (缩写)</label>
                      <input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#0A0A0B] border border-[#27272A] text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-[#71717A] mb-1 block">全称</label>
                      <input value={editing.fullName} onChange={e => setEditing({ ...editing, fullName: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#0A0A0B] border border-[#27272A] text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-[#71717A] mb-1 block">行业黑话</label>
                      <input value={editing.slang} onChange={e => setEditing({ ...editing, slang: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#0A0A0B] border border-[#27272A] text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-[#71717A] mb-1 block">密度 (g/cm³)</label>
                      <input type="number" step="0.01" value={editing.density} onChange={e => setEditing({ ...editing, density: parseFloat(e.target.value) || 1.0 })}
                        className="w-full px-3 py-2 rounded-lg bg-[#0A0A0B] border border-[#27272A] text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-[#71717A] mb-1 block">安全等级</label>
                      <select value={editing.safetyLevel} onChange={e => setEditing({ ...editing, safetyLevel: e.target.value as PlasticMaterial['safetyLevel'] })}
                        className="w-full px-3 py-2 rounded-lg bg-[#0A0A0B] border border-[#27272A] text-sm">
                        <option value="safe">安全</option><option value="caution">注意</option><option value="danger">危险</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-[#71717A] mb-1 block">参考价 (元/吨)</label>
                      <input type="number" value={editing.currentPrice || 0} onChange={e => setEditing({ ...editing, currentPrice: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 rounded-lg bg-[#0A0A0B] border border-[#27272A] text-sm" />
                    </div>
                  </div>
                  {['characteristics', 'burnCharacteristics', 'physicalCharacteristics'].map(field => (
                    <div key={field}>
                      <label className="text-xs text-[#71717A] mb-1 block">
                        {field === 'characteristics' ? '基本特征' : field === 'burnCharacteristics' ? '燃烧特征' : '物理特征'}
                      </label>
                      <input
                        value={(editing as any)[field].join(', ')}
                        onChange={e => setEditing({ ...editing, [field]: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })}
                        className="w-full px-3 py-2 rounded-lg bg-[#0A0A0B] border border-[#27272A] text-sm" placeholder="用逗号分隔"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs text-[#71717A] mb-1 block">安全提示语（可选）</label>
                    <input value={editing.safetyWarning || ''} onChange={e => setEditing({ ...editing, safetyWarning: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#0A0A0B] border border-[#27272A] text-sm" />
                  </div>
                  <button onClick={handleSave}
                    className="w-full py-3 rounded-xl bg-[#10B981] text-[#0A0A0B] font-semibold flex items-center justify-center gap-2 active:scale-[0.98]">
                    <Save className="w-4 h-4" /> 保存
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: 反馈管理页面**

文件: `app/admin/feedback/page.tsx`

```tsx
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { FeedbackEntry } from '@/lib/types'

export default function FeedbackManager() {
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'processed'>('pending')
  const [adminNote, setAdminNote] = useState('')
  const [noteInputId, setNoteInputId] = useState<string | null>(null)

  const load = async () => {
    const res = await fetch('/api/feedback')
    setFeedback(await res.json())
  }

  useEffect(() => { load() }, [])

  const handleMarkProcessed = async (id: string) => {
    const res = await fetch(`/api/feedback/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'processed', adminNote }),
    })
    if (res.ok) {
      toast.success('已标记为已处理')
      setAdminNote('')
      setNoteInputId(null)
      load()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除？')) return
    const res = await fetch(`/api/feedback/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('已删除'); load() }
  }

  const filtered = filter === 'all' ? feedback : feedback.filter(f => f.status === filter)
  const typeLabels: Record<string, string> = { unknown_material: '未知材质', inaccurate_result: '结果不准确', bug_report: 'Bug 报告' }

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin" className="p-2 rounded-lg bg-[#1A1A1D] hover:bg-[#27272A]"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-xl font-bold flex-1">用户反馈</h1>
          <select value={filter} onChange={e => setFilter(e.target.value as any)}
            className="px-3 py-2 rounded-lg bg-[#111113] border border-[#27272A] text-sm">
            <option value="all">全部</option><option value="pending">待处理</option><option value="processed">已处理</option>
          </select>
        </div>

        <div className="space-y-3">
          {filtered.map(item => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-[#111113] border border-[#27272A]">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="px-2 py-0.5 rounded text-xs bg-[#1A1A1D] text-[#A1A1AA] mr-2">{typeLabels[item.type]}</span>
                  <span className={`text-xs ${item.status === 'processed' ? 'text-[#10B981]' : 'text-[#F59E0B]'}`}>
                    {item.status === 'processed' ? '已处理' : '待处理'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#52525B]">{new Date(item.createdAt).toLocaleString('zh-CN')}</span>
                  <button onClick={() => handleDelete(item.id)} className="text-[#52525B] hover:text-[#EF4444]"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <p className="text-sm text-[#A1A1AA] mb-2">{item.description}</p>
              {item.contact && <p className="text-xs text-[#52525B] mb-2">联系方式: {item.contact}</p>}
              {item.status === 'pending' && (
                <div className="mt-3 space-y-2">
                  {noteInputId === item.id ? (
                    <>
                      <input value={adminNote} onChange={e => setAdminNote(e.target.value)}
                        placeholder="处理备注..."
                        className="w-full px-3 py-2 rounded bg-[#0A0A0B] border border-[#27272A] text-sm" />
                      <div className="flex gap-2">
                        <button onClick={() => handleMarkProcessed(item.id)}
                          className="px-4 py-2 rounded bg-[#10B981] text-[#0A0A0B] text-sm font-medium">确认处理</button>
                        <button onClick={() => setNoteInputId(null)}
                          className="px-4 py-2 rounded bg-[#1A1A1D] text-sm">取消</button>
                      </div>
                    </>
                  ) : (
                    <button onClick={() => setNoteInputId(item.id)}
                      className="flex items-center gap-2 text-xs text-[#10B981] hover:underline">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 标记已处理
                    </button>
                  )}
                </div>
              )}
              {item.adminNote && (
                <div className="mt-2 p-2 rounded bg-[#10B981]/5 border border-[#10B981]/20 text-xs text-[#10B981]">
                  处理备注: {item.adminNote}
                </div>
              )}
            </motion.div>
          ))}
          {filtered.length === 0 && <div className="text-center py-12 text-[#52525B]">暂无反馈</div>}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: 提交**

```bash
git add app/admin app/api/admin components/admin-auth.tsx
git commit -m "feat: 管理后台 — 口令认证 + 材质管理 + 反馈管理"
```

---

### Task 12: 更新主页面路由 — 串起所有组件

**Files:**
- Modify: `app/page.tsx`
- Modify: `components/dashboard.tsx`

- [ ] **Step 1: 更新 page.tsx 路由**

文件: `app/page.tsx` (重写)

```tsx
'use client'

import { useState, useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'
import { Dashboard } from '@/components/dashboard'
import { DetailedWizard } from '@/components/detailed-wizard'
import { ExpertMatrix } from '@/components/expert-matrix'
import { ResultPage } from '@/components/result-page'
import { Encyclopedia } from '@/components/encyclopedia'
import { History } from '@/components/history'
import { AIChat } from '@/components/ai-chat'
import { PhotoLog } from '@/components/photo-log'
import { FeedbackForm } from '@/components/feedback-form'
import { FeedbackHistory } from '@/components/feedback-history'
import { PageType, DetectionResult, PlasticMaterial } from '@/lib/types'
import { getHistory, addHistory, clearHistory } from '@/lib/storage'

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

export default function Home() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard')
  const [detectionHistory, setDetectionHistory] = useState<DetectionResult[]>([])
  const [currentResult, setCurrentResult] = useState<DetectionResult | null>(null)
  const [materials, setMaterials] = useState<PlasticMaterial[]>([])

  useEffect(() => {
    setDetectionHistory(getHistory())
    fetch('/api/materials').then(r => r.json()).then(setMaterials)
  }, [])

  const navigateTo = useCallback((page: PageType) => setCurrentPage(page), [])

  const handleDetectionComplete = useCallback((result: DetectionResult) => {
    setCurrentResult(result)
    addHistory(result)
    setDetectionHistory(getHistory())
    setCurrentPage('result')
  }, [])

  const handleExportLog = useCallback(() => {
    if (detectionHistory.length === 0) { toast.error('暂无记录可导出'); return }
    const text = detectionHistory.map(r =>
      `${r.material.name} (${r.material.slang}) | ${r.confidence}% | ${new Date(r.timestamp).toLocaleString('zh-CN')} | ${r.matchedFeatures.join('、')}`
    ).join('\n')
    navigator.clipboard.writeText(text)
    toast.success('已复制到剪贴板')
  }, [detectionHistory])

  const handleViewHistoryResult = useCallback((result: DetectionResult) => {
    setCurrentResult(result)
    setCurrentPage('result')
  }, [])

  const handleClearHistory = useCallback(() => {
    clearHistory()
    setDetectionHistory([])
  }, [])

  return (
    <main className="min-h-screen bg-[#0A0A0B]">
      <AnimatePresence mode="wait">
        <motion.div key={currentPage} variants={pageVariants} initial="initial" animate="animate" exit="exit"
          transition={{ duration: 0.25, ease: 'easeInOut' }} className="min-h-screen">
          {currentPage === 'dashboard' && (
            <Dashboard onNavigate={navigateTo} onExportLog={handleExportLog} historyCount={detectionHistory.length} />
          )}
          {currentPage === 'wizard' && (
            <DetailedWizard onNavigate={navigateTo} onComplete={handleDetectionComplete} materials={materials} />
          )}
          {currentPage === 'expert' && (
            <ExpertMatrix onNavigate={navigateTo} onComplete={handleDetectionComplete} />
          )}
          {currentPage === 'result' && currentResult && (
            <ResultPage result={currentResult} onNavigate={navigateTo}
              onSave={() => toast.success('结果已保存')} onExport={handleExportLog} />
          )}
          {currentPage === 'encyclopedia' && (
            <Encyclopedia onNavigate={navigateTo} materials={materials} />
          )}
          {currentPage === 'history' && (
            <History onNavigate={navigateTo} history={detectionHistory} onViewResult={handleViewHistoryResult} onClear={handleClearHistory} />
          )}
          {currentPage === 'ai-chat' && (
            <AIChat onNavigate={navigateTo} />
          )}
          {currentPage === 'photo-log' && (
            <PhotoLog onNavigate={navigateTo} />
          )}
          {currentPage === 'feedback-form' && (
            <FeedbackForm onNavigate={navigateTo} />
          )}
          {currentPage === 'feedback-history' && (
            <FeedbackHistory onNavigate={navigateTo} />
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  )
}
```

- [ ] **Step 2: 更新 Dashboard 组件 — 激活 AI 聊天和拍照入口**

修改文件: `components/dashboard.tsx`，将 actionCards 中的 AI 和拍照入口从 disabled 改为可用：

```tsx
const actionCards = [
  {
    id: 'ai',
    title: 'AI 咨询',
    subtitle: 'DeepSeek 智能识别',
    icon: MessageSquare,
    page: 'ai-chat' as PageType,
  },
  {
    id: 'wizard',
    title: '详细检测',
    subtitle: '分步决策逻辑 (含补偿机制)',
    icon: Search,
    page: 'wizard' as PageType,
  },
  {
    id: 'expert',
    title: '专家模式',
    subtitle: '快速标签矩阵 (火星/声音/纹理)',
    icon: Zap,
    page: 'expert' as PageType,
  },
  {
    id: 'camera',
    title: '拍照存样',
    subtitle: '拍摄并备注',
    icon: Camera,
    page: 'photo-log' as PageType,
  },
]
```

同时在 Dashboard 的 header 区域添加反馈入口（在设置按钮旁边）：

```tsx
<button 
  onClick={() => onNavigate('feedback-form')}
  className="p-2.5 rounded-lg bg-[#1A1A1D] hover:bg-[#27272A] transition-colors duration-250 active:scale-95"
  title="反馈"
>
  <MessageSquare className="w-5 h-5" />
</button>
```

在 footer 区域添加反馈历史链接：

```tsx
<button 
  onClick={() => onNavigate('feedback-history')}
  className="flex items-center gap-1.5 hover:text-[#F5F5F5] transition-colors"
>
  <Clock className="w-3.5 h-3.5" />
  我的反馈
</button>
```

- [ ] **Step 3: 更新 ExpertMatrix 以支持新的 expertTags 数据**

修改文件 `components/expert-matrix.tsx`，将 import 从 `@/lib/plastic-data` 改为 `@/lib/wizard-data`：

```tsx
import { expertTags } from '@/lib/wizard-data'
```

- [ ] **Step 4: 提交**

```bash
git add app/page.tsx components/dashboard.tsx components/expert-matrix.tsx
git commit -m "feat: 串接所有页面路由 — Dashboard激活入口 + 新页面接入"
```

---

### Task 13: 清理旧代码 + 验证

**Files:**
- Remove: `components/dictionary-history.tsx` 中的百科/历史代码（已被拆分，可删除或标记废弃）
- Modify: `lib/plastic-data.ts` — 保留类型导出指向 `lib/types.ts`

- [ ] **Step 1: 更新 plastic-data.ts 为兼容导出**

文件: `lib/plastic-data.ts` (重写为类型重导出)

```typescript
// 旧类型重导出，保持向后兼容
// 所有数据已迁移到 data/materials.json 和 lib/wizard-data.ts
export type { PlasticMaterial, DetectionResult, WizardQuestion } from './types'
export { expertTags } from './wizard-data'
export { branchQuestions } from './wizard-data'
```

- [ ] **Step 2: 安装依赖并验证构建**

```bash
cd /home/andy/plastic-material-id
npm install
```

```bash
npm run build 2>&1
```

- [ ] **Step 3: 修复任何构建错误** — 根据编译输出逐项修复未使用的 import、类型不匹配等问题

- [ ] **Step 4: 启动开发服务器验证**

```bash
npm run dev
```

验证清单：
- [ ] 首页 Dashboard 四个入口卡片均可点击
- [ ] 详细检测：选择测试方式 → 答题 → 跳过 → 补偿机制 → 查看结果
- [ ] 专家模式：勾选标签 → 预测结果
- [ ] AI 聊天：发送消息 → 收到回复 → 快捷标签可用
- [ ] 百科字典：搜索 → 展开详情
- [ ] 历史记录：查看 → 导出 → 清空
- [ ] 拍照存样：拍照/上传 → 保存 → 删除
- [ ] 反馈：提交 → 查看反馈历史
- [ ] 管理后台：`/admin` 登录 → 材质增删改 → 反馈标记处理

- [ ] **Step 5: 提交最终修复**

```bash
git add -A && git commit -m "chore: 清理旧代码，验证构建通过"
```

---

## 自检

**Spec 覆盖：**
- 分支检测流程 → Task 6
- AI 聊天 → Task 7
- 20+ 材质数据库 → Task 1 Step 3
- localStorage 持久化 → Task 3
- 拍照存样 → Task 9 Step 2
- 百科/历史拆分 → Task 8 + Task 9 Step 1
- 管理后台（材质管理 + 反馈管理 + 口令保护） → Task 11
- 用户反馈系统（提交 + 查看历史 + 处理状态） → Task 10 + Task 11 Step 5

**无占位符：** 所有步骤包含完整代码或具体命令

**类型一致性：** `lib/types.ts` 中定义了所有共享类型，后续任务全部引用同一套类型定义
