import { DetectionResult, PhotoLogEntry } from './types'

const HISTORY_KEY = 'detectHistory'
const PHOTO_KEY = 'photoLogs'
const USER_ID_KEY = 'userId'

export function getUserId(): string {
  if (typeof window === 'undefined') return ''
  let userId = localStorage.getItem(USER_ID_KEY)
  if (!userId) {
    userId = crypto.randomUUID()
    localStorage.setItem(USER_ID_KEY, userId)
  }
  return userId
}

export function getHistory(): DetectionResult[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addHistory(result: DetectionResult): void {
  const history = getHistory()
  history.unshift(result)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY)
}

export function getPhotoLogs(): PhotoLogEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(PHOTO_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addPhotoLog(entry: PhotoLogEntry): void {
  const logs = getPhotoLogs()
  logs.unshift(entry)
  localStorage.setItem(PHOTO_KEY, JSON.stringify(logs))
}

export function deletePhotoLog(id: string): void {
  const logs = getPhotoLogs().filter(l => l.id !== id)
  localStorage.setItem(PHOTO_KEY, JSON.stringify(logs))
}

export function exportToClipboard(history: DetectionResult[]): void {
  const text = history.map(r =>
    `${r.material.name} (${r.material.slang}) | 置信度: ${r.confidence}% | ${new Date(r.timestamp).toLocaleString('zh-CN')} | 特征: ${r.matchedFeatures.join('、')}`
  ).join('\n')
  navigator.clipboard.writeText(text)
}
