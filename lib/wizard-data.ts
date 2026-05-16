import { WizardQuestion, ExpertTagCategory } from './types'

// 20 materials: pc, abs, pc-abs, pp-abs, transparent-abs, pom, pp, pe, hdpe, ldpe,
//               pa, ps, pet, pvc, pmma, fr-abs, lead-filled, stone-filled, pla, pbt

export const branchQuestions: WizardQuestion[] = [
  // ════════════════════ 火烧分支 (4 questions) ════════════════════
  {
    id: 'burn-spark',
    question: '火烧后火星走向？',
    tip: 'PC 火星聚拢；ABS/合金/PS 火花散开；PE/PP/POM/PVC/PA/PET/PMMA/PLA/PBT 几乎无火星',
    branch: 'burn',
    options: [
      {
        label: '向中间聚拢', value: 'spark-gather',
        weight: { pc: 5, pmma: 1 },
      },
      {
        label: '向四周散开', value: 'spark-spread',
        weight: { abs: 4, 'pc-abs': 3, 'pp-abs': 3, 'transparent-abs': 3, 'fr-abs': 3, ps: 3 },
      },
      {
        label: '几乎无火星', value: 'spark-none',
        weight: {
          pp: 4, pe: 4, hdpe: 4, ldpe: 4,
          pom: 4, pvc: 4,
          'lead-filled': 4, 'stone-filled': 4,
          pa: 4, pet: 4, pmma: 4, pla: 4, pbt: 4,
        },
      },
    ],
  },
  {
    id: 'flame-color',
    question: '火焰颜色？',
    tip: 'PVC 火焰带绿边；PA 蓝色顶黄色底；PMMA 蓝色顶白色；POM 黄色带蓝；PE/PP 黄色明亮',
    branch: 'burn',
    options: [
      {
        label: '明亮黄色火焰', value: 'flame-yellow',
        weight: {
          pp: 3, pe: 3, hdpe: 3, ldpe: 3,
          ps: 2, pla: 3, abs: 3, pc: 3,
          pet: 2, pbt: 3, pa: 2, pvc: 2,
          'fr-abs': 3, pom: 2,
        },
      },
      {
        label: '淡蓝/几乎不可见', value: 'flame-invisible',
        weight: { 'lead-filled': 5, 'stone-filled': 5 },
      },
      {
        label: '蓝色火焰明显', value: 'flame-blue',
        weight: { pa: 4, pmma: 3, pom: 2 },
      },
      {
        label: '黄色带绿边', value: 'flame-green-edge',
        weight: { pvc: 5 },
      },
    ],
  },
  {
    id: 'smoke',
    question: '燃烧时烟雾情况？',
    tip: 'ABS/PS/透明ABS 浓黑烟；PMMA/POM 几乎无烟；PVC 白烟；PE/PP 少烟白烟',
    branch: 'burn',
    options: [
      {
        label: '浓黑烟', value: 'smoke-heavy',
        weight: {
          abs: 4, ps: 5, 'transparent-abs': 4,
          'fr-abs': 3, pc: 3,
          'pc-abs': 2, 'pp-abs': 2,
        },
      },
      {
        label: '中等黑烟', value: 'smoke-medium',
        weight: {
          'pc-abs': 3, pet: 2, 'pp-abs': 1,
        },
      },
      {
        label: '无烟或少烟/白烟', value: 'smoke-light',
        weight: {
          pp: 4, pe: 4, hdpe: 4, ldpe: 4,
          pmma: 5, pom: 5,
          pla: 3, 'lead-filled': 4, 'stone-filled': 4,
          pa: 3, pbt: 3, pvc: 3, pet: 1, pc: 1,
        },
      },
    ],
  },
  {
    id: 'smell',
    question: '气味感受？',
    tip: 'PE/PP 蜡烛/柴油味（香）；PC/PMMA 花果甜香；PS 苯乙烯甜味；ABS 橡胶臭；PA 烧毛发臭；POM 甲醛刺鼻；PVC 盐酸刺鼻',
    branch: 'burn',
    options: [
      {
        label: '香的/不刺鼻/蜡烛味', value: 'smell-pleasant',
        weight: {
          pp: 4, pe: 4, hdpe: 4, ldpe: 4,
          pc: 4, pmma: 4,
          ps: 3, pet: 3, pla: 3, pbt: 3,
          'lead-filled': 1, 'stone-filled': 1,
        },
      },
      {
        label: '橡胶/臭味/焦味', value: 'smell-rubber',
        weight: {
          abs: 5, pa: 4,
          'fr-abs': 3, 'pp-abs': 3, 'transparent-abs': 3,
          'pc-abs': 2,
        },
      },
      {
        label: '极度刺鼻（辣眼）', value: 'smell-pungent',
        weight: { pom: 5, pvc: 5 },
      },
      {
        label: '无法形容/跳过', value: 'smell-skip',
        weight: { 'lead-filled': 1, 'stone-filled': 1 },
      },
    ],
  },
  // ════════════════════ 物理分支 (4 questions) ════════════════════
  {
    id: 'sound',
    question: '敲击样品的声音？',
    tip: '金属脆声 = PC/POM/PMMA/PS/PET/PA/PLA/PBT；沉闷声 = ABS/PP/PE/合金；死沉无声 = 石头料/加铅',
    branch: 'physical',
    options: [
      {
        label: '金属脆声/清脆', value: 'sound-crisp',
        weight: {
          pc: 4, pom: 4, pmma: 4, ps: 4,
          pet: 4, pa: 4, pla: 4, pbt: 4,
        },
      },
      {
        label: '沉闷声/低沉', value: 'sound-dull',
        weight: {
          abs: 4, pp: 4, pe: 4, hdpe: 4, ldpe: 4,
          'pc-abs': 3, 'pp-abs': 3, 'transparent-abs': 3, 'fr-abs': 3,
        },
      },
      {
        label: '死沉无声', value: 'sound-dead',
        weight: { 'lead-filled': 5, 'stone-filled': 5, pvc: 1 },
      },
    ],
  },
  {
    id: 'bend',
    question: '弯折测试结果？',
    tip: '折痕发白 = ABS/合金；折痕不变色 = PC/POM/PA/PBT/PET/PVC/FR-ABS；可弯折不断 = PE/PP；易碎 = PS/PMMA/PLA/石头料',
    branch: 'physical',
    options: [
      {
        label: '折痕发白', value: 'bend-white',
        weight: {
          abs: 4, 'pp-abs': 4,
          'pc-abs': 3, 'transparent-abs': 3,
        },
      },
      {
        label: '折痕不变色', value: 'bend-normal',
        weight: {
          pc: 4,
          pom: 3, pa: 3, pbt: 3, pet: 3, pvc: 3, 'fr-abs': 3,
        },
      },
      {
        label: '可大幅弯折不断', value: 'bend-flexible',
        weight: {
          pp: 5, pe: 5, hdpe: 4, ldpe: 4,
        },
      },
      {
        label: '易碎/断裂', value: 'bend-brittle',
        weight: {
          ps: 4, pmma: 4, pla: 4,
          'lead-filled': 4, 'stone-filled': 4,
        },
      },
    ],
  },
  {
    id: 'surface',
    question: '表面纹理和手感？',
    tip: '光滑光泽 = PC/PMMA/PET/POM/PA/PBT；哑光 = ABS/FR-ABS/PVC/合金；蜡质油滑 = PE/PP；木质裂纹 = 加铅/石头料',
    branch: 'physical',
    options: [
      {
        label: '光滑有光泽', value: 'surface-glossy',
        weight: {
          pc: 4, pmma: 4, pet: 4,
          pom: 3, pa: 3, pbt: 3,
          pla: 1,
        },
      },
      {
        label: '哑光质感', value: 'surface-matte',
        weight: {
          abs: 4, 'fr-abs': 4, pvc: 3,
          'pc-abs': 2, 'pp-abs': 2, 'transparent-abs': 2,
        },
      },
      {
        label: '蜡质/油滑感', value: 'surface-waxy',
        weight: {
          pp: 5, pe: 5, hdpe: 4, ldpe: 4,
        },
      },
      {
        label: '木质纹理/裂纹/粗糙', value: 'surface-wood',
        weight: { 'lead-filled': 5, 'stone-filled': 5 },
      },
    ],
  },
  {
    id: 'weight',
    question: '相对重量感受？',
    tip: '异常沉重 = POM/加铅/石头料/PVC；异常轻/浮水 = PP/PE；其余为常规重量',
    branch: 'physical',
    options: [
      {
        label: '异常沉重', value: 'weight-heavy',
        weight: {
          pom: 4, 'lead-filled': 5, 'stone-filled': 5, pvc: 3,
        },
      },
      {
        label: '常规重量', value: 'weight-normal',
        weight: {
          pc: 3, abs: 3, 'pc-abs': 3, 'pp-abs': 3, 'transparent-abs': 3,
          pa: 3, ps: 3, pmma: 3, pet: 3, 'fr-abs': 3, pla: 3, pbt: 3,
        },
      },
      {
        label: '异常轻（可浮水）', value: 'weight-light',
        weight: {
          pp: 5, pe: 5, hdpe: 4, ldpe: 4,
        },
      },
    ],
  },
]

