// Plastic material types and identification data

export interface PlasticMaterial {
  id: string
  name: string
  fullName: string
  slang: string // 行业黑话
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
  options: {
    label: string
    value: string
    weight: Record<string, number> // material id -> weight
  }[]
  comparisonImages?: {
    left: { url: string; label: string }
    right: { url: string; label: string }
  }
}

export const plasticMaterials: PlasticMaterial[] = [
  {
    id: 'pc',
    name: 'PC',
    fullName: '聚碳酸酯',
    slang: '磁碳',
    characteristics: ['透明度高', '耐冲击', '耐热性好'],
    burnCharacteristics: ['火星聚拢', '慢速燃烧', '有轻微黑烟'],
    physicalCharacteristics: ['金属脆声', '表面光滑', '折痕不发白'],
    densityCharacteristics: ['常规重量'],
    safetyLevel: 'safe',
    currentPrice: 15800,
    priceUnit: '元/吨',
    priceChange: 1.2,
  },
  {
    id: 'abs',
    name: 'ABS',
    fullName: '丙烯腈-丁二烯-苯乙烯',
    slang: '啊B死',
    characteristics: ['不透明', '韧性好', '易加工'],
    burnCharacteristics: ['火星散开', '快速燃烧', '浓黑烟', '刺鼻气味'],
    physicalCharacteristics: ['沉闷声', '表面哑光', '折痕发白'],
    densityCharacteristics: ['常规重量'],
    safetyLevel: 'caution',
    safetyWarning: '燃烧时产生刺鼻气味，注意通风',
    currentPrice: 12500,
    priceUnit: '元/吨',
    priceChange: -0.8,
  },
  {
    id: 'pc-abs',
    name: 'PC/ABS',
    fullName: 'PC/ABS合金',
    slang: '合金料',
    characteristics: ['兼具PC和ABS特性', '平衡性好'],
    burnCharacteristics: ['火星散开', '中速燃烧', '黑烟中等'],
    physicalCharacteristics: ['介于金属声和沉闷声之间'],
    densityCharacteristics: ['常规重量'],
    safetyLevel: 'safe',
    currentPrice: 14200,
    priceUnit: '元/吨',
    priceChange: 0.5,
  },
  {
    id: 'pom',
    name: 'POM',
    fullName: '聚甲醛',
    slang: '赛钢',
    characteristics: ['乳白色', '自润滑', '耐磨'],
    burnCharacteristics: ['火焰几乎不可见', '蓝色淡火焰', '持续燃烧', '有甲醛气味'],
    physicalCharacteristics: ['金属脆声', '蜡质手感', '表面有光泽'],
    densityCharacteristics: ['异常沉重'],
    safetyLevel: 'danger',
    safetyWarning: '极度危险！燃烧时火焰几乎不可见，释放有毒甲醛气体。必须在通风环境下操作，避免吸入。',
    currentPrice: 16500,
    priceUnit: '元/吨',
    priceChange: 0.3,
  },
  {
    id: 'pp',
    name: 'PP',
    fullName: '聚丙烯',
    slang: '百折胶',
    characteristics: ['半透明', '耐化学', '密度最低'],
    burnCharacteristics: ['火星少', '明亮火焰', '蜡烛味', '无烟或少烟'],
    physicalCharacteristics: ['沉闷声', '蜡质手感', '可弯折不断'],
    densityCharacteristics: ['异常轻'],
    safetyLevel: 'safe',
    currentPrice: 8200,
    priceUnit: '元/吨',
    priceChange: -1.5,
  },
  {
    id: 'pe',
    name: 'PE',
    fullName: '聚乙烯',
    slang: '花料',
    characteristics: ['半透明', '柔软', '耐腐蚀'],
    burnCharacteristics: ['火星少', '明亮火焰', '蜡烛味', '滴落'],
    physicalCharacteristics: ['沉闷声', '蜡质手感', '表面较滑'],
    densityCharacteristics: ['异常轻'],
    safetyLevel: 'safe',
    currentPrice: 8800,
    priceUnit: '元/吨',
    priceChange: -0.5,
  },
  {
    id: 'pa',
    name: 'PA',
    fullName: '尼龙',
    slang: '尼龙',
    characteristics: ['乳白色', '耐磨', '高强度'],
    burnCharacteristics: ['蓝色火焰', '有毛发烧焦味', '滴落拉丝'],
    physicalCharacteristics: ['金属脆声', '表面略有光泽'],
    densityCharacteristics: ['常规重量'],
    safetyLevel: 'caution',
    safetyWarning: '燃烧时滴落物温度高，注意防护',
    currentPrice: 22000,
    priceUnit: '元/吨',
    priceChange: 2.1,
  },
  {
    id: 'pmma',
    name: 'PMMA',
    fullName: '亚克力',
    slang: '亚克力',
    characteristics: ['高透明', '硬脆', '光学级'],
    burnCharacteristics: ['明亮火焰', '噼啪声', '果香味', '无烟'],
    physicalCharacteristics: ['金属脆声', '透明如玻璃', '易碎'],
    densityCharacteristics: ['常规重量'],
    safetyLevel: 'safe',
    currentPrice: 18500,
    priceUnit: '元/吨',
    priceChange: 0.8,
  },
]

