'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Home, CheckCircle2, Circle } from 'lucide-react'
import { PageType } from '@/app/page'
import { FeedbackEntry } from '@/lib/types'
import { getUserId } from '@/lib/storage'
import { cn } from '@/lib/utils'

interface FeedbackHistoryProps {
  onNavigate: (page: PageType) => void
}

const typeLabels: Record<FeedbackEntry['type'], string> = {
  unknown_material: '未知材质',
  inaccurate_result: '结果不准确',
  bug_report: 'Bug 报告',
}

const typeColors: Record<FeedbackEntry['type'], string> = {
  unknown_material: 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/30',
  inaccurate_result: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30',
  bug_report: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30',
}

export function FeedbackHistory({ onNavigate }: FeedbackHistoryProps) {
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await fetch(`/api/feedback?userId=${getUserId()}`)
        if (res.ok) {
          const data: FeedbackEntry[] = await res.json()
          setFeedback(data)
        }
      } catch {
        // silently fail, show empty state
      } finally {
        setLoading(false)
      }
    }
    fetchFeedback()
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0B]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 border-b border-[#27272A]">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#10B981]" />
          <h1 className="text-lg font-bold">我的反馈</h1>
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
        {loading ? (
          <div className="text-center py-12">
            <p className="text-[#52525B]">加载中...</p>
          </div>
        ) : feedback.length > 0 ? (
          <div className="space-y-2">
            {feedback.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-xl bg-[#111113] border border-[#27272A]"
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-xs font-medium border',
                      typeColors[entry.type]
                    )}
                  >
                    {typeLabels[entry.type]}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {entry.status === 'processed' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                        <span className="text-xs text-[#10B981]">已处理</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-4 h-4 text-[#F59E0B]" />
                        <span className="text-xs text-[#F59E0B]">待处理</span>
                      </>
                    )}
                  </div>
                </div>

                <p className="text-xs text-[#52525B] mb-2">
                  {new Date(entry.createdAt).toLocaleDateString('zh-CN')}
                </p>

                <p className="text-sm text-[#D4D4D8] leading-relaxed">
                  {entry.description}
                </p>

                {entry.adminNote && entry.status === 'processed' && (
                  <div className="mt-3 p-3 rounded-lg bg-[#10B981]/10 border border-[#10B981]/20">
                    <p className="text-xs font-medium text-[#10B981] mb-1">
                      💬 管理员回复：
                    </p>
                    <p className="text-sm text-[#D4D4D8] leading-relaxed">
                      {entry.adminNote}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-[#27272A] mx-auto mb-3" />
            <p className="text-[#52525B]">暂无反馈记录</p>
          </div>
        )}
      </div>
    </div>
  )
}
