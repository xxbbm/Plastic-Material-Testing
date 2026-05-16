import { NextRequest, NextResponse } from 'next/server'
import { updateFeedbackStatus, deleteFeedback } from '@/lib/feedback-store'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const updated = updateFeedbackStatus(id, body.status, body.adminNote)
  if (!updated) {
    return NextResponse.json({ error: '未找到' }, { status: 404 })
  }
  return NextResponse.json(updated)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const deleted = deleteFeedback(id)
  if (!deleted) {
    return NextResponse.json({ error: '未找到' }, { status: 404 })
  }
  return NextResponse.json({ success: true })
}