export const expertTags: ExpertTagCategory = {
  '燃烧特征': [
    { id: 'spark-gather', label: '火星聚拢', weight: { pc: 4 } },
    { id: 'spark-spread', label: '火星散开', weight: { abs: 4, 'pc-abs': 3, 'pp-abs': 3, 'transparent-abs': 3, 'fr-abs': 3, ps: 3 } },
    { id: 'flame-invisible', label: '火焰不可见/极微弱', weight: { 'lead-filled': 5, 'stone-filled': 5 } },
    { id: 'smoke-heavy', label: '浓黑烟', weight: { abs: 4, ps: 5, 'transparent-abs': 4, 'fr-abs': 3 } },
    { id: 'flame-blue', label: '蓝色火焰', weight: { pa: 4, pmma: 3, pom: 2 } },
    { id: 'flame-green-edge', label: '火焰绿边', weight: { pvc: 5 } },
    { id: 'self-extinguish', label: '离火即灭', weight: { pvc: 5, 'fr-abs': 5, pbt: 4, pc: 2, pa: 2, pet: 2 } },
    { id: 'candle-smell', label: '蜡烛/石蜡味', weight: { pe: 4, hdpe: 4, ldpe: 4, pp: 3 } },
    { id: 'rubber-smell', label: '橡胶臭味', weight: { abs: 5, pa: 4, 'fr-abs': 3, 'pp-abs': 3, 'transparent-abs': 3, 'pc-abs': 2 } },
    { id: 'pungent-smell', label: '刺鼻辣眼', weight: { pom: 5, pvc: 5 } },
    { id: 'sweet-smell', label: '甜味/果香', weight: { pc: 4, pmma: 4, ps: 3, pla: 3, pet: 2, pbt: 2 } },
  ],
  '物理感官': [
    { id: 'sound-crisp', label: '金属脆声', weight: { pc: 4, pom: 4, pmma: 4, ps: 4, pet: 4, pa: 4, pla: 4, pbt: 4 } },
    { id: 'sound-dull', label: '沉闷声', weight: { abs: 4, pp: 4, pe: 4, hdpe: 4, ldpe: 4, 'pc-abs': 3, 'pp-abs': 3, 'transparent-abs': 3, 'fr-abs': 3 } },
    { id: 'sound-dead', label: '敲击死沉', weight: { 'lead-filled': 5, 'stone-filled': 5 } },
    { id: 'texture-waxy', label: '蜡质手感', weight: { pp: 5, pe: 5, hdpe: 4, ldpe: 4 } },
    { id: 'bend-white', label: '折痕发白', weight: { abs: 4, 'pp-abs': 4, 'transparent-abs': 3, 'pc-abs': 3 } },
    { id: 'bend-flexible', label: '可弯折不断', weight: { pp: 5, pe: 5, hdpe: 4, ldpe: 4 } },
    { id: 'texture-glossy', label: '高光泽', weight: { pc: 4, pmma: 4, pet: 4, pom: 3, pa: 3, pbt: 3 } },
    { id: 'brittle', label: '易碎', weight: { ps: 4, pmma: 4, pla: 4, 'lead-filled': 4, 'stone-filled': 4 } },
    { id: 'wood-texture', label: '木质纹理', weight: { 'lead-filled': 5, 'stone-filled': 5 } },
    { id: 'matte-surface', label: '哑光表面', weight: { abs: 4, 'fr-abs': 4, pvc: 3, 'pc-abs': 2, 'pp-abs': 2, 'transparent-abs': 2 } },
  ],
  '重量密度': [
    { id: 'weight-heavy', label: '异常沉重', weight: { pom: 4, 'lead-filled': 5, 'stone-filled': 5, pvc: 3 } },
    { id: 'weight-normal', label: '常规重量', weight: { pc: 3, abs: 3, 'pc-abs': 3, 'pp-abs': 3, 'transparent-abs': 3, pa: 3, ps: 3, pmma: 3, pet: 3, 'fr-abs': 3, pla: 3, pbt: 3 } },
    { id: 'weight-light', label: '异常轻/浮水', weight: { pp: 5, pe: 5, hdpe: 4, ldpe: 4 } },
    { id: 'sinks-in-water', label: '沉水', weight: { 'lead-filled': 5, 'stone-filled': 5, pom: 4, pvc: 4, pet: 3, pc: 2, pa: 2, ps: 2, pmma: 2, pbt: 2, pla: 2, abs: 2, 'pc-abs': 2, 'pp-abs': 2, 'transparent-abs': 2, 'fr-abs': 2 } },
  ],
  '外观特征': [
    { id: 'transparent-high', label: '高透明', weight: { pc: 4, pmma: 4, pet: 3, ps: 3 } },
    { id: 'transparent-medium', label: '半透明', weight: { pp: 2, pe: 2, hdpe: 2, ldpe: 2, pla: 2, pa: 2 } },
    { id: 'opaque', label: '不透明', weight: { abs: 4, 'fr-abs': 4, pbt: 4, 'lead-filled': 4, 'stone-filled': 4, pom: 3, pvc: 3, 'pc-abs': 3, 'pp-abs': 3, 'transparent-abs': 2 } },
    { id: 'self-lubricating', label: '自润滑', weight: { pom: 4, pa: 3, pbt: 3 } },
    { id: 'white-ivory', label: '乳白/象牙白', weight: { pom: 3, pa: 3, pbt: 3, abs: 2, pla: 2, pp: 2, pe: 2, hdpe: 2, ldpe: 2 } },
  ],
}
