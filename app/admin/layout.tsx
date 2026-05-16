import { AdminAuth } from '@/components/admin-auth'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminAuth>{children}</AdminAuth>
}
