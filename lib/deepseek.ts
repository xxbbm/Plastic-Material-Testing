export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

const API_KEY = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || ''
const BASE_URL = 'https://api.deepseek.com/v1/chat/completions'

const DEFAULT_SYSTEM_PROMPT = `你是塑料材质识别专家。用户描述塑料特征，请给出最可能的材质（含行业黑话）、可能性排序、判定依据。回答简洁专业，不超过100字。`

const PRICE_SYSTEM_PROMPT = `你是塑料回收市场分析师。根据当前市场情况，给出指定材质的参考回收价及涨跌原因。回答简洁，不超过80字。`

export async function askDeepSeek(
  userMessage: string,
  options?: {
    systemPrompt?: string
    mode?: 'identify' | 'price'
  }
): Promise<string> {
  const systemPrompt = options?.systemPrompt
    || (options?.mode === 'price' ? PRICE_SYSTEM_PROMPT : DEFAULT_SYSTEM_PROMPT)

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ]

  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`DeepSeek API error ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || 'AI 未返回有效响应'
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`AI 请求失败: ${error.message}`)
    }
    throw new Error('AI 请求失败: 未知错误')
  }
}
