'use client'

import Link from 'next/link'
import { ArrowLeft, Package, MessageSquare } from 'lucide-react'

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="p-2 rounded-lg bg-[#1A1A1D] hover:bg-[#27272A]">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">管理后台</h1>
        </div>
        <div className="grid gap-4">
          <Link href="/admin/materials"
            className="p-6 rounded-xl bg-[#111113] border border-[#27272A] hover:border-[#10B981]/50 transition-all flex items-center gap-4">
            <Package className="w-8 h-8 text-[#10B981]" />
            <div><h3 className="font-semibold text-lg">材质管理</h3>
              <p className="text-sm text-[#71717A] mt-1">添加、编辑、删除材质数据</p></div>
          </Link>
          <Link href="/admin/feedback"
            className="p-6 rounded-xl bg-[#111113] border border-[#27272A] hover:border-[#10B981]/50 transition-all flex items-center gap-4">
            <MessageSquare className="w-8 h-8 text-[#10B981]" />
            <div><h3 className="font-semibold text-lg">用户反馈</h3>
              <p className="text-sm text-[#71717A] mt-1">查看和处理用户反馈</p></div>
          </Link>
        </div>
      </div>
    </div>
  )
}
