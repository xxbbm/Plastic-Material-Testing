import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0B] px-4">
      <h1 className="text-6xl font-bold text-[#27272A] mb-4">404</h1>
      <p className="text-lg text-[#71717A] mb-8">页面不存在</p>
      <Link
        href="/"
        className="px-6 py-3 rounded-xl bg-[#10B981] text-[#0A0A0B] font-medium text-sm transition-all hover:bg-[#10B981]/90 active:scale-95"
      >
        返回首页
      </Link>
    </div>
  )
}
