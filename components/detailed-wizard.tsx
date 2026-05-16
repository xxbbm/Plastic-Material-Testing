'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, 
  Home, 
  HelpCircle,
  Lightbulb,
  AlertTriangle
} from 'lucide-react'
import { PageType } from '@/app/page'
import { wizardQuestions, plasticMaterials, DetectionResult } from '@/lib/plastic-data'
import { cn } from '@/lib/utils'

interface DetailedWizardProps {
  onNavigate: (page: PageType) => void
  onComplete: (result: DetectionResult) => void
}

export function DetailedWizard({ onNavigate, onComplete }: DetailedWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [skippedQuestions, setSkippedQuestions] = useState<Set<string>>(new Set())

  const currentQuestion = wizardQuestions[currentStep]
  const totalSteps = wizardQuestions.length
  const progress = ((currentStep + 1) / totalSteps) * 100

  // Calculate confidence based on answers
  const { confidence, topMaterial } = useMemo(() => {
    const scores: Record<string, number> = {}
    
    // Initialize scores
    plasticMaterials.forEach(m => {
      scores[m.id] = 0
    })

    // Calculate scores based on answers
    Object.entries(answers).forEach(([questionId, answerValue]) => {
      const question = wizardQuestions.find(q => q.id === questionId)
      if (question) {
        const option = question.options.find(o => o.value === answerValue)
        if (option) {
          Object.entries(option.weight).forEach(([materialId, weight]) => {
            scores[materialId] = (scores[materialId] || 0) + weight
          })
        }
      }
    })

    // Find top material
    let maxScore = 0
    let topId = 'pc'
    Object.entries(scores).forEach(([id, score]) => {
      if (score > maxScore) {
        maxScore = score
        topId = id
      }
    })

    // Calculate confidence (0-100)
    const answeredCount = Object.keys(answers).length
    const baseConfidence = answeredCount > 0 ? (maxScore / (answeredCount * 3)) * 100 : 0
    const skippedPenalty = skippedQuestions.size * 5
    const finalConfidence = Math.min(100, Math.max(0, baseConfidence - skippedPenalty))

    return {
      confidence: Math.round(finalConfidence),
      topMaterial: plasticMaterials.find(m => m.id === topId) || plasticMaterials[0],
    }
  }, [answers, skippedQuestions])

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value,
    }))
    
    // Auto advance after short delay
    setTimeout(() => {
      if (currentStep < totalSteps - 1) {
        setCurrentStep(prev => prev + 1)
      } else {
        handleComplete()
      }
    }, 300)
  }

  const handleSkip = () => {
    setSkippedQuestions(prev => new Set([...prev, currentQuestion.id]))
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleComplete = () => {
    const matchedFeatures: string[] = []
    Object.entries(answers).forEach(([questionId, answerValue]) => {
      const question = wizardQuestions.find(q => q.id === questionId)
      if (question) {
        const option = question.options.find(o => o.value === answerValue)
        if (option) {
          matchedFeatures.push(option.label)
        }
      }
    })

    const result: DetectionResult = {
      id: `det-${Date.now()}`,
      material: topMaterial,
      confidence,
      matchedFeatures,
      timestamp: new Date(),
    }
    
    onComplete(result)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0B]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 border-b border-[#27272A]">
        <button 
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className={cn(
            "p-2 rounded-lg transition-all duration-250",
            currentStep === 0 
              ? "opacity-40 cursor-not-allowed" 
              : "bg-[#1A1A1D] hover:bg-[#27272A] active:scale-95"
          )}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-medium text-[#71717A]">
          步骤 {currentStep + 1} / {totalSteps}
        </span>
        <button 
          onClick={() => onNavigate('dashboard')}
          className="p-2 rounded-lg bg-[#1A1A1D] hover:bg-[#27272A] transition-colors duration-250 active:scale-95"
        >
          <Home className="w-5 h-5" />
        </button>
      </header>

      {/* Progress Bar */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#71717A]">置信度</span>
          <span className={cn(
            "text-sm font-semibold",
            confidence >= 70 ? "text-[#10B981]" : confidence >= 40 ? "text-[#F59E0B]" : "text-[#71717A]"
          )}>
            {confidence}%
          </span>
        </div>
        <div className="h-1.5 bg-[#1A1A1D] rounded-full overflow-hidden">
          <motion.div 
            className={cn(
              "h-full rounded-full",
              confidence >= 70 ? "bg-[#10B981]" : confidence >= 40 ? "bg-[#F59E0B]" : "bg-[#3F3F46]"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${confidence}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        {/* Step Progress */}
        <div className="mt-2 h-0.5 bg-[#1A1A1D] rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-[#27272A] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 px-4 py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {/* Current prediction */}
            {confidence > 20 && (
              <div className="mb-4 p-3 rounded-lg bg-[#111113] border border-[#27272A]">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#71717A]">当前预测:</span>
                  <span className="font-semibold text-[#10B981]">{topMaterial.name}</span>
                  <span className="text-[#71717A]">({topMaterial.fullName})</span>
                </div>
              </div>
            )}

            {/* Question */}
            <h2 className="text-lg font-semibold mb-6 leading-relaxed">
              {currentQuestion.question}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option) => {
                const isSelected = answers[currentQuestion.id] === option.value
                return (
                  <motion.button
                    key={option.value}
                    onClick={() => handleAnswer(option.value)}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "w-full p-4 rounded-xl border text-left transition-all duration-250",
                      isSelected
                        ? "bg-[#10B981]/10 border-[#10B981] text-[#F5F5F5]"
                        : "bg-[#111113] border-[#27272A] hover:border-[#3F3F46]"
                    )}
                  >
                    <span className="font-medium">{option.label}</span>
                  </motion.button>
                )
              })}
            </div>

            {/* Skip Button */}
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleSkip}
                className="flex items-center gap-2 px-4 py-2 text-sm text-[#71717A] hover:text-[#A1A1AA] transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                不确定 / 跳过
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Tips */}
      {currentQuestion.tip && (
        <div className="px-4 pb-4">
          <div className="p-3 rounded-lg bg-[#111113] border border-[#27272A]">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-[#F59E0B] mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[#A1A1AA] leading-relaxed">
                <span className="font-medium text-[#F59E0B]">小贴士：</span>
                {currentQuestion.tip}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* POM Warning if detected */}
      {topMaterial.id === 'pom' && confidence > 40 && (
        <div className="px-4 pb-4">
          <div className="p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-[#EF4444] mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[#EF4444] leading-relaxed">
                <span className="font-semibold">安全警告：</span>
                检测到可能是 POM (赛钢)，燃烧时火焰几乎不可见，极度危险！
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Complete Button */}
      {currentStep === totalSteps - 1 && Object.keys(answers).length > 0 && (
        <div className="px-4 pb-4">
          <button
            onClick={handleComplete}
            className="w-full py-4 rounded-xl bg-[#10B981] text-[#0A0A0B] font-semibold text-base transition-all duration-250 hover:bg-[#10B981]/90 active:scale-[0.98]"
          >
            完成检测 (置信度 {confidence}%)
          </button>
        </div>
      )}
    </div>
  )
}