export const wizardQuestions: WizardQuestion[] = [
  {
    id: 'burn-spark',
    question: '观察火烧后的碳化物火星走向？',
    tip: 'PC 火星聚拢，合金散开。',
    options: [
      { label: '火星聚拢', value: 'spark-gather', weight: { pc: 3, pmma: 1 } },
      { label: '火星散开', value: 'spark-spread', weight: { abs: 3, 'pc-abs': 2 } },
      { label: '几乎无火星', value: 'spark-none', weight: { pp: 2, pe: 2, pom: 1 } },
    ],
  },
  {
    id: 'flame-visibility',
    question: '火焰是否可见？',
    tip: 'POM(赛钢)燃烧时火焰几乎不可见，极度危险！',
    options: [
      { label: '火焰明显可见', value: 'flame-visible', weight: { abs: 2, pc: 2, pp: 2, pe: 2 } },
      { label: '火焰淡蓝/几乎不可见', value: 'flame-invisible', weight: { pom: 5 } },
      { label: '火焰蓝色明显', value: 'flame-blue', weight: { pa: 3 } },
    ],
  },
  {
    id: 'smoke',
    question: '燃烧时烟雾情况？',
    tip: 'ABS 燃烧会产生浓厚黑烟。',
    options: [
      { label: '浓黑烟', value: 'smoke-heavy', weight: { abs: 3 } },
      { label: '中等黑烟', value: 'smoke-medium', weight: { 'pc-abs': 2, pc: 1 } },
      { label: '无烟或少烟', value: 'smoke-light', weight: { pp: 2, pe: 2, pmma: 2, pom: 1 } },
    ],
  },
  {
    id: 'sound',
    question: '敲击样品的声音？',
    tip: '金属脆声通常代表硬质塑料。',
    options: [
      { label: '金属脆声', value: 'sound-crisp', weight: { pc: 2, pom: 2, pmma: 2, pa: 2 } },
      { label: '沉闷声', value: 'sound-dull', weight: { abs: 2, pp: 2, pe: 2 } },
      { label: '介于两者之间', value: 'sound-medium', weight: { 'pc-abs': 2 } },
    ],
  },
  {
    id: 'texture',
    question: '表面纹理和手感？',
    tip: '蜡质手感通常为PP或PE。',
    options: [
      { label: '光滑有光泽', value: 'texture-glossy', weight: { pc: 2, pmma: 2, pom: 1 } },
      { label: '哑光质感', value: 'texture-matte', weight: { abs: 2, 'pc-abs': 1 } },
      { label: '蜡质/油滑感', value: 'texture-waxy', weight: { pp: 3, pe: 3 } },
    ],
  },
  {
    id: 'bend',
    question: '折弯测试结果？',
    tip: '折痕发白是ABS的典型特征。',
    options: [
      { label: '折痕发白', value: 'bend-white', weight: { abs: 3 } },
      { label: '折痕不变色', value: 'bend-normal', weight: { pc: 2, 'pc-abs': 1, pom: 1 } },
      { label: '可大幅弯折不断', value: 'bend-flexible', weight: { pp: 3, pe: 2 } },
      { label: '易碎/断裂', value: 'bend-brittle', weight: { pmma: 3 } },
    ],
  },
  {
    id: 'weight',
    question: '样品相对重量感受？',
    tip: 'POM异常沉重，PP/PE异常轻。',
    options: [
      { label: '异常沉重', value: 'weight-heavy', weight: { pom: 3 } },
      { label: '常规重量', value: 'weight-normal', weight: { pc: 1, abs: 1, 'pc-abs': 1, pa: 1, pmma: 1 } },
      { label: '异常轻', value: 'weight-light', weight: { pp: 3, pe: 3 } },
    ],
  },
]

