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
