'use client'

import { useState, useEffect } from 'react'
import { Lock } from 'lucide-react'

export function AdminAuth({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    const auth = document.cookie.includes('admin_auth=1')
    setAuthenticated(auth)
  }, [])

  const handleLogin = async () => {
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      setAuthenticated(true)
      setError(false)
    } else {
      setError(true)
    }
  }

  if (authenticated) return <>{children}</>

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B]">
      <div className="w-full max-w-sm mx-4 p-6 rounded-xl bg-[#111113] border border-[#27272A]">
        <div className="flex flex-col items-center mb-6">
          <Lock className="w-10 h-10 text-[#10B981] mb-3" />
          <h2 className="text-xl font-bold">管理后台</h2>
          <p className="text-sm text-[#71717A] mt-1">请输入管理口令</p>
        </div>
        <input
          type="password"
          value={password}
          onChange={e => { setPassword(e.target.value); setError(false) }}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          placeholder="输入口令..."
          className="w-full px-4 py-3 rounded-lg bg-[#0A0A0B] border border-[#27272A] text-sm placeholder:text-[#52525B] focus:outline-none focus:border-[#10B981]/50 mb-3"
        />
        {error && <p className="text-sm text-[#EF4444] mb-3">口令错误</p>}
        <button onClick={handleLogin}
          className="w-full py-3 rounded-lg bg-[#10B981] text-[#0A0A0B] font-medium text-sm active:scale-95 transition-all">
          进入后台
        </button>
      </div>
    </div>
  )
}
