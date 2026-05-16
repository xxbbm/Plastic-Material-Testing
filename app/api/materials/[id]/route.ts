import { NextRequest, NextResponse } from 'next/server'
import { getMaterialById, updateMaterial, deleteMaterial } from '@/lib/materials-store'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const material = getMaterialById(id)
  if (!material) {
    return NextResponse.json({ error: '未找到' }, { status: 404 })
  }
  return NextResponse.json(material)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const updated = updateMaterial(id, body)
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
  const deleted = deleteMaterial(id)
  if (!deleted) {
    return NextResponse.json({ error: '未找到' }, { status: 404 })
  }
  return NextResponse.json({ success: true })
}