export const expertTags = {
  燃烧特征: [
    { id: 'spark-gather', label: '火星聚拢', weight: { pc: 3, pmma: 1 } },
    { id: 'spark-spread', label: '火星散开', weight: { abs: 3, 'pc-abs': 2 } },
    { id: 'flame-invisible', label: '火焰不可见', weight: { pom: 5 } },
    { id: 'smoke-heavy', label: '浓黑烟', weight: { abs: 3 } },
    { id: 'flame-blue', label: '蓝色火焰', weight: { pa: 3, pom: 2 } },
    { id: 'smell-formaldehyde', label: '甲醛气味', weight: { pom: 4 } },
  ],
  物理感官: [
    { id: 'sound-crisp', label: '金属脆声', weight: { pc: 2, pom: 2, pmma: 2, pa: 2 } },
    { id: 'sound-dull', label: '沉闷声', weight: { abs: 2, pp: 2, pe: 2 } },
    { id: 'texture-waxy', label: '蜡质手感', weight: { pp: 3, pe: 3, pom: 1 } },
    { id: 'bend-white', label: '折痕发白', weight: { abs: 3 } },
    { id: 'texture-glossy', label: '高光泽', weight: { pc: 2, pmma: 2 } },
    { id: 'brittle', label: '易碎', weight: { pmma: 3 } },
  ],
  重量密度: [
    { id: 'weight-heavy', label: '异常沉重', weight: { pom: 3 } },
    { id: 'weight-normal', label: '常规重量', weight: { pc: 1, abs: 1, 'pc-abs': 1, pa: 1, pmma: 1 } },
    { id: 'weight-light', label: '异常轻', weight: { pp: 3, pe: 3 } },
  ],
  特殊特征: [
    { id: 'transparent', label: '高透明', weight: { pc: 2, pmma: 3 } },
    { id: 'opaque', label: '不透明', weight: { abs: 2, pom: 1 } },
    { id: 'semi-transparent', label: '半透明', weight: { pp: 2, pe: 2 } },
    { id: 'self-lubricating', label: '自润滑', weight: { pom: 2 } },
  ],
}

// Market price data for ticker
export const marketPrices = [
  { name: 'ABS', price: 12500, change: -0.8, unit: '元/吨' },
  { name: 'PC', price: 15800, change: 1.2, unit: '元/吨' },
  { name: 'PC/ABS', price: 14200, change: 0.5, unit: '元/吨' },
  { name: 'PP', price: 8200, change: -1.5, unit: '元/吨' },
  { name: 'PE', price: 8800, change: -0.5, unit: '元/吨' },
  { name: 'POM', price: 16500, change: 0.3, unit: '元/吨' },
  { name: 'PA', price: 22000, change: 2.1, unit: '元/吨' },
  { name: 'PMMA', price: 18500, change: 0.8, unit: '元/吨' },
]
