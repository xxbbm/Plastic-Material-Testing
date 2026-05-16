'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  Search,
  BookOpen,
  AlertTriangle,
  Flame,
  Scale,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { PageType, PlasticMaterial } from '@/lib/types'
import { cn } from '@/lib/utils'

interface EncyclopediaProps {
  onNavigate: (page: PageType) => void
  materials: PlasticMaterial[]
}

function getSafetyIcon(level: string) {
  switch (level) {
    case 'danger':
      return <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
    case 'caution':
      return <Flame className="w-4 h-4 text-[#F59E0B]" />
    default:
      return <Scale className="w-4 h-4 text-[#10B981]" />
  }
}

export function Encyclopedia({ onNavigate, materials }: EncyclopediaProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filteredMaterials = materials.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.slang.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0B]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 border-b border-[#27272A]">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#10B981]" />
          <h1 className="text-lg font-bold text-[#F5F5F5]">材料百科</h1>
        </div>
        <button
          onClick={() => onNavigate('dashboard')}
          className="p-2 rounded-lg bg-[#1A1A1D] hover:bg-[#27272A] transition-colors duration-250 active:scale-95"
        >
          <Home className="w-5 h-5 text-[#F5F5F5]" />
        </button>
      </header>

      {/* Search Bar */}
      <div className="px-4 pt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525B]" />
          <input
            type="text"
            placeholder="搜索材料名称或行业术语..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#111113] border border-[#27272A] text-sm text-[#F5F5F5] placeholder:text-[#52525B] focus:outline-none focus:border-[#10B981]/50 transition-colors"
          />
        </div>
      </div>

      {/* Material List */}
      <div className="flex-1 px-4 py-4 overflow-y-auto">
        <div className="space-y-2">
          <AnimatePresence>
            {filteredMaterials.map((material, index) => {
              const isExpanded = expandedId === material.id
              const isDanger = material.safetyLevel === 'danger'
              const isCaution = material.safetyLevel === 'caution'

              return (
                <motion.div
                  key={material.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'rounded-xl border transition-all duration-250',
                    isDanger
                      ? 'bg-[#111113] border-[#EF4444]/30 hover:border-[#EF4444]/50'
                      : 'bg-[#111113] border-[#27272A] hover:border-[#3F3F46]'
                  )}
                >
                  {/* Card Header (always visible) */}
                  <button
                    onClick={() => toggleExpand(material.id)}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={cn(
                              'text-lg font-bold',
                              isDanger
                                ? 'text-[#EF4444]'
                                : 'text-[#F5F5F5]'
                            )}
                          >
                            {material.name}
                          </span>
                          <span className="text-sm text-[#71717A] truncate">
                            {material.fullName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2 py-0.5 rounded text-xs bg-[#1A1A1D] text-[#A1A1AA]">
                            {material.slang}
                          </span>
                          {getSafetyIcon(material.safetyLevel)}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {material.characteristics.slice(0, 3).map(
                            (char, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 rounded text-[11px] bg-[#0A0A0B] text-[#71717A]"
                              >
                                {char}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                      <div className="flex items-start gap-2 ml-3 shrink-0">
                        {material.currentPrice && (
                          <div className="text-right">
                            <div className="text-sm font-semibold text-[#F5F5F5]">
                              ¥
                              {(material.currentPrice / 1000).toFixed(1)}k
                            </div>
                            <div className="text-[10px] text-[#52525B]">
                              /吨
                            </div>
                          </div>
                        )}
                        <div className="pt-0.5">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-[#52525B]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[#52525B]" />
                          )}
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Expanded Detail Section */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-4 border-t border-[#27272A] pt-4">
                          {/* 基本特征 */}
                          {material.characteristics.length > 0 && (
                            <div>
                              <h4 className="text-xs font-medium text-[#71717A] mb-2">
                                基本特征
                              </h4>
                              <div className="flex flex-wrap gap-1.5">
                                {material.characteristics.map((char, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-1 rounded text-[11px] bg-[#1A1A1D] text-[#A1A1AA]"
                                  >
                                    {char}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 燃烧特征 */}
                          {material.burnCharacteristics.length > 0 && (
                            <div>
                              <h4 className="text-xs font-medium text-[#F59E0B] mb-2">
                                燃烧特征
                              </h4>
                              <div className="flex flex-wrap gap-1.5">
                                {material.burnCharacteristics.map((char, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-1 rounded text-[11px] bg-[#F59E0B]/10 text-[#F59E0B]"
                                  >
                                    {char}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 物理特征 */}
                          {material.physicalCharacteristics.length > 0 && (
                            <div>
                              <h4 className="text-xs font-medium text-[#10B981] mb-2">
                                物理特征
                              </h4>
                              <div className="flex flex-wrap gap-1.5">
                                {material.physicalCharacteristics.map(
                                  (char, i) => (
                                    <span
                                      key={i}
                                      className="px-2 py-1 rounded text-[11px] bg-[#10B981]/10 text-[#10B981]"
                                    >
                                      {char}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          {/* Safety Warning */}
                          {material.safetyWarning && (
                            <div
                              className={cn(
                                'p-3 rounded-lg border text-sm',
                                isDanger
                                  ? 'bg-[#EF4444]/5 border-[#EF4444]/20 text-[#EF4444]'
                                  : 'bg-[#F59E0B]/5 border-[#F59E0B]/20 text-[#F59E0B]'
                              )}
                            >
                              <div className="flex items-start gap-2">
                                {isDanger ? (
                                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                ) : (
                                  <Flame className="w-4 h-4 shrink-0 mt-0.5" />
                                )}
                                <span>{material.safetyWarning}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {/* Empty State */}
          {filteredMaterials.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Search className="w-12 h-12 text-[#27272A] mx-auto mb-3" />
              <p className="text-[#52525B]">未找到匹配的材料</p>
              <p className="text-xs text-[#3F3F46] mt-1">
                试试其他关键词
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
