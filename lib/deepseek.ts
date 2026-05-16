export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

// 请求走服务端 API Route 中转，API Key 不暴露到浏览器
const PROXY_URL = '/api/chat'

const DEFAULT_SYSTEM_PROMPT = `你是塑料材质鉴定专家。你通过简短对话帮助用户识别未知塑料。

核心规则：
1. 每次只问1个最关键的问题，优先问燃烧特征（火星走向、火焰颜色、烟雾、气味），其次物理特征（声音、折痕、表面、重量、透明度）
2. 绝不重复问过的问题。如果用户回答"不是""没有""不确定"，立刻换一个完全不同的方向问
3. 问满4轮或收集到足够特征后，必须给出结论，格式：
   【判定结果】
   材质：XX (行业黑话: XX)
   置信度：高/中/低
   依据：简述匹配的关键特征
   注意：如有安全风险请警告
4. 回答简洁，每次不超过80字

常见材质速查：
- 火星聚拢+花果甜香+金属脆声+高透明 = PC (磁碳)
- 火星散开+橡胶臭+沉闷声+折痕发白+不透明 = ABS
- 火星散开+折痕轻微发白+不透明+中等声音 = PC/ABS合金
- 浮水+蜡烛味+蜡质手感+异常轻 = PE
- 浮水+柴油味+蜡质手感+弯折不断 = PP
- 浓黑烟+甜芳香味+清脆+透明 = PS (硬胶)
- 蓝色火焰+烧毛发臭+金属脆声+韧性好 = PA (尼龙)
- 火焰几乎不可见+甲醛刺鼻+异常沉重 = POM (赛钢) ⚠️剧毒
- 绿色火焰边缘+盐酸刺鼻+自熄 = PVC ⚠️剧毒
- 浓黑烟+无火星+橡胶臭+自熄 = 阻燃ABS`

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
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, max_tokens: 300, temperature: 0.7 }),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.error || `请求失败 (${response.status})`)
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
