'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Trash2, CheckCircle, X, MessageSquare, Bug, AlertTriangle, Check } from 'lucide-react'
import { toast } from 'sonner'
import type { FeedbackEntry } from '@/lib/types'

const typeMap: Record<string, { label: string; icon: React.ReactNode }> = {
  unknown_material: { label: '未知材质', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  inaccurate_result: { label: '结果不准', icon: <X className="w-3.5 h-3.5" /> },
  bug_report: { label: 'Bug 报告', icon: <Bug className="w-3.5 h-3.5" /> },
}

const typeBadgeColors: Record<string, string> = {
  unknown_material: 'bg-[#8B5CF6]/15 text-[#8B5CF6] border-[#8B5CF6]/30',
  inaccurate_result: 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30',
  bug_report: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30',
}

export default function FeedbackAdmin() {
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'processed'>('all')
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [adminNote, setAdminNote] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchFeedback = useCallback(async () => {
    try {
      const res = await fetch('/api/feedback')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setFeedback(data)
    } catch {
      toast.error('加载反馈列表失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFeedback()
  }, [fetchFeedback])

  const filtered = feedback.filter(f => {
    if (filter === 'all') return true
    return f.status === filter
  })

  const pendingCount = feedback.filter(f => f.status === 'pending').length

  const handleProcess = async (id: string) => {
    if (!adminNote.trim()) {
      toast.error('请输入处理备注')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'processed', adminNote: adminNote.trim() }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || '处理失败')
      }
      toast.success('已标记为已处理')
      setProcessingId(null)
      setAdminNote('')
      fetchFeedback()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : '处理失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除该反馈吗？此操作不可撤销。')) return
    try {
      const res = await fetch(`/api/feedback/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || '删除失败')
      }
      toast.success('反馈已删除')
      fetchFeedback()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : '删除失败')
    }
  }

  const formatDate = (ts: number) => {
    const d = new Date(ts)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
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
          <h1 className="text-xl font-bold">用户反馈</h1>
          {pendingCount > 0 && (
            <span className="ml-auto text-xs px-2 py-1 rounded-full bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30">
              {pendingCount} 待处理
            </span>
          )}
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {(['all', 'pending', 'processed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                filter === f
                  ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
                  : 'bg-[#111113] border-[#27272A] text-[#71717A] hover:text-[#A1A1A6]'
              }`}
            >
              {f === 'all' ? '全部' : f === 'pending' ? '待处理' : '已处理'}
            </button>
          ))}
        </div>

        {/* Feedback List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[#52525B] text-sm">
            {filter === 'pending' ? '没有待处理的反馈' : filter === 'processed' ? '没有已处理的反馈' : '暂无反馈数据'}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(fb => {
              const tInfo = typeMap[fb.type] || { label: fb.type, icon: <MessageSquare className="w-3.5 h-3.5" /> }
              const badgeColor = typeBadgeColors[fb.type] || 'bg-[#52525B]/15 text-[#A1A1A6] border-[#52525B]/30'
              const isProcessing = processingId === fb.id

              return (
                <div
                  key={fb.id}
                  className="p-4 rounded-lg bg-[#111113] border border-[#27272A]"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Meta line */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border flex items-center gap-1 ${badgeColor}`}>
                          {tInfo.icon}
                          {tInfo.label}
                        </span>
                        {fb.status === 'processed' ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded border bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            已处理
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded border bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30">
                            待处理
                          </span>
                        )}
                        <span className="text-[10px] text-[#52525B] ml-auto">
                          {formatDate(fb.createdAt)}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-sm mb-2 whitespace-pre-wrap">{fb.description}</p>

                      {/* Contact */}
                      {fb.contact && (
                        <p className="text-xs text-[#71717A]">联系方式: {fb.contact}</p>
                      )}

                      {/* Admin Note (processed) */}
                      {fb.status === 'processed' && fb.adminNote && (
                        <div className="mt-2 p-2 rounded bg-[#10B981]/5 border border-[#10B981]/10">
                          <p className="text-xs text-[#71717A]">
                            <span className="text-[#10B981] font-medium">处理备注:</span> {fb.adminNote}
                          </p>
                        </div>
                      )}

                      {/* Inline processing form */}
                      {isProcessing && (
                        <div className="mt-3 space-y-2">
                          <input
                            type="text"
                            value={adminNote}
                            onChange={e => setAdminNote(e.target.value)}
                            placeholder="输入处理备注..."
                            className="w-full px-3 py-2 rounded-lg bg-[#0A0A0B] border border-[#27272A] text-sm placeholder:text-[#52525B] focus:outline-none focus:border-[#10B981]/50"
                            autoFocus
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleProcess(fb.id)
                              if (e.key === 'Escape') { setProcessingId(null); setAdminNote('') }
                            }}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleProcess(fb.id)}
                              disabled={saving}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#10B981] text-[#0A0A0B] text-xs font-medium active:scale-95 disabled:opacity-50"
                            >
                              <Check className="w-3 h-3" />
                              {saving ? '处理中...' : '确认'}
                            </button>
                            <button
                              onClick={() => { setProcessingId(null); setAdminNote('') }}
                              className="px-3 py-1.5 rounded-lg border border-[#27272A] text-xs hover:bg-[#1A1A1D]"
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {!isProcessing && (
                      <div className="flex items-center gap-1 shrink-0">
                        {fb.status === 'pending' && (
                          <button
                            onClick={() => {
                              setProcessingId(fb.id)
                              setAdminNote('')
                            }}
                            className="p-1.5 rounded-lg hover:bg-[#10B981]/10 text-[#52525B] hover:text-[#10B981]"
                            title="标记已处理"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(fb.id)}
                          className="p-1.5 rounded-lg hover:bg-[#7F1D1D]/30 text-[#52525B] hover:text-[#EF4444]"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
