import { NextRequest, NextResponse } from 'next/server'
import { readMaterials, addMaterial } from '@/lib/materials-store'
import { PlasticMaterial } from '@/lib/types'
import { isAdmin } from '@/app/api/admin/auth/route'

export async function GET() {
  const materials = readMaterials()
  return NextResponse.json(materials)
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }
  const body: PlasticMaterial = await request.json()
  if (!body.id || !body.name) {
    return NextResponse.json({ error: 'id 和 name 为必填' }, { status: 400 })
  }
  const material = addMaterial(body)
  return NextResponse.json(material, { status: 201 })
}
