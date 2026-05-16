export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

const PROXY_URL = '/api/chat'

// 精简后的系统提示 — 去掉冗余示例，节省 ~40% token
const DEFAULT_SYSTEM_PROMPT = `你是塑料材质鉴定专家。通过简短对话帮助识别未知塑料。

规则：
1. 每次只问1个最关键问题，优先燃烧特征，其次物理特征
2. 绝不重复问过的问题。用户说"不是/不确定"立刻换方向
3. 满4轮或信息充足后给出结论：【判定结果】材质：XX(黑话:XX)|置信度：高/中/低|依据：简述|安全警告（如有）
4. 回答不超过80字

速查：火星聚拢+甜香+金属声+高透明→PC(磁碳)；火星散开+橡胶臭+沉闷+折痕发白+不透明→ABS；浮水+蜡烛味+轻→PE；浮水+柴油味+弯折→PP；浓黑烟+甜香+清脆→PS；蓝焰+烧毛发臭→PA；无焰+刺鼻甲醛+沉重→POM⚠️；绿边焰+盐酸+自熄→PVC⚠️`

const PRICE_SYSTEM_PROMPT = `你是塑料回收市场分析师。根据当前市场情况，给出指定材质的参考回收价及涨跌原因。回答简洁，不超过80字。`

// ─── 对话压缩 ────────────────────────────────────────────

function compressHistory(history: ChatMessage[]): ChatMessage[] {
  // 8条以内直接发，不压缩
  if (history.length <= 8) return history

  // 提取用户描述过的特征
  const userMessages = history
    .filter(m => m.role === 'user')
    .map(m => m.content)

  // 提取AI问过的问题
  const aiQuestions = history
    .filter(m => m.role === 'assistant')
    .map(m => m.content)

  // 生成摘要 — 不调API，纯文本拼接，零额外token
  const featureSummary = userMessages.join('；').slice(0, 200)
  const askedSummary = aiQuestions.map(q => q.slice(0, 20)).join('、').slice(0, 200)

  const summary = `[历史摘要] 用户已描述：${featureSummary}。AI已问过：${askedSummary}`

  // 保留最近6条完整消息（3轮对话）
  const recent = history.slice(-6)

  return [
    { role: 'user', content: summary },
    ...recent,
  ]
}

// ─── 主函数 ──────────────────────────────────────────────

export async function askDeepSeek(
  userMessage: string,
  conversationHistory?: ChatMessage[],
  options?: {
    systemPrompt?: string
    mode?: 'identify' | 'price'
  }
): Promise<string> {
  const systemPrompt = options?.systemPrompt
    || (options?.mode === 'price' ? PRICE_SYSTEM_PROMPT : DEFAULT_SYSTEM_PROMPT)

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
  ]

  // 压缩历史 + 追加新消息
  if (conversationHistory && conversationHistory.length > 0) {
    const compressed = compressHistory(conversationHistory)
    messages.push(...compressed)
  }
  messages.push({ role: 'user', content: userMessage })

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
