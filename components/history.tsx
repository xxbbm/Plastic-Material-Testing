'use client'

import { motion } from 'framer-motion'
import { Clock, Home, ChevronRight, Download, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageType } from '@/app/page'
import { DetectionResult } from '@/lib/plastic-data'
import { exportToClipboard } from '@/lib/storage'
import { cn } from '@/lib/utils'

interface HistoryProps {
  onNavigate: (page: PageType) => void
  history: DetectionResult[]
  onViewResult: (result: DetectionResult) => void
  onClear: () => void
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function History({ onNavigate, history, onViewResult, onClear }: HistoryProps) {
  const handleExport = () => {
    exportToClipboard(history)
    toast.success('已复制到剪贴板')
  }

  const handleClear = () => {
    if (confirm('确认清空所有检测记录？此操作不可撤销。')) {
      onClear()
      toast.success('记录已清空')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0B]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 border-b border-[#27272A]">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#10B981]" />
          <h1 className="text-lg font-bold">检测记录</h1>
        </div>
        <button
          onClick={() => onNavigate('dashboard')}
          className="p-2 rounded-lg bg-[#1A1A1D] hover:bg-[#27272A] transition-colors duration-250 active:scale-95"
        >
          <Home className="w-5 h-5" />
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 py-4 overflow-y-auto">
        {history.length > 0 ? (
          <div className="space-y-2">
            {history.map((record, index) => (
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
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm',
                        record.material.safetyLevel === 'danger'
                          ? 'bg-[#EF4444]/10 text-[#EF4444]'
                          : 'bg-[#10B981]/10 text-[#10B981]'
                      )}
                    >
                      {record.material.name}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{record.material.fullName}</span>
                        <span
                          className={cn(
                            'text-xs',
                            record.confidence >= 70
                              ? 'text-[#10B981]'
                              : record.confidence >= 40
                                ? 'text-[#F59E0B]'
                                : 'text-[#71717A]'
                          )}
                        >
                          {record.confidence}%
                        </span>
                      </div>
                      <div className="text-xs text-[#52525B] mt-0.5">
                        {formatDate(new Date(record.timestamp))}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#52525B]" />
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-[#27272A] mx-auto mb-3" />
            <p className="text-[#52525B]">暂无检测记录</p>
          </div>
        )}
      </div>

      {/* Footer actions */}
      {history.length > 0 && (
        <footer className="px-4 py-3 border-t border-[#27272A] bg-[#111113]">
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#1A1A1D] border border-[#27272A] hover:border-[#3F3F46] text-sm font-medium transition-all duration-250 active:scale-95"
            >
              <Download className="w-4 h-4" />
              导出记录
            </button>
            <button
              onClick={handleClear}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 hover:bg-[#EF4444]/20 hover:border-[#EF4444]/50 text-sm font-medium text-[#EF4444] transition-all duration-250 active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              清空记录
            </button>
          </div>
        </footer>
      )}
    </div>
  )
}
