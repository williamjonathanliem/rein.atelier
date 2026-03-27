import { Sidebar } from '@/components/layout/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-60 flex-1 min-h-screen bg-gray-50">
        {children}
      </main>
    </div>
  )
}
