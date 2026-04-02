import { Sidebar } from '@/components/layout/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="ml-60 flex-1 flex flex-col overflow-y-auto bg-gray-50">
        {children}
      </main>
    </div>
  )
}
