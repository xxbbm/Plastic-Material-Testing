'use client'

import { useState, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Home, Send } from 'lucide-react'
import { toast } from 'sonner'
import { PageType } from '@/lib/types'
import { getUserId } from '@/lib/storage'
import { cn } from '@/lib/utils'

interface FeedbackFormProps {
  onNavigate: (page: PageType) => void
}

type FeedbackType = 'unknown_material' | 'inaccurate_result' | 'bug_report'

const typeOptions: { value: FeedbackType; label: string }[] = [
  { value: 'unknown_material', label: '未知材质' },
  { value: 'inaccurate_result', label: '结果不准确' },
  { value: 'bug_report', label: 'Bug 报告' },
]

export function FeedbackForm({ onNavigate }: FeedbackFormProps) {
  const [type, setType] = useState<FeedbackType>('unknown_material')
  const [description, setDescription] = useState('')
  const [contact, setContact] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = description.trim().length > 0 && !submitting

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: getUserId(),
          type,
          description: description.trim(),
          contact: contact.trim() || undefined,
        }),
      })

      if (!res.ok) throw new Error('提交失败')

      toast.success('反馈已提交，感谢！')
      setDescription('')
      setContact('')
      setType('unknown_material')
    } catch {
      toast.error('提交失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0B]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 border-b border-[#27272A]">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#10B981]" />
          <h1 className="text-lg font-bold">提交反馈</h1>
        </div>
        <button
          onClick={() => onNavigate('dashboard')}
          className="p-2 rounded-lg bg-[#1A1A1D] hover:bg-[#27272A] transition-colors duration-250 active:scale-95"
        >
          <Home className="w-5 h-5" />
        </button>
      </header>

      {/* Form */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Selector */}
          <div>
            <label className="block text-sm font-medium text-[#A1A1AA] mb-3">
              反馈类型
            </label>
            <div className="grid grid-cols-3 gap-2">
              {typeOptions.map((opt) => (
                <motion.button
                  key={opt.value}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setType(opt.value)}
                  className={cn(
                    'py-3 px-2 rounded-lg border text-sm font-medium transition-all duration-250',
                    type === opt.value
                      ? 'bg-[#10B981]/10 border-[#10B981] text-[#10B981]'
                      : 'bg-[#111113] border-[#27272A] text-[#A1A1AA] hover:border-[#3F3F46]'
                  )}
                >
                  {opt.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#A1A1AA] mb-3">
              描述 <span className="text-[#EF4444]">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="请描述你遇到的材质特征或问题..."
              className="w-full px-4 py-3 rounded-lg bg-[#111113] border border-[#27272A] text-sm text-[#F5F5F5] placeholder:text-[#52525B] focus:outline-none focus:border-[#10B981] transition-colors duration-250 resize-none"
            />
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-medium text-[#A1A1AA] mb-3">
              联系方式 <span className="text-[#52525B]">（选填）</span>
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="微信号或手机号，方便我们回复"
              className="w-full px-4 py-3 rounded-lg bg-[#111113] border border-[#27272A] text-sm text-[#F5F5F5] placeholder:text-[#52525B] focus:outline-none focus:border-[#10B981] transition-colors duration-250"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit}
            className={cn(
              'w-full py-3.5 rounded-lg font-semibold text-sm transition-all duration-250 active:scale-[0.98]',
              'flex items-center justify-center gap-2',
              canSubmit
                ? 'bg-[#10B981] text-[#0A0A0B] hover:bg-[#10B981]/90'
                : 'bg-[#1A1A1D] text-[#52525B] cursor-not-allowed'
            )}
          >
            {submitting ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-[#0A0A0B]/30 border-t-[#0A0A0B] rounded-full inline-block"
                />
                提交中...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                提交反馈
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
