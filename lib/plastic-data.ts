// Compatibility re-exports — data migrated to data/materials.json and lib/wizard-data.ts

import type { PlasticMaterial, DetectionResult, WizardQuestion, MarketPrice } from './types'
import materialsJson from '../data/materials.json'

// Re-export types
export type { PlasticMaterial, DetectionResult, WizardQuestion }

// Re-export wizard data
export { expertTags, branchQuestions } from './wizard-data'

// Materials data — loaded from data/materials.json, cast to match the PlasticMaterial interface
export const plasticMaterials: PlasticMaterial[] = materialsJson as PlasticMaterial[]

// Market price ticker — derived from materials data
export const marketPrices: MarketPrice[] = plasticMaterials
  .filter(m => m.currentPrice != null)
  .map(m => ({
    name: m.name,
    price: m.currentPrice!,
    change: m.priceChange || 0,
    unit: m.priceUnit,
  }))
