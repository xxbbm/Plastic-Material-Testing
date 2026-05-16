'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  Save, 
  Download, 
  RotateCcw, 
  AlertTriangle,
  Skull,
  X,
  Check,
  Flame,
  Eye,
  EyeOff
} from 'lucide-react'
import { PageType } from '@/lib/types'
import { DetectionResult } from '@/lib/plastic-data'
import { cn } from '@/lib/utils'

interface ResultPageProps {
  result: DetectionResult
  onNavigate: (page: PageType) => void
  onSave: () => void
  onExport: () => void
}

export function ResultPage({ result, onNavigate, onSave, onExport }: ResultPageProps) {
  const [showSafetyOverlay, setShowSafetyOverlay] = useState(
    result.material.safetyLevel === 'danger'
  )
  const [safetAcknowledged, setSafetyAcknowledged] = useState(false)

  const isDangerous = result.material.safetyLevel === 'danger'
  const isCaution = result.material.safetyLevel === 'caution'

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  return (
    <>
      {/* Safety Overlay for POM */}
      <AnimatePresence>
        {showSafetyOverlay && isDangerous && !safetAcknowledged && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#EF4444] flex flex-col items-center justify-center p-6 animate-pulse-danger"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center text-center max-w-sm"
            >
              <div className="mb-6 p-4 rounded-full bg-white/10">
                <Skull className="w-16 h-16 text-white" />
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-2">
                危险警告
              </h1>
              
              <h2 className="text-xl font-semibold text-white/90 mb-4">
                检测到 POM (赛钢)
              </h2>
              
              <div className="space-y-3 mb-8 text-white/90">
                <div className="flex items-start gap-3 text-left">
                  <EyeOff className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p className="text-sm leading-relaxed">
                    燃烧时火焰几乎不可见，极易造成烫伤
                  </p>
                </div>
                <div className="flex items-start gap-3 text-left">
                  <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p className="text-sm leading-relaxed">
                    释放有毒甲醛气体，必须在通风环境下操作
                  </p>
                </div>
                <div className="flex items-start gap-3 text-left">
                  <Flame className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p className="text-sm leading-relaxed">
                    持续燃烧，难以熄灭，请准备灭火器材
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSafetyAcknowledged(true)
                  setShowSafetyOverlay(false)
                }}
                className="w-full py-4 rounded-xl bg-white text-[#EF4444] font-bold text-base transition-all duration-250 active:scale-[0.98]"
              >
                我已了解风险，继续查看
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen flex flex-col bg-[#0A0A0B]">
        {/* Header */}
        <header className={cn(
          "flex items-center justify-between px-4 py-4 border-b",
          isDangerous ? "border-[#EF4444]/30 bg-[#EF4444]/5" : "border-[#27272A]"
        )}>
          <h1 className="text-lg font-bold">识别结果</h1>
          <button 
            onClick={() => onNavigate('dashboard')}
            className="p-2 rounded-lg bg-[#1A1A1D] hover:bg-[#27272A] transition-colors duration-250 active:scale-95"
          >
            <Home className="w-5 h-5" />
          </button>
        </header>

        {/* Result Content */}
        <div className="flex-1 px-4 py-6 overflow-y-auto">
          {/* Material Header */}
          <div className="text-center mb-6">
            <motion.h2 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn(
                "text-5xl font-bold mb-2",
                isDangerous ? "text-[#EF4444]" : "text-[#10B981]"
              )}
            >
              {result.material.name}
            </motion.h2>
            <p className="text-lg text-[#A1A1AA] mb-2">
              {result.material.fullName}
            </p>
            <div className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
              isDangerous 
                ? "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30"
                : "bg-[#1A1A1D] text-[#A1A1AA] border border-[#27272A]"
            )}>
              <span>行业黑话:</span>
              <span className="font-semibold">{result.material.slang}</span>
            </div>
          </div>

          {/* Confidence */}
          <div className="mb-6 p-4 rounded-xl bg-[#111113] border border-[#27272A]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#71717A]">置信度</span>
              <span className={cn(
                "text-lg font-bold",
                result.confidence >= 70 ? "text-[#10B981]" : result.confidence >= 40 ? "text-[#F59E0B]" : "text-[#71717A]"
              )}>
                {result.confidence}%
              </span>
            </div>
            <div className="h-2 bg-[#1A1A1D] rounded-full overflow-hidden">
              <motion.div 
                className={cn(
                  "h-full rounded-full",
                  result.confidence >= 70 ? "bg-[#10B981]" : result.confidence >= 40 ? "bg-[#F59E0B]" : "bg-[#3F3F46]"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${result.confidence}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Safety Warning */}
          {(isDangerous || isCaution) && result.material.safetyWarning && (
            <div className={cn(
              "mb-6 p-4 rounded-xl border",
              isDangerous 
                ? "bg-[#EF4444]/10 border-[#EF4444]/30" 
                : "bg-[#F59E0B]/10 border-[#F59E0B]/30"
            )}>
              <div className="flex items-start gap-3">
                <AlertTriangle className={cn(
                  "w-5 h-5 mt-0.5 flex-shrink-0",
                  isDangerous ? "text-[#EF4444]" : "text-[#F59E0B]"
                )} />
                <div>
                  <h4 className={cn(
                    "font-semibold mb-1",
                    isDangerous ? "text-[#EF4444]" : "text-[#F59E0B]"
                  )}>
                    {isDangerous ? '安全警告' : '注意事项'}
                  </h4>
                  <p className={cn(
                    "text-sm leading-relaxed",
                    isDangerous ? "text-[#EF4444]/80" : "text-[#F59E0B]/80"
                  )}>
                    {result.material.safetyWarning}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Matched Features */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[#71717A] mb-3 uppercase tracking-wider">
              匹配特征
            </h3>
            <div className="space-y-2">
              {result.matchedFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#111113] border border-[#27272A]"
                >
                  <Check className="w-4 h-4 text-[#10B981]" />
                  <span className="text-sm">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Material Characteristics */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[#71717A] mb-3 uppercase tracking-wider">
              材质特性
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.material.characteristics.map((char, index) => (
                <span 
                  key={index}
                  className="px-3 py-1.5 rounded-full text-xs bg-[#1A1A1D] border border-[#27272A] text-[#A1A1AA]"
                >
                  {char}
                </span>
              ))}
            </div>
          </div>

          {/* Price Info */}
          {result.material.currentPrice && (
            <div className="mb-6 p-4 rounded-xl bg-[#111113] border border-[#27272A]">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#71717A]">当前市场参考价</span>
                <div className="text-right">
                  <span className="text-lg font-bold">
                    ¥{result.material.currentPrice.toLocaleString()}
                  </span>
                  <span className="text-xs text-[#71717A] ml-1">
                    /{result.material.priceUnit.replace('元/', '')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div className="text-center text-xs text-[#52525B]">
            检测时间: {formatDate(result.timestamp)}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onSave}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#111113] border border-[#27272A] font-medium text-sm transition-all duration-250 hover:bg-[#1A1A1D] active:scale-[0.98]"
            >
              <Save className="w-4 h-4" />
              保存结果
            </button>
            <button
              onClick={onExport}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#111113] border border-[#27272A] font-medium text-sm transition-all duration-250 hover:bg-[#1A1A1D] active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              导出日志
            </button>
          </div>
          <button
            onClick={() => onNavigate('wizard')}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-[#10B981] text-[#0A0A0B] font-semibold text-base transition-all duration-250 hover:bg-[#10B981]/90 active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4" />
            重新检测
          </button>
        </div>
      </div>
    </>
  )
}
