'use client'

import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'
import { Dashboard } from '@/components/dashboard'
import { DetailedWizard } from '@/components/detailed-wizard'
import { ExpertMatrix } from '@/components/expert-matrix'
import { ResultPage } from '@/components/result-page'
import { DictionaryHistory } from '@/components/dictionary-history'
import { DetectionResult } from '@/lib/plastic-data'

export type PageType = 'dashboard' | 'wizard' | 'expert' | 'result' | 'dictionary'

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

export default function Home() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard')
  const [detectionHistory, setDetectionHistory] = useState<DetectionResult[]>([])
  const [currentResult, setCurrentResult] = useState<DetectionResult | null>(null)

  const navigateTo = useCallback((page: PageType) => {
    setCurrentPage(page)
  }, [])

  const handleDetectionComplete = useCallback((result: DetectionResult) => {
    setCurrentResult(result)
    setDetectionHistory(prev => [result, ...prev])
    setCurrentPage('result')
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
          {currentPage === 'dictionary' && (
            <DictionaryHistory 
              onNavigate={navigateTo}
              history={detectionHistory}
              onViewResult={handleViewHistoryResult}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  )
}
