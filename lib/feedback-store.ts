import fs from 'fs'
import path from 'path'
import { FeedbackEntry } from './types'

const DATA_DIR = path.join(process.cwd(), 'data')
const FEEDBACK_FILE = path.join(DATA_DIR, 'feedback.json')

export function readFeedback(): FeedbackEntry[] {
  try {
    const raw = fs.readFileSync(FEEDBACK_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function writeFeedback(feedback: FeedbackEntry[]): void {
  fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(feedback, null, 2), 'utf-8')
}

export function addFeedback(entry: FeedbackEntry): FeedbackEntry {
  const feedback = readFeedback()
  feedback.unshift(entry)
  writeFeedback(feedback)
  return entry
}

export function updateFeedbackStatus(id: string, status: 'pending' | 'processed', adminNote?: string): FeedbackEntry | null {
  const feedback = readFeedback()
  const index = feedback.findIndex(f => f.id === id)
  if (index === -1) return null
  feedback[index].status = status
  if (adminNote !== undefined) feedback[index].adminNote = adminNote
  writeFeedback(feedback)
  return feedback[index]
}

export function deleteFeedback(id: string): boolean {
  const feedback = readFeedback()
  const filtered = feedback.filter(f => f.id !== id)
  if (filtered.length === feedback.length) return false
  writeFeedback(filtered)
  return true
}
