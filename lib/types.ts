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
