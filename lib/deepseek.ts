export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

const API_KEY = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || ''
const BASE_URL = 'https://api.deepseek.com/v1/chat/completions'

const DEFAULT_SYSTEM_PROMPT = `你是一位经验丰富的塑料材质鉴定专家。你的工作方式是与用户进行诊断式对话：

1. 用户描述他们遇到的塑料特征后，你不要急于给出结论
2. 先分析用户已经提供了哪些特征，还缺少哪些关键判断依据
3. 每次只问1-2个最关键的问题来进一步缩小范围。例如：
   - "燃烧时气味是偏甜香还是偏橡胶臭？"
   - "敲击声音是清脆的金属声还是沉闷声？"
   - "弯折后折痕处有没有发白？"
   - "放在水里是浮起来还是沉下去？"
4. 当你收集到足够的信息（通常3-4轮对话后），给出你的判断：
   - 最可能的材质（含行业黑话）
   - 置信度评估（高/中/低）
   - 为什么是这个材质而非其他相似材质
   - 安全提醒（如有毒、需通风等）

回答风格：简洁专业，每次不超过100字。优先问燃烧特征（区分度最高），其次物理特征。如果用户说"不确定"或"不知道"，直接换下一个问题，不要纠结。`

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
