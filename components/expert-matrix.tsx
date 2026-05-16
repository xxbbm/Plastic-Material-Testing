'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Home, RotateCcw, Check } from 'lucide-react'
import { PageType } from '@/app/page'
import { expertTags, plasticMaterials, DetectionResult } from '@/lib/plastic-data'
import { cn } from '@/lib/utils'

interface ExpertMatrixProps {
  onNavigate: (page: PageType) => void
  onComplete: (result: DetectionResult) => void
}

export function ExpertMatrix({ onNavigate, onComplete }: ExpertMatrixProps) {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => {
      const newSet = new Set(prev)
      if (newSet.has(tagId)) {
        newSet.delete(tagId)
      } else {
        newSet.add(tagId)
      }
      return newSet
    })
  }

  const resetSelection = () => {
    setSelectedTags(new Set())
  }

  // Calculate results based on selected tags
  const { confidence, topMaterial, matchedFeatures } = useMemo(() => {
    const scores: Record<string, number> = {}
    const features: string[] = []
    
    // Initialize scores
    plasticMaterials.forEach(m => {
      scores[m.id] = 0
    })

    // Calculate scores based on selected tags
    Object.values(expertTags).forEach(category => {
      category.forEach(tag => {
        if (selectedTags.has(tag.id)) {
          features.push(tag.label)
          Object.entries(tag.weight).forEach(([materialId, weight]) => {
            scores[materialId] = (scores[materialId] || 0) + weight
          })
        }
      })
    })

    // Find top material
    let maxScore = 0
    let topId = 'pc'
    Object.entries(scores).forEach(([id, score]) => {
      if (score > maxScore) {
        maxScore = score
        topId = id
      }
    })

    // Calculate confidence
    const selectedCount = selectedTags.size
    const baseConfidence = selectedCount > 0 ? (maxScore / (selectedCount * 3)) * 100 : 0
    const finalConfidence = Math.min(100, Math.max(0, baseConfidence))

    return {
      confidence: Math.round(finalConfidence),
      topMaterial: plasticMaterials.find(m => m.id === topId) || plasticMaterials[0],
      matchedFeatures: features,
    }
  }, [selectedTags])

  const handleComplete = () => {
    if (selectedTags.size === 0) return

    const result: DetectionResult = {
      id: `det-${Date.now()}`,
      material: topMaterial,
      confidence,
      matchedFeatures,
      timestamp: new Date(),
    }
    
    onComplete(result)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0B]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 border-b border-[#27272A]">
        <h1 className="text-lg font-bold">专家模式</h1>
        <div className="flex items-center gap-2">
          <button 
            onClick={resetSelection}
            disabled={selectedTags.size === 0}
            className={cn(
              "p-2 rounded-lg transition-all duration-250",
              selectedTags.size === 0 
                ? "opacity-40 cursor-not-allowed bg-[#1A1A1D]" 
                : "bg-[#1A1A1D] hover:bg-[#27272A] active:scale-95"
            )}
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onNavigate('dashboard')}
            className="p-2 rounded-lg bg-[#1A1A1D] hover:bg-[#27272A] transition-colors duration-250 active:scale-95"
          >
            <Home className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Current Prediction */}
      {selectedTags.size > 0 && (
        <div className="px-4 pt-4">
          <div className="p-3 rounded-lg bg-[#111113] border border-[#27272A]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#71717A]">预测结果:</span>
                <span className={cn(
                  "font-semibold",
                  topMaterial.safetyLevel === 'danger' ? "text-[#EF4444]" : "text-[#10B981]"
                )}>
                  {topMaterial.name}
                </span>
                <span className="text-[#71717A]">({topMaterial.slang})</span>
              </div>
              <span className={cn(
                "text-sm font-semibold",
                confidence >= 70 ? "text-[#10B981]" : confidence >= 40 ? "text-[#F59E0B]" : "text-[#71717A]"
              )}>
                {confidence}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tag Matrix */}
      <div className="flex-1 px-4 py-4 overflow-y-auto">
        {Object.entries(expertTags).map(([category, tags]) => (
          <div key={category} className="mb-6">
            <h3 className="text-sm font-semibold text-[#71717A] mb-3 uppercase tracking-wider">
              {category}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {tags.map(tag => {
                const isSelected = selectedTags.has(tag.id)
                return (
                  <motion.button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "relative flex items-center justify-center px-3 py-3 rounded-lg border text-sm font-medium transition-all duration-250",
                      isSelected
                        ? "bg-[#10B981]/10 border-[#10B981] text-[#10B981]"
                        : "bg-[#111113] border-[#27272A] text-[#A1A1AA] hover:border-[#3F3F46] hover:text-[#F5F5F5]"
                    )}
                  >
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                    )}
                    {tag.label}
                  </motion.button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Count & Complete Button */}
      <div className="px-4 pb-4 space-y-3">
        <div className="flex items-center justify-between text-sm text-[#71717A]">
          <span>已选择 {selectedTags.size} 个特征</span>
          {matchedFeatures.length > 0 && (
            <span className="text-xs truncate max-w-[60%] text-right">
              {matchedFeatures.slice(0, 3).join('、')}{matchedFeatures.length > 3 && '...'}
            </span>
          )}
        </div>
        <button
          onClick={handleComplete}
          disabled={selectedTags.size === 0}
          className={cn(
            "w-full py-4 rounded-xl font-semibold text-base transition-all duration-250",
            selectedTags.size === 0
              ? "bg-[#27272A] text-[#71717A] cursor-not-allowed"
              : "bg-[#10B981] text-[#0A0A0B] hover:bg-[#10B981]/90 active:scale-[0.98]"
          )}
        >
          确认识别结果
        </button>
      </div>
    </div>
  )
}
