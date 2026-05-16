'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Home, Globe, Send, Loader2 } from 'lucide-react'
import { PageType } from '@/app/page'
import { askDeepSeek } from '@/lib/deepseek'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AIChatProps {
  onNavigate: (page: PageType) => void
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

  // Auto scroll to bottom on new messages or loading state change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return

    const userMessage: Message = { role: 'user', content: trimmed }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await askDeepSeek(trimmed)
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
          {/* Home button */}
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-2 rounded-lg bg-[#1A1A1D] hover:bg-[#27272A] transition-colors duration-250 active:scale-95"
          >
            <Home className="w-5 h-5" />
          </button>
        </div>
      </header>

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
