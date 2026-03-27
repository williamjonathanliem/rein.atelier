'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingBag,
  Calendar,
  Columns2,
  Users,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSettingsContext } from '@/contexts/SettingsContext'
import { useOrdersContext } from '@/contexts/OrdersContext'
import { useAlerts } from '@/hooks/useAlerts'

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Orders', href: '/orders', icon: ShoppingBag, badge: true },
  { label: 'Calendar', href: '/calendar', icon: Calendar },
  { label: 'Kanban', href: '/kanban', icon: Columns2 },
  { label: 'Clients', href: '/clients', icon: Users },
]

export function Sidebar() {
  const pathname = usePathname()
  const { getSetting } = useSettingsContext()
  const { orders } = useOrdersContext()
  const alerts = useAlerts(orders)
  const businessName = getSetting('business_name') || 'rein.atelier'

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-gray-100 flex flex-col z-40">
      {/* Logo / brand */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-sm font-['Syne']">
            🌸
          </div>
          <span className="font-bold text-gray-900 text-sm tracking-tight truncate">
            {businessName}
          </span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors',
                active
                  ? 'bg-violet-100 text-violet-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge && alerts.total > 0 && (
                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {alerts.total}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Settings at bottom */}
      <div className="px-3 pb-4 border-t border-gray-100 pt-3">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors',
            pathname === '/settings'
              ? 'bg-violet-100 text-violet-700 font-semibold'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          Settings
        </Link>
      </div>
    </aside>
  )
}
