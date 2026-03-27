import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  subText?: string
  delta?: number        // percentage delta vs last period
  accent?: 'violet' | 'amber' | 'emerald' | 'blue'
  icon?: LucideIcon
}

const accentClasses = {
  violet: 'bg-violet-50 text-violet-600',
  amber: 'bg-amber-50 text-amber-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  blue: 'bg-blue-50 text-blue-600',
}

export function StatCard({ title, value, subText, delta, accent = 'violet', icon: Icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        {Icon && (
          <div className={cn('p-2 rounded-xl', accentClasses[accent])}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
      <div className="flex items-center gap-2 mt-1.5">
        {delta !== undefined && (
          <span className={cn(
            'inline-flex items-center gap-0.5 text-xs font-semibold rounded-full px-1.5 py-0.5',
            delta >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
          )}>
            {delta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
        {subText && <p className="text-xs text-gray-400">{subText}</p>}
      </div>
    </div>
  )
}
