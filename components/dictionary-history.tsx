'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Home, 
  Search,
  Clock,
  BookOpen,
  ChevronRight,
  AlertTriangle,
  Flame,
  Scale
} from 'lucide-react'
import { PageType } from '@/lib/types'
import { plasticMaterials, DetectionResult } from '@/lib/plastic-data'
import { cn } from '@/lib/utils'

interface DictionaryHistoryProps {
  onNavigate: (page: PageType) => void
  history: DetectionResult[]
  onViewResult: (result: DetectionResult) => void
}

type TabType = 'dictionary' | 'history'

export function DictionaryHistory({ onNavigate, history, onViewResult }: DictionaryHistoryProps) {
  const [activeTab, setActiveTab] = useState<TabType>('dictionary')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredMaterials = plasticMaterials.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.slang.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const getSafetyIcon = (level: string) => {
    switch (level) {
      case 'danger':
        return <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
      case 'caution':
        return <Flame className="w-4 h-4 text-[#F59E0B]" />
      default:
        return <Scale className="w-4 h-4 text-[#10B981]" />
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0B]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 border-b border-[#27272A]">
        <h1 className="text-lg font-bold">百科与记录</h1>
        <button 
          onClick={() => onNavigate('dashboard')}
          className="p-2 rounded-lg bg-[#1A1A1D] hover:bg-[#27272A] transition-colors duration-250 active:scale-95"
        >
          <Home className="w-5 h-5" />
        </button>
      </header>

      {/* Tab Switcher */}
      <div className="px-4 pt-4">
        <div className="flex p-1 rounded-lg bg-[#111113] border border-[#27272A]">
          <button
            onClick={() => setActiveTab('dictionary')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all duration-250",
              activeTab === 'dictionary'
                ? "bg-[#1A1A1D] text-[#F5F5F5]"
                : "text-[#71717A] hover:text-[#A1A1AA]"
            )}
          >
            <BookOpen className="w-4 h-4" />
            材料百科
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all duration-250",
              activeTab === 'history'
                ? "bg-[#1A1A1D] text-[#F5F5F5]"
                : "text-[#71717A] hover:text-[#A1A1AA]"
            )}
          >
            <Clock className="w-4 h-4" />
            检测记录
            {history.length > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#10B981] text-[#0A0A0B]">
                {history.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search Bar (Dictionary only) */}
      {activeTab === 'dictionary' && (
        <div className="px-4 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525B]" />
            <input
              type="text"
              placeholder="搜索材料名称或行业术语..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#111113] border border-[#27272A] text-sm placeholder:text-[#52525B] focus:outline-none focus:border-[#10B981]/50 transition-colors"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 px-4 py-4 overflow-y-auto">
        {activeTab === 'dictionary' ? (
          <div className="space-y-2">
            {filteredMaterials.map((material, index) => (
              <motion.div
                key={material.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "p-4 rounded-xl border transition-all duration-250",
                  material.safetyLevel === 'danger'
                    ? "bg-[#111113] border-[#EF4444]/30 hover:border-[#EF4444]/50"
                    : "bg-[#111113] border-[#27272A] hover:border-[#3F3F46]"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "text-lg font-bold",
                        material.safetyLevel === 'danger' ? "text-[#EF4444]" : "text-[#F5F5F5]"
                      )}>
                        {material.name}
                      </span>
                      <span className="text-sm text-[#71717A]">
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
                      {material.characteristics.slice(0, 3).map((char, i) => (
                        <span 
                          key={i}
                          className="px-2 py-1 rounded text-[11px] bg-[#0A0A0B] text-[#71717A]"
                        >
                          {char}
                        </span>
                      ))}
                    </div>
                  </div>
                  {material.currentPrice && (
                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        ¥{(material.currentPrice / 1000).toFixed(1)}k
                      </div>
                      <div className="text-[10px] text-[#52525B]">/吨</div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {filteredMaterials.length === 0 && (
              <div className="text-center py-12 text-[#52525B]">
                未找到匹配的材料
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {history.length > 0 ? (
              history.map((record, index) => (
                <motion.button
                  key={record.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onViewResult(record)}
                  className="w-full p-4 rounded-xl bg-[#111113] border border-[#27272A] hover:border-[#3F3F46] transition-all duration-250 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center font-bold",
                        record.material.safetyLevel === 'danger'
                          ? "bg-[#EF4444]/10 text-[#EF4444]"
                          : "bg-[#10B981]/10 text-[#10B981]"
                      )}>
                        {record.material.name}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{record.material.fullName}</span>
                          <span className={cn(
                            "text-xs",
                            record.confidence >= 70 ? "text-[#10B981]" : record.confidence >= 40 ? "text-[#F59E0B]" : "text-[#71717A]"
                          )}>
                            {record.confidence}%
                          </span>
                        </div>
                        <div className="text-xs text-[#52525B] mt-0.5">
                          {formatDate(record.timestamp)}
                        </div>
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
                <p className="text-xs text-[#3F3F46] mt-1">完成检测后记录将显示在这里</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
