'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  History, 
  Settings, 
  MessageSquare, 
  Search, 
  Zap, 
  Camera,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Activity,
  Download
} from 'lucide-react'
import { PageType } from '@/app/page'
import { marketPrices } from '@/lib/plastic-data'
import { cn } from '@/lib/utils'

interface DashboardProps {
  onNavigate: (page: PageType) => void
  onExportLog: () => void
  historyCount: number
}

const actionCards = [
  {
    id: 'ai',
    title: 'AI 咨询',
    subtitle: 'DeepSeek 智能引导',
    icon: MessageSquare,
    page: 'wizard' as PageType,
    disabled: true,
    badge: '即将上线',
  },
  {
    id: 'wizard',
    title: '详细检测',
    subtitle: '分步决策逻辑 (含补偿机制)',
    icon: Search,
    page: 'wizard' as PageType,
  },
  {
    id: 'expert',
    title: '专家模式',
    subtitle: '快速标签矩阵 (火星/声音/纹理)',
    icon: Zap,
    page: 'expert' as PageType,
  },
  {
    id: 'camera',
    title: '拍照存样',
    subtitle: '拍摄并备注 (预留接口)',
    icon: Camera,
    page: 'dashboard' as PageType,
    disabled: true,
    badge: '预留',
  },
]

export function Dashboard({ onNavigate, onExportLog, historyCount }: DashboardProps) {
  const [showAnalysis, setShowAnalysis] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 border-b border-[#27272A]">
        <h1 className="text-xl font-bold tracking-tight">塑料材质识别</h1>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onNavigate('dictionary')}
            className="relative p-2.5 rounded-lg bg-[#1A1A1D] hover:bg-[#27272A] transition-colors duration-250 active:scale-95"
          >
            <History className="w-5 h-5" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#10B981] text-[10px] font-medium flex items-center justify-center text-[#0A0A0B]">
                {historyCount > 9 ? '9+' : historyCount}
              </span>
            )}
          </button>
          <button className="p-2.5 rounded-lg bg-[#1A1A1D] hover:bg-[#27272A] transition-colors duration-250 active:scale-95">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Market Ticker */}
      <div className="border-b border-[#27272A] bg-[#111113] overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap py-2.5">
          {[...marketPrices, ...marketPrices].map((item, index) => (
            <div key={index} className="flex items-center gap-2 mx-4">
              <span className="font-medium">{item.name}</span>
              <span className="text-[#71717A]">¥{item.price.toLocaleString()}</span>
              <span className={cn(
                "flex items-center text-sm",
                item.change > 0 ? "text-[#10B981]" : "text-[#EF4444]"
              )}>
                {item.change > 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                {item.change > 0 ? '+' : ''}{item.change}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Price Analysis Card */}
      <div className="px-4 pt-4">
        <button
          onClick={() => setShowAnalysis(!showAnalysis)}
          className="w-full flex items-center justify-between p-3 rounded-lg bg-[#111113] border border-[#27272A] hover:border-[#3F3F46] transition-colors duration-250"
        >
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#10B981]" />
            <span className="text-sm font-medium">今日行情简评</span>
          </div>
          {showAnalysis ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showAnalysis && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-2 p-3 rounded-lg bg-[#111113] border border-[#27272A] text-sm text-[#A1A1AA] leading-relaxed"
          >
            受原油价格波动影响，PC 料小幅上涨 1.2%，PA 尼龙受需求拉动涨幅最大达 2.1%。PP/PE 类通用料延续下跌趋势，市场观望情绪浓厚。建议关注 POM 赛钢价格走势，近期订单增加明显。
          </motion.div>
        )}
      </div>

      {/* Core Navigation Cards */}
      <div className="flex-1 px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          {actionCards.map((card) => (
            <motion.button
              key={card.id}
              onClick={() => !card.disabled && onNavigate(card.page)}
              disabled={card.disabled}
              whileTap={{ scale: card.disabled ? 1 : 0.95 }}
              className={cn(
                "relative flex flex-col items-start p-4 rounded-xl border transition-all duration-250",
                "bg-[#111113] border-[#27272A]",
                card.disabled 
                  ? "opacity-60 cursor-not-allowed" 
                  : "hover:border-[#10B981]/50 hover:bg-[#111113]/80 active:bg-[#1A1A1D]"
              )}
            >
              {card.badge && (
                <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#27272A] text-[#71717A]">
                  {card.badge}
                </span>
              )}
              <div className={cn(
                "p-2.5 rounded-lg mb-3",
                card.disabled ? "bg-[#1A1A1D]" : "bg-[#10B981]/10"
              )}>
                <card.icon className={cn(
                  "w-6 h-6",
                  card.disabled ? "text-[#71717A]" : "text-[#10B981]"
                )} />
              </div>
              <h3 className="font-semibold text-base mb-1">{card.title}</h3>
              <p className="text-xs text-[#71717A] text-left leading-relaxed">{card.subtitle}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="px-4 py-3 border-t border-[#27272A] bg-[#111113]">
        <div className="flex items-center justify-between text-xs text-[#71717A]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              系统状态: 正常
            </span>
            <span>API 延迟: 24ms</span>
          </div>
          <button 
            onClick={onExportLog}
            className="flex items-center gap-1.5 hover:text-[#F5F5F5] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            数据导出
          </button>
        </div>
      </footer>
    </div>
  )
}
