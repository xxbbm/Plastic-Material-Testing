import { NextRequest, NextResponse } from 'next/server'

// 服务端环境变量，不会暴露到浏览器
const API_KEY = process.env.DEEPSEEK_API_KEY || ''
const BASE_URL = 'https://api.deepseek.com/v1/chat/completions'

export async function POST(request: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: 'DeepSeek API Key 未配置' },
      { status: 500 }
    )
  }

  try {
    const body = await request.json()

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: body.messages,
        max_tokens: body.max_tokens || 300,
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
