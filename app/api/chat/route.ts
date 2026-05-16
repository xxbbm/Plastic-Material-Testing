import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'

// 服务端环境变量，不会暴露到浏览器
const API_KEY = process.env.DEEPSEEK_API_KEY || ''
const BASE_URL = 'https://api.deepseek.com/v1/chat/completions'

function getIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || '127.0.0.1'
}

export async function POST(request: NextRequest) {
  // 限流：每IP每分钟20次。正常聊天3-5轮对话约5-8次请求，足够。
  // 共享IP下多人同时用也够，但恶意代理滥用会被拦住
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

    // 校验输入
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json({ error: '无效请求' }, { status: 400 })
    }

    const lastMsg = body.messages[body.messages.length - 1]?.content
    if (typeof lastMsg === 'string' && lastMsg.length > 2000) {
      return NextResponse.json({ error: '消息过长' }, { status: 400 })
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
        max_tokens: Math.min(body.max_tokens || 300, 500),  // 上限 500 token
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
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'AI 服务暂时不可用' },
      { status: 500 }
    )
  }
}
