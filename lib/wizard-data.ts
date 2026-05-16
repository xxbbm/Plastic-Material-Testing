import { WizardQuestion, ExpertTagCategory } from './types'

export const branchQuestions: WizardQuestion[] = [
  // 火烧分支 (4 questions)
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
  // 物理分支 (4 questions)
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
