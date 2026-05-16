import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { password } = await request.json()
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

  if (password === adminPassword) {
    const response = NextResponse.json({ success: true })
    response.cookies.set('admin_auth', '1', { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 })
    return response
  }
  return NextResponse.json({ error: '口令错误' }, { status: 401 })
}
