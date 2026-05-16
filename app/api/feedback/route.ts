import { NextRequest, NextResponse } from 'next/server'
import { readFeedback, addFeedback } from '@/lib/feedback-store'
import { FeedbackEntry } from '@/lib/types'
import { checkRateLimit } from '@/lib/rate-limit'

function getIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || '127.0.0.1'
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  let feedback = readFeedback()
  if (userId) {
    feedback = feedback.filter(f => f.userId === userId)
  }
  return NextResponse.json(feedback)
}

export async function POST(request: NextRequest) {
  // 限流：每个IP每分钟最多3条反馈，防止垃圾提交
  const ip = getIP(request)
  const rate = checkRateLimit(ip, 'feedback', { windowMs: 60_000, maxRequests: 3 })
  if (!rate.allowed) {
    return NextResponse.json(
      { error: '提交太频繁，请稍后再试' },
      { status: 429, headers: { 'Retry-After': '60' } }
    )
  }

  const body = await request.json()
  if (!body.userId || !body.type || !body.description) {
    return NextResponse.json({ error: 'userId, type, description 为必填' }, { status: 400 })
  }
  // 限制描述长度
  if (body.description.length > 2000) {
    return NextResponse.json({ error: '描述内容过长' }, { status: 400 })
  }
  const entry: FeedbackEntry = {
    id: `fb-${Date.now()}`,
    userId: body.userId,
    type: body.type,
    description: body.description.slice(0, 2000),
    contact: (body.contact || '').slice(0, 200),
    status: 'pending',
    createdAt: Date.now(),
  }
  addFeedback(entry)
  return NextResponse.json(entry, { status: 201 })
}
