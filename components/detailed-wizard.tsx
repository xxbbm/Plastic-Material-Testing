'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  Home,
  HelpCircle,
  Lightbulb,
  AlertTriangle,
  Flame,
  Gavel,
  Shuffle,
  ArrowRight,
  CheckCircle2,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import { PageType } from '@/lib/types'
import { PlasticMaterial, DetectionResult } from '@/lib/plastic-data'
import { plasticMaterials } from '@/lib/plastic-data'
import { cn } from '@/lib/utils'
import { branchQuestions } from '@/lib/wizard-data'

type WizardPhase = 'select' | 'burn' | 'physical'

interface DetailedWizardProps {
  onNavigate: (page: PageType) => void
  onComplete: (result: DetectionResult) => void
  materials?: PlasticMaterial[]
}

export function DetailedWizard({
  onNavigate,
  onComplete,
  materials = plasticMaterials,
}: DetailedWizardProps) {
  const [phase, setPhase] = useState<WizardPhase>('select')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [skippedQuestions, setSkippedQuestions] = useState<Set<string>>(new Set())

  // Derive question list for current branch
  const branchQuestionList = useMemo(() => {
    if (phase === 'select') return []
    return branchQuestions.filter((q) => q.branch === phase)
  }, [phase])

  const currentQuestion = branchQuestionList[currentQuestionIndex] ?? null
  const skippedCount = skippedQuestions.size
  const answeredCount = Object.keys(answers).length
  const hasAnswers = answeredCount > 0
  const isLastQuestion =
    currentQuestion !== null &&
    currentQuestionIndex >= branchQuestionList.length - 1

  // ─── Weighted Scoring ───────────────────────────────────────────
  const { confidence, topMaterial, allScores } = useMemo(() => {
    const scores: Record<string, number> = {}
    materials.forEach((m) => {
      scores[m.id] = 0
    })

    Object.entries(answers).forEach(([questionId, answerValue]) => {
      const question = branchQuestions.find((q) => q.id === questionId)
      if (question) {
        const option = question.options.find((o) => o.value === answerValue)
        if (option) {
          Object.entries(option.weight).forEach(([materialId, weight]) => {
            scores[materialId] = (scores[materialId] || 0) + weight
          })
        }
      }
    })

    let maxScore = 0
    let topId = 'pc'
    Object.entries(scores).forEach(([id, score]) => {
      if (score > maxScore) {
        maxScore = score
        topId = id
      }
    })

    const baseConfidence =
      answeredCount > 0 ? (maxScore / (answeredCount * 3)) * 100 : 0
    const finalConfidence = Math.min(
      100,
      Math.max(0, baseConfidence - skippedCount * 10),
    )

    return {
      allScores: scores,
      confidence: Math.round(finalConfidence),
      topMaterial: materials.find((m) => m.id === topId) || materials[0],
    }
  }, [answers, skippedCount, answeredCount, materials])

  // ─── Handlers ────────────────────────────────────────────────────
  const handleAnswer = useCallback(
    (value: string) => {
      if (!currentQuestion) return
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }))
      if (currentQuestionIndex < branchQuestionList.length - 1) {
        setTimeout(
          () => setCurrentQuestionIndex((prev) => prev + 1),
          250,
        )
      }
    },
    [currentQuestion, currentQuestionIndex, branchQuestionList.length],
  )

  const handleSkip = useCallback(() => {
    if (!currentQuestion) return
    setSkippedQuestions((prev) => {
      const next = new Set(prev)
      next.add(currentQuestion.id)
      return next
    })
    toast.warning(`已跳过「${currentQuestion.question}」`, {
      description: '跳过将降低 10% 置信度',
      duration: 2000,
    })
    if (currentQuestionIndex < branchQuestionList.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }, [currentQuestion, currentQuestionIndex, branchQuestionList.length])

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }, [currentQuestionIndex])

  const handleSelectBranch = useCallback((branch: WizardPhase) => {
    if (branch === 'select') return
    setPhase(branch)
    setCurrentQuestionIndex(0)
  }, [])

  const handleSelectUnsure = useCallback(() => {
    setPhase('burn')
    setCurrentQuestionIndex(0)
    toast.info('已默认使用火烧法开始', {
      description: '可随时切换到物理测试分支以提高准确率',
      duration: 3000,
    })
  }, [])

  const handleSwitchBranch = useCallback(() => {
    const newPhase: WizardPhase = phase === 'burn' ? 'physical' : 'burn'
    setPhase(newPhase)
    setCurrentQuestionIndex(0)
    toast.info(
      `已切换到${newPhase === 'burn' ? '火烧测试' : '物理测试'}分支`,
      {
        description: '已回答的问题将保留并继续影响评分',
        duration: 2500,
      }
    )
  }, [phase])

  const handleComplete = useCallback(() => {
    const matchedFeatures: string[] = []
    Object.entries(answers).forEach(([questionId, answerValue]) => {
      const question = branchQuestions.find((q) => q.id === questionId)
      if (question) {
        const option = question.options.find((o) => o.value === answerValue)
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
  }, [answers, topMaterial, confidence, onComplete])

  // Headers for each branch
  const burnProgress = useMemo(() => {
    const burnQs = branchQuestions.filter((q) => q.branch === 'burn')
    const answeredBurn = burnQs.filter((q) => q.id in answers).length
    return { total: burnQs.length, answered: answeredBurn }
  }, [answers])

  const physicalProgress = useMemo(() => {
    const physQs = branchQuestions.filter((q) => q.branch === 'physical')
    const answeredPhys = physQs.filter((q) => q.id in answers).length
    return { total: physQs.length, answered: answeredPhys }
  }, [answers])

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0B]">
      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 py-4 border-b border-[#27272A]">
        <button
          onClick={() => {
            if (phase === 'select') {
              onNavigate('dashboard')
            } else if (currentQuestionIndex > 0) {
              handlePrevious()
            } else {
              setPhase('select')
              setCurrentQuestionIndex(0)
            }
          }}
          className={cn(
            'p-2 rounded-lg transition-all duration-250',
            phase === 'select'
              ? 'bg-[#1A1A1D] hover:bg-[#27272A] active:scale-95'
              : 'bg-[#1A1A1D] hover:bg-[#27272A] active:scale-95',
          )}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="text-sm font-medium text-[#71717A]">
          {phase === 'select'
            ? '选择检测方式'
            : phase === 'burn'
              ? `火烧测试 ${currentQuestionIndex + 1}/${branchQuestionList.length}`
              : `物理测试 ${currentQuestionIndex + 1}/${branchQuestionList.length}`}
        </span>

        <button
          onClick={() => onNavigate('dashboard')}
          className="p-2 rounded-lg bg-[#1A1A1D] hover:bg-[#27272A] transition-colors duration-250 active:scale-95"
        >
          <Home className="w-5 h-5" />
        </button>
      </header>

      {/* ── Confidence Bar ──────────────────────────────────────── */}
      {hasAnswers && (
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#71717A]">置信度</span>
            <span
              className={cn(
                'text-sm font-semibold',
                confidence >= 70
                  ? 'text-[#10B981]'
                  : confidence >= 40
                    ? 'text-[#F59E0B]'
                    : 'text-[#71717A]',
              )}
            >
              {confidence}%
            </span>
          </div>
          <div className="h-1.5 bg-[#1A1A1D] rounded-full overflow-hidden">
            <motion.div
              className={cn(
                'h-full rounded-full',
                confidence >= 70
                  ? 'bg-[#10B981]'
                  : confidence >= 40
                    ? 'bg-[#F59E0B]'
                    : 'bg-[#3F3F46]',
              )}
              initial={{ width: 0 }}
              animate={{ width: `${confidence}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          {/* Branch progress mini indicators */}
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => {
                if (phase !== 'burn') {
                  setPhase('burn')
                  setCurrentQuestionIndex(0)
                }
              }}
              className={cn(
                'flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-colors',
                phase === 'burn'
                  ? 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30'
                  : 'bg-[#1A1A1D] text-[#52525B] border border-[#27272A] hover:border-[#3F3F46]',
              )}
            >
              <Flame className="w-3 h-3" />
              火烧 {burnProgress.answered}/{burnProgress.total}
            </button>
            <button
              onClick={() => {
                if (phase !== 'physical') {
                  setPhase('physical')
                  setCurrentQuestionIndex(0)
                }
              }}
              className={cn(
                'flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-colors',
                phase === 'physical'
                  ? 'bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/30'
                  : 'bg-[#1A1A1D] text-[#52525B] border border-[#27272A] hover:border-[#3F3F46]',
              )}
            >
              <Gavel className="w-3 h-3" />
              物理 {physicalProgress.answered}/{physicalProgress.total}
            </button>
          </div>
        </div>
      )}

      {/* ── Skip Compensation Prompt ────────────────────────────── */}
      {skippedCount >= 2 && (
        <div className="px-4 pb-1">
          <div className="p-3 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/30">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-[#F59E0B] mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[#F59E0B] leading-relaxed">
                <span className="font-semibold">建议：</span>
                已跳过 {skippedCount} 个问题（置信度 -{skippedCount * 10}%）。
                切换到另一分支回答更多问题可补偿置信度损失。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content ────────────────────────────────────────── */}
      <div className="flex-1 px-4 py-4">
        <AnimatePresence mode="wait">
          {phase === 'select' ? (
            /* ═══════════════ SELECT PHASE ═══════════════ */
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-xl font-bold mb-2">选择检测方式</h2>
                <p className="text-sm text-[#71717A] max-w-xs mx-auto leading-relaxed">
                  根据你手头可用的工具和环境，选择最适合的检测方案
                </p>
              </div>

              <div className="space-y-4">
                {/* Burn test card */}
                <motion.button
                  onClick={() => handleSelectBranch('burn')}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-5 rounded-xl bg-[#111113] border border-[#27272A] hover:border-[#F59E0B]/50 transition-all duration-250 text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-[#F59E0B]/10 group-hover:bg-[#F59E0B]/15 transition-colors">
                      <Flame className="w-6 h-6 text-[#F59E0B]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1 flex items-center gap-2">
                        火烧测试法
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                          推荐
                        </span>
                      </h3>
                      <p className="text-sm text-[#71717A] leading-relaxed mb-3">
                        通过观察燃烧特征（火星、火焰、烟、气味）快速区分塑料类型。最准确、最高效的检测手段。
                      </p>
                      <div className="flex items-center gap-2 text-xs text-[#A1A1AA]">
                        <span className="px-2 py-1 rounded-md bg-[#1A1A1D] border border-[#27272A]">
                          4 个问题
                        </span>
                        <span className="text-[#52525B]">约 2 分钟</span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#52525B] group-hover:text-[#F59E0B] transition-colors mt-3 flex-shrink-0" />
                  </div>
                </motion.button>

                {/* Physical test card */}
                <motion.button
                  onClick={() => handleSelectBranch('physical')}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-5 rounded-xl bg-[#111113] border border-[#27272A] hover:border-[#3B82F6]/50 transition-all duration-250 text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-[#3B82F6]/10 group-hover:bg-[#3B82F6]/15 transition-colors">
                      <Gavel className="w-6 h-6 text-[#3B82F6]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1">物理测试法</h3>
                      <p className="text-sm text-[#71717A] leading-relaxed mb-3">
                        通过敲击声音、弯折反应、表面手感、重量评估来判断材质。无需明火，安全便捷。
                      </p>
                      <div className="flex items-center gap-2 text-xs text-[#A1A1AA]">
                        <span className="px-2 py-1 rounded-md bg-[#1A1A1D] border border-[#27272A]">
                          4 个问题
                        </span>
                        <span className="text-[#52525B]">约 1.5 分钟</span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#52525B] group-hover:text-[#3B82F6] transition-colors mt-3 flex-shrink-0" />
                  </div>
                </motion.button>

                {/* Unsure card */}
                <motion.button
                  onClick={handleSelectUnsure}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-5 rounded-xl bg-[#111113] border border-[#27272A] hover:border-[#A1A1AA]/50 transition-all duration-250 text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-[#71717A]/10 group-hover:bg-[#71717A]/15 transition-colors">
                      <HelpCircle className="w-6 h-6 text-[#A1A1AA]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1">不确定 / 帮我选择</h3>
                      <p className="text-sm text-[#71717A] leading-relaxed mb-3">
                        不确定从哪里开始？默认使用火烧法引导您，过程中可随时切换到物理测试分支。
                      </p>
                      <div className="flex items-center gap-2 text-xs text-[#A1A1AA]">
                        <span className="px-2 py-1 rounded-md bg-[#1A1A1D] border border-[#27272A]">
                          灵活切换
                        </span>
                        <span className="text-[#52525B]">系统引导</span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#52525B] group-hover:text-[#A1A1AA] transition-colors mt-3 flex-shrink-0" />
                  </div>
                </motion.button>
              </div>
            </motion.div>
          ) : (
            /* ═══════════════ QUESTION PHASE ═══════════════ */
            <motion.div
              key={`${phase}-${currentQuestionIndex}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {/* Current prediction */}
              {confidence > 20 && (
                <div className="mb-4 p-3 rounded-lg bg-[#111113] border border-[#27272A]">
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4 text-[#10B981]" />
                    <span className="text-[#71717A]">当前预测:</span>
                    <span className="font-semibold text-[#10B981]">
                      {topMaterial.name}
                    </span>
                    <span className="text-[#71717A]">
                      ({topMaterial.fullName})
                    </span>
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
                        'w-full p-4 rounded-xl border text-left transition-all duration-250',
                        isSelected
                          ? 'bg-[#10B981]/10 border-[#10B981] text-[#F5F5F5]'
                          : 'bg-[#111113] border-[#27272A] hover:border-[#3F3F46]',
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

              {/* Navigation within branch */}
              {branchQuestionList.length > 1 && (
                <div className="mt-4 flex items-center justify-center gap-1">
                  {branchQuestionList.map((q, idx) => {
                    const isAnswered = q.id in answers
                    const isSkipped = skippedQuestions.has(q.id)
                    const isCurrent = idx === currentQuestionIndex
                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={cn(
                          'w-2.5 h-2.5 rounded-full transition-all duration-250',
                          isCurrent
                            ? 'bg-[#10B981] scale-125'
                            : isAnswered
                              ? 'bg-[#10B981]/50'
                              : isSkipped
                                ? 'bg-[#F59E0B]/50'
                                : 'bg-[#27272A] hover:bg-[#3F3F46]',
                        )}
                        aria-label={`问题 ${idx + 1}`}
                      />
                    )
                  })}
                </div>
              )}

              {/* Branch switching hint */}
              {hasAnswers && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={handleSwitchBranch}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#111113] border border-[#27272A] text-sm text-[#A1A1AA] hover:border-[#3F3F46] hover:text-[#F5F5F5] transition-all duration-250 active:scale-[0.98]"
                  >
                    <Shuffle className="w-4 h-4" />
                    切换到{phase === 'burn' ? '物理测试' : '火烧测试'}分支
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Tips ────────────────────────────────────────────────── */}
      {currentQuestion?.tip && phase !== 'select' && (
        <div className="px-4 pb-2">
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

      {/* ── POM Warning ─────────────────────────────────────────── */}
      {topMaterial.id === 'pom' && confidence > 40 && (
        <div className="px-4 pb-2">
          <div className="p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-[#EF4444] mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[#EF4444] leading-relaxed">
                <span className="font-semibold">安全警告：</span>
                检测到可能是 POM (赛钢)，燃烧时火焰几乎不可见，极度危险！释放有毒甲醛气体，请在通风环境下操作。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Complete Button ─────────────────────────────────────── */}
      {hasAnswers && (
        <div className="px-4 pb-4 pt-1">
          <button
            onClick={handleComplete}
            className="w-full py-4 rounded-xl bg-[#10B981] text-[#0A0A0B] font-semibold text-base transition-all duration-250 hover:bg-[#10B981]/90 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            完成检测 (置信度 {confidence}%)
          </button>
        </div>
      )}
    </div>
  )
}
