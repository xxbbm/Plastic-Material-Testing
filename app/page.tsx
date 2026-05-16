'use client'

import { useState, useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'
import { Dashboard } from '@/components/dashboard'
import { DetailedWizard } from '@/components/detailed-wizard'
import { ExpertMatrix } from '@/components/expert-matrix'
import { ResultPage } from '@/components/result-page'
import { Encyclopedia } from '@/components/encyclopedia'
import { History } from '@/components/history'
import { AIChat } from '@/components/ai-chat'
import { PhotoLog } from '@/components/photo-log'
import { FeedbackForm } from '@/components/feedback-form'
import { FeedbackHistory } from '@/components/feedback-history'
import { PageType, PlasticMaterial, DetectionResult } from '@/lib/types'
import { getHistory, addHistory, clearHistory } from '@/lib/storage'

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

export default function Home() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard')
  const [materials, setMaterials] = useState<PlasticMaterial[]>([])
  const [detectionHistory, setDetectionHistory] = useState<DetectionResult[]>([])
  const [currentResult, setCurrentResult] = useState<DetectionResult | null>(null)

  // Load materials from API on mount
  useEffect(() => {
    fetch('/api/materials').then(r => r.json()).then(setMaterials)
  }, [])

  // Load detection history from localStorage on mount
  useEffect(() => {
    setDetectionHistory(getHistory())
  }, [])

  const navigateTo = useCallback((page: PageType) => {
    setCurrentPage(page)
  }, [])

  const handleDetectionComplete = useCallback((result: DetectionResult) => {
    setCurrentResult(result)
    addHistory(result)
    setDetectionHistory(getHistory())
    setCurrentPage('result')
  }, [])

  const handleClearHistory = useCallback(() => {
    clearHistory()
    setDetectionHistory([])
  }, [])

  const handleExportLog = useCallback(() => {
    const logData = detectionHistory.map(r => ({
      material: r.material.name,
      confidence: r.confidence,
      timestamp: r.timestamp,
      features: r.matchedFeatures,
    }))
    navigator.clipboard.writeText(JSON.stringify(logData, null, 2))
    toast.success('日志已导出到剪贴板')
  }, [detectionHistory])

  const handleViewHistoryResult = useCallback((result: DetectionResult) => {
    setCurrentResult(result)
    setCurrentPage('result')
  }, [])

  return (
    <main className="min-h-screen bg-[#0A0A0B]">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="min-h-screen"
        >
          {currentPage === 'dashboard' && (
            <Dashboard
              onNavigate={navigateTo}
              onExportLog={handleExportLog}
              historyCount={detectionHistory.length}
            />
          )}
          {currentPage === 'wizard' && (
            <DetailedWizard
              onNavigate={navigateTo}
              onComplete={handleDetectionComplete}
              materials={materials}
            />
          )}
          {currentPage === 'expert' && (
            <ExpertMatrix
              onNavigate={navigateTo}
              onComplete={handleDetectionComplete}
            />
          )}
          {currentPage === 'result' && currentResult && (
            <ResultPage
              result={currentResult}
              onNavigate={navigateTo}
              onSave={() => toast.success('结果已保存')}
              onExport={handleExportLog}
            />
          )}
          {currentPage === 'encyclopedia' && (
            <Encyclopedia
              onNavigate={navigateTo}
              materials={materials}
            />
          )}
          {currentPage === 'history' && (
            <History
              onNavigate={navigateTo}
              history={detectionHistory}
              onViewResult={handleViewHistoryResult}
              onClear={handleClearHistory}
            />
          )}
          {currentPage === 'ai-chat' && (
            <AIChat onNavigate={navigateTo} />
          )}
          {currentPage === 'photo-log' && (
            <PhotoLog onNavigate={navigateTo} />
          )}
          {currentPage === 'feedback-form' && (
            <FeedbackForm onNavigate={navigateTo} />
          )}
          {currentPage === 'feedback-history' && (
            <FeedbackHistory onNavigate={navigateTo} />
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  )
}
