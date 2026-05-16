import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { checkRateLimit } from '@/lib/rate-limit'

function getIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || '127.0.0.1'
}

export function isAdmin(request: NextRequest): boolean {
  const token = request.cookies.get('admin_token')?.value
  return token === globalThis.__adminToken
}

declare global { var __adminToken: string | undefined }

export async function POST(request: NextRequest) {
  // 限流：每个IP每分钟最多5次尝试
  const ip = getIP(request)
  const rate = checkRateLimit(ip, 'admin-auth', { windowMs: 60_000, maxRequests: 5 })
  if (!rate.allowed) {
    return NextResponse.json(
      { error: '尝试次数过多，请1分钟后再试' },
      { status: 429, headers: { 'Retry-After': '60' } }
    )
  }

  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) {
    return NextResponse.json({ error: '管理员口令未配置' }, { status: 500 })
  }

  const { password } = await request.json()
  if (!password) {
    return NextResponse.json({ error: '口令不能为空' }, { status: 400 })
  }

  if (password === adminPassword) {
    const token = randomUUID()
    globalThis.__adminToken = token
    const response = NextResponse.json({ success: true })
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    })
    return response
  }
  return NextResponse.json({ error: '口令错误' }, { status: 401 })
}
