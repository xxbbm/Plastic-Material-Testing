import { NextRequest, NextResponse } from 'next/server'
import { readFeedback, addFeedback } from '@/lib/feedback-store'
import { FeedbackEntry } from '@/lib/types'

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
  const body = await request.json()
  if (!body.userId || !body.type || !body.description) {
    return NextResponse.json({ error: 'userId, type, description 为必填' }, { status: 400 })
  }
  const entry: FeedbackEntry = {
    id: `fb-${Date.now()}`,
    userId: body.userId,
    type: body.type,
    description: body.description,
    contact: body.contact || '',
    status: 'pending',
    createdAt: Date.now(),
  }
  addFeedback(entry)
  return NextResponse.json(entry, { status: 201 })
}
