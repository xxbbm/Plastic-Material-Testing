'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Home, Globe, Send, Loader2, X } from 'lucide-react'
import { PageType } from '@/lib/types'
import { askDeepSeek, ChatMessage } from '@/lib/deepseek'
import { cn } from '@/lib/utils'
import { getUserId } from '@/lib/storage'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AIChatProps {
  onNavigate: (page: PageType) => void
}

interface ChatSession {
  id: string
  name: string
  messages: Message[]
  createdAt: number
}

const SESSIONS_KEY = 'chatSessions'
const SESSION_EXPIRY = 7 * 24 * 60 * 60 * 1000 // 7 days

function loadSessions(): ChatSession[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(SESSIONS_KEY)
    const sessions: ChatSession[] = raw ? JSON.parse(raw) : []
    const now = Date.now()
    return sessions.filter(s => now - s.createdAt < SESSION_EXPIRY)
  } catch { return [] }
}

function saveSessions(sessions: ChatSession[]) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
}

const QUICK_TAGS = [
  '黑烟',
  '火星聚拢',
  '火星散开',
  '金属声',
  '木头纹理',
  'POM预警',
  '阻燃',
  '离火即灭',
  '蜡烛味',
  '橡胶臭味',
  '刺鼻辣眼',
]

export function AIChat({ onNavigate }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string>('')
  const [showSessionList, setShowSessionList] = useState(false)

  // Auto scroll to bottom on new messages or loading state change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Load sessions on mount
  useEffect(() => {
    const loaded = loadSessions()
    if (loaded.length > 0) {
      setSessions(loaded)
      setActiveSessionId(loaded[0].id)
      setMessages(loaded[0].messages)
    } else {
      const defaultSession: ChatSession = {
        id: `chat-${Date.now()}`,
        name: '对话 1',
        messages: [],
        createdAt: Date.now(),
      }
      setSessions([defaultSession])
      setActiveSessionId(defaultSession.id)
    }
  }, [])

  // Save messages to active session whenever they change
  useEffect(() => {
    if (!activeSessionId) return
    setSessions(prev => {
      const updated = prev.map(s =>
        s.id === activeSessionId ? { ...s, messages } : s
      )
      saveSessions(updated)
      return updated
    })
  }, [messages, activeSessionId])

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return

    const userMessage: Message = { role: 'user', content: trimmed }
    // 将当前消息历史转为 ChatMessage[] 传给 API（压缩 + 上下文）
    const history: ChatMessage[] = messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await askDeepSeek(trimmed, history)
      const aiMessage: Message = { role: 'assistant', content: response }
      setMessages((prev) => [...prev, aiMessage])
    } catch {
      const errorMessage: Message = {
        role: 'assistant',
        content: 'AI 暂时无法响应，请稍后重试',
      }
      setMessages((prev) => [...prev, errorMessage])
      toast.error('AI 请求失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleTagClick = (tag: string) => {
    sendMessage(tag)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0B]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 border-b border-[#27272A]">
        <h1 className="text-lg font-bold">AI 咨询</h1>
        <div className="flex items-center gap-2">
          {/* 联网搜索 Toggle — disabled with tooltip */}
          <div className="relative group">
            <button
              disabled
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium',
                'bg-[#1A1A1D] border border-[#27272A] text-[#71717A]',
                'opacity-60 cursor-not-allowed',
              )}
            >
              <Globe className="w-4 h-4" />
              联网搜索
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-[#27272A] text-xs text-[#A1A1AA] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              即将上线
            </div>
          </div>
          {/* New chat button */}
          <button
            onClick={() => {
              const newSession: ChatSession = {
                id: `chat-${Date.now()}`,
                name: `对话 ${sessions.length + 1}`,
                messages: [],
                createdAt: Date.now(),
              }
              const updated = [newSession, ...sessions]
              setSessions(updated)
              saveSessions(updated)
              setActiveSessionId(newSession.id)
              setMessages([])
            }}
            className="px-3 py-1.5 rounded-lg text-xs bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 hover:bg-[#10B981]/20 transition-all"
          >
            + 新对话
          </button>
          {/* Session list toggle */}
          <button
            onClick={() => setShowSessionList(!showSessionList)}
            className="px-2 py-1.5 rounded-lg text-xs bg-[#1A1A1D] text-[#A1A1AA] hover:bg-[#27272A] transition-all"
          >
            历史对话 ({sessions.length})
          </button>
          {/* Home button */}
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-2 rounded-lg bg-[#1A1A1D] hover:bg-[#27272A] transition-colors duration-250 active:scale-95"
          >
            <Home className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Session List Dropdown */}
      {showSessionList && (
        <div className="absolute top-12 left-4 right-4 z-10 bg-[#111113] border border-[#27272A] rounded-xl p-2 max-h-64 overflow-y-auto">
          {sessions.map(s => (
            <div key={s.id} className="flex items-center gap-1">
              <button
                onClick={() => {
                  setActiveSessionId(s.id)
                  setMessages(s.messages)
                  setShowSessionList(false)
                }}
                className={cn(
                  'flex-1 text-left px-3 py-2 rounded-lg hover:bg-[#1A1A1D] text-sm transition-colors',
                  s.id === activeSessionId && 'bg-[#1A1A1D] border border-[#27272A]',
                )}
              >
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-[#52525B]">
                  {new Date(s.createdAt).toLocaleString('zh-CN')} · {s.messages.length}条消息
                </div>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  const updated = sessions.filter(x => x.id !== s.id)
                  setSessions(updated)
                  saveSessions(updated)
                  if (s.id === activeSessionId && updated.length > 0) {
                    setActiveSessionId(updated[0].id)
                    setMessages(updated[0].messages)
                  }
                }}
                className="p-1.5 rounded-lg text-[#52525B] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors flex-shrink-0"
                title="删除对话"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && !isLoading ? (
          /* Empty State */
          <div className="flex items-center justify-center h-full">
            <p className="text-[#71717A] text-sm">
              描述你遇到的塑料特征，AI 帮你识别
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'flex',
                  msg.role === 'user' ? 'justify-end' : 'justify-start',
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] px-4 py-3 rounded-xl text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-[#10B981] text-[#0A0A0B]'
                      : 'bg-[#1A1A1D] border border-[#27272A] text-[#F5F5F5]',
                  )}
                >
                  {msg.content}
                </div>
                {msg.role === 'assistant' && (msg.content.includes('判定结果') || msg.content.includes('材质：')) && (
                  <div className="mt-2">
                    <button
                      onClick={() => {
                        setInput('结果不太对，请重新分析。我之前说的是：')
                        inputRef.current?.focus()
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444]/20 transition-colors"
                    >
                      结果有误？点击重新补充描述
                    </button>
                  </div>
                )}
              </motion.div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-[#1A1A1D] border border-[#27272A] px-4 py-3 rounded-xl">
                  <Loader2 className="w-5 h-5 text-[#10B981] animate-spin" />
                </div>
              </motion.div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Tags */}
      <div className="px-4 py-2 border-t border-[#27272A] overflow-x-auto">
        <div className="flex gap-2 pb-1">
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              disabled={isLoading}
              className={cn(
                'flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-250',
                'bg-[#111113] border-[#27272A] text-[#A1A1AA]',
                'hover:border-[#10B981]/50 hover:text-[#10B981]',
                'active:scale-95',
                isLoading && 'opacity-50 cursor-not-allowed',
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <form
        onSubmit={handleSubmit}
        className="px-4 py-3 border-t border-[#27272A] bg-[#111113]"
      >
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入塑料特征描述..."
            disabled={isLoading}
            className={cn(
              'flex-1 px-4 py-3 rounded-xl bg-[#0A0A0B] border border-[#27272A]',
              'text-sm text-[#F5F5F5] placeholder-[#71717A]',
              'focus:outline-none focus:border-[#10B981]/50',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={cn(
              'p-3 rounded-xl transition-all duration-250 active:scale-95',
              !input.trim() || isLoading
                ? 'bg-[#27272A] text-[#71717A] cursor-not-allowed'
                : 'bg-[#10B981] text-[#0A0A0B] hover:bg-[#10B981]/90',
            )}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
