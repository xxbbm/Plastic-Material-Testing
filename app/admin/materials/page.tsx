'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Search, Pencil, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import type { PlasticMaterial } from '@/lib/types'

const defaultMaterial: PlasticMaterial = {
  id: '',
  name: '',
  fullName: '',
  slang: '',
  density: 0,
  characteristics: [],
  burnCharacteristics: [],
  physicalCharacteristics: [],
  densityCharacteristics: [],
  safetyLevel: 'safe',
  safetyWarning: '',
  currentPrice: 0,
  priceUnit: '元/吨',
  priceChange: 0,
}

const safetyLevelMap: Record<string, { label: string; color: string }> = {
  safe: { label: '安全', color: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30' },
  caution: { label: '注意', color: 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30' },
  danger: { label: '危险', color: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30' },
}

export default function MaterialsAdmin() {
  const [materials, setMaterials] = useState<PlasticMaterial[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<PlasticMaterial>({ ...defaultMaterial })
  const [saving, setSaving] = useState(false)

  const fetchMaterials = useCallback(async () => {
    try {
      const res = await fetch('/api/materials')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setMaterials(data)
    } catch {
      toast.error('加载材质列表失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMaterials()
  }, [fetchMaterials])

  const filtered = materials.filter(m => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      m.name.toLowerCase().includes(q) ||
      m.fullName.toLowerCase().includes(q) ||
      m.slang.toLowerCase().includes(q)
    )
  })

  const openCreate = () => {
    setEditingMaterial({ ...defaultMaterial, id: `mat-${Date.now()}` })
    setShowModal(true)
  }

  const openEdit = (mat: PlasticMaterial) => {
    setEditingMaterial({ ...mat })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingMaterial({ ...defaultMaterial })
  }

  const handleSave = async () => {
    if (!editingMaterial.id.trim() || !editingMaterial.name.trim()) {
      toast.error('ID 和名称不能为空')
      return
    }
    setSaving(true)
    try {
      const existing = materials.find(m => m.id === editingMaterial.id)
      const method = existing ? 'PUT' : 'POST'
      const url = existing ? `/api/materials/${editingMaterial.id}` : '/api/materials'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingMaterial),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || '保存失败')
      }
      toast.success(existing ? '材质已更新' : '材质已添加')
      closeModal()
      fetchMaterials()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : '操作失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除该材质吗？此操作不可撤销。')) return
    try {
      const res = await fetch(`/api/materials/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || '删除失败')
      }
      toast.success('材质已删除')
      fetchMaterials()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : '删除失败')
    }
  }

  const updateField = (field: keyof PlasticMaterial, value: any) => {
    setEditingMaterial(prev => ({ ...prev, [field]: value }))
  }

  const parseCommaSeparated = (value: string): string[] => {
    return value.split(',').map(s => s.trim()).filter(Boolean)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin" className="p-2 rounded-lg bg-[#1A1A1D] hover:bg-[#27272A]">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">材质管理</h1>
          <span className="text-sm text-[#71717A] ml-auto">{materials.length} 项</span>
        </div>

        {/* Toolbar */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525B]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索材质名称、全称、俗称..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#111113] border border-[#27272A] text-sm placeholder:text-[#52525B] focus:outline-none focus:border-[#10B981]/50"
            />
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#10B981] text-[#0A0A0B] font-medium text-sm active:scale-95 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            新增
          </button>
        </div>

        {/* Materials List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[#52525B] text-sm">
            {search.trim() ? '没有匹配的材质' : '暂无材质数据，点击「新增」添加'}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(mat => {
              const sl = safetyLevelMap[mat.safetyLevel] || safetyLevelMap.safe
              return (
                <div
                  key={mat.id}
                  className="p-4 rounded-lg bg-[#111113] border border-[#27272A] flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{mat.name}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded border ${sl.color}`}
                      >
                        {sl.label}
                      </span>
                    </div>
                    <div className="text-xs text-[#71717A] mt-0.5 truncate">
                      {mat.slang ? `俗称: ${mat.slang}` : mat.fullName}
                      {mat.currentPrice ? ` · ¥${mat.currentPrice}/${mat.priceUnit}` : ''}
                    </div>
                  </div>
                  <button
                    onClick={() => openEdit(mat)}
                    className="p-2 rounded-lg hover:bg-[#27272A] text-[#52525B] hover:text-[#F5F5F5] shrink-0"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(mat.id)}
                    className="p-2 rounded-lg hover:bg-[#7F1D1D]/30 text-[#52525B] hover:text-[#EF4444] shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-start justify-center pt-12 pb-12 overflow-y-auto"
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="w-full max-w-lg mx-4 bg-[#0A0A0B] border border-[#27272A] rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">
                {materials.find(m => m.id === editingMaterial.id) ? '编辑材质' : '新增材质'}
              </h2>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-[#27272A]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {/* 提示：新增材质不会自动出现在检测向导和专家模式中 */}
              {editingMaterial.id && !['pc','abs','pc-abs','pp-abs','transparent-abs','pom','pp','pe','hdpe','ldpe','pa','ps','pet','pvc','pmma','fr-abs','lead-filled','stone-filled','pla','pbt','pc-pbt','pa-abs','asa','hips'].includes(editingMaterial.id) && (
                <div className="p-3 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B] text-xs leading-relaxed">
                  新增材质会出现在百科字典中，但不会出现在「详细检测」和「专家模式」的权重匹配中。如需加入检测引擎，请在 <code className="text-[#F59E0B] bg-[#F59E0B]/10 px-1 rounded">lib/wizard-data.ts</code> 中添加对应权重。
                </div>
              )}
              {/* ID */}
              <Field label="ID" required>
                <input
                  type="text"
                  value={editingMaterial.id}
                  onChange={e => updateField('id', e.target.value)}
                  disabled={!!materials.find(m => m.id === editingMaterial.id)}
                  className="w-full px-3 py-2 rounded-lg bg-[#111113] border border-[#27272A] text-sm placeholder:text-[#52525B] focus:outline-none focus:border-[#10B981]/50 disabled:opacity-50"
                />
              </Field>

              {/* Name */}
              <Field label="名称" required>
                <input
                  type="text"
                  value={editingMaterial.name}
                  onChange={e => updateField('name', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#111113] border border-[#27272A] text-sm placeholder:text-[#52525B] focus:outline-none focus:border-[#10B981]/50"
                />
              </Field>

              {/* Full Name */}
              <Field label="全称">
                <input
                  type="text"
                  value={editingMaterial.fullName}
                  onChange={e => updateField('fullName', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#111113] border border-[#27272A] text-sm placeholder:text-[#52525B] focus:outline-none focus:border-[#10B981]/50"
                />
              </Field>

              {/* Slang */}
              <Field label="俗称">
                <input
                  type="text"
                  value={editingMaterial.slang}
                  onChange={e => updateField('slang', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#111113] border border-[#27272A] text-sm placeholder:text-[#52525B] focus:outline-none focus:border-[#10B981]/50"
                />
              </Field>

              {/* Density */}
              <Field label="密度 (g/cm3)">
                <input
                  type="number"
                  step="0.01"
                  value={editingMaterial.density}
                  onChange={e => updateField('density', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-[#111113] border border-[#27272A] text-sm placeholder:text-[#52525B] focus:outline-none focus:border-[#10B981]/50"
                />
              </Field>

              {/* Safety Level */}
              <Field label="安全等级">
                <select
                  value={editingMaterial.safetyLevel}
                  onChange={e => updateField('safetyLevel', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#111113] border border-[#27272A] text-sm focus:outline-none focus:border-[#10B981]/50"
                >
                  <option value="safe">安全</option>
                  <option value="caution">注意</option>
                  <option value="danger">危险</option>
                </select>
              </Field>

              {/* Current Price */}
              <Field label="参考价格">
                <input
                  type="number"
                  step="0.01"
                  value={editingMaterial.currentPrice || ''}
                  onChange={e => updateField('currentPrice', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg bg-[#111113] border border-[#27272A] text-sm placeholder:text-[#52525B] focus:outline-none focus:border-[#10B981]/50"
                />
              </Field>

              {/* Characteristics */}
              <Field label="特性 (逗号分隔)">
                <textarea
                  value={editingMaterial.characteristics.join(', ')}
                  onChange={e => updateField('characteristics', parseCommaSeparated(e.target.value))}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-[#111113] border border-[#27272A] text-sm placeholder:text-[#52525B] focus:outline-none focus:border-[#10B981]/50 resize-none"
                />
              </Field>

              {/* Burn Characteristics */}
              <Field label="燃烧特性 (逗号分隔)">
                <textarea
                  value={editingMaterial.burnCharacteristics.join(', ')}
                  onChange={e => updateField('burnCharacteristics', parseCommaSeparated(e.target.value))}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-[#111113] border border-[#27272A] text-sm placeholder:text-[#52525B] focus:outline-none focus:border-[#10B981]/50 resize-none"
                />
              </Field>

              {/* Physical Characteristics */}
              <Field label="物理特性 (逗号分隔)">
                <textarea
                  value={editingMaterial.physicalCharacteristics.join(', ')}
                  onChange={e => updateField('physicalCharacteristics', parseCommaSeparated(e.target.value))}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-[#111113] border border-[#27272A] text-sm placeholder:text-[#52525B] focus:outline-none focus:border-[#10B981]/50 resize-none"
                />
              </Field>

              {/* Safety Warning */}
              <Field label="安全警告">
                <textarea
                  value={editingMaterial.safetyWarning || ''}
                  onChange={e => updateField('safetyWarning', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-[#111113] border border-[#27272A] text-sm placeholder:text-[#52525B] focus:outline-none focus:border-[#10B981]/50 resize-none"
                />
              </Field>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 rounded-lg border border-[#27272A] text-sm hover:bg-[#1A1A1D] transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-lg bg-[#10B981] text-[#0A0A0B] font-medium text-sm active:scale-95 transition-all disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-[#71717A] mb-1 block">
        {label}{required && <span className="text-[#EF4444] ml-0.5">*</span>}
      </span>
      {children}
    </label>
  )
}
