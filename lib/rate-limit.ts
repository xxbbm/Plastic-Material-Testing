// 内存限流 — 简单实用，不依赖外部服务
const rateMap = new Map<string, { count: number; resetAt: number }>()

interface RateLimitOptions {
  windowMs: number   // 时间窗口（毫秒）
  maxRequests: number // 窗口内最大请求数
}

export function checkRateLimit(
  ip: string,
  route: string,
  options: RateLimitOptions
): { allowed: boolean; remaining: number } {
  const key = `${ip}:${route}`
  const now = Date.now()
  const entry = rateMap.get(key)

  if (!entry || now > entry.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + options.windowMs })
    return { allowed: true, remaining: options.maxRequests - 1 }
  }

  if (entry.count >= options.maxRequests) {
    return { allowed: false, remaining: 0 }
  }

  entry.count++
  return { allowed: true, remaining: options.maxRequests - entry.count }
}

// 定期清理过期条目（每 5 分钟）
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateMap) {
    if (now > entry.resetAt) rateMap.delete(key)
  }
}, 5 * 60 * 1000)
