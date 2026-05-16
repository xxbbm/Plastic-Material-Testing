import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { checkRateLimit } from '@/lib/rate-limit'

const API_KEY = process.env.DEEPSEEK_API_KEY || ''
const BASE_URL = 'https://api.deepseek.com/v1/chat/completions'

// ─── 响应缓存 ─────────────────────────────────────────────
// 对完全相同的请求，5分钟内直接返回缓存，零 API 消耗

interface CacheEntry {
  response: string
  expiresAt: number
}

const cache = new Map<string, CacheEntry>()
const CACHE_TTL = 5 * 60 * 1000 // 5分钟

function hashRequest(messages: unknown[]): string {
  return createHash('md5').update(JSON.stringify(messages)).digest('hex')
}

// 定期清理过期缓存
setInterval(() => {
  const now = Date.now()
  for (const [k, v] of cache) {
    if (now > v.expiresAt) cache.delete(k)
  }
}, 10 * 60 * 1000)

// ─── 工具函数 ─────────────────────────────────────────────

function getIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || '127.0.0.1'
}

// ─── 主处理 ───────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const ip = getIP(request)
  const rate = checkRateLimit(ip, 'chat', { windowMs: 60_000, maxRequests: 20 })
  if (!rate.allowed) {
    return NextResponse.json(
      { error: '请求太频繁，请稍后再试' },
      { status: 429, headers: { 'Retry-After': '60' } }
    )
  }

  if (!API_KEY) {
    return NextResponse.json(
      { error: 'DeepSeek API Key 未配置' },
      { status: 500 }
    )
  }

  try {
    const body = await request.json()

    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json({ error: '无效请求' }, { status: 400 })
    }

    const lastMsg = body.messages[body.messages.length - 1]?.content
    if (typeof lastMsg === 'string' && lastMsg.length > 2000) {
      return NextResponse.json({ error: '消息过长' }, { status: 400 })
    }

    // 查缓存
    const cacheKey = hashRequest(body.messages)
    const cached = cache.get(cacheKey)
    if (cached && Date.now() < cached.expiresAt) {
      return NextResponse.json({
        choices: [{ message: { content: cached.response } }],
        cached: true,
      })
    }

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: body.messages,
        max_tokens: Math.min(body.max_tokens || 300, 500),
        temperature: body.temperature ?? 0.7,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `DeepSeek API error ${response.status}: ${errorText}` },
        { status: response.status }
      )
    }

    const data = await response.json()

    // 存入缓存
    const content = data.choices?.[0]?.message?.content
    if (content) {
      cache.set(cacheKey, { response: content, expiresAt: Date.now() + CACHE_TTL })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'AI 服务暂时不可用' },
      { status: 500 }
    )
  }
}
