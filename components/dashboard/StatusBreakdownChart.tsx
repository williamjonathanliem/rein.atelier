'use client'

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import type { OrderStatus } from '@/types'

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: '#fcd34d',
  in_progress: '#60a5fa',
  revision: '#fb923c',
  completed: '#34d399',
  cancelled: '#d1d5db',
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  revision: 'Revision',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

interface StatusBreakdownChartProps {
  data: { status: OrderStatus; count: number }[]
  totalOrders: number
}

function CustomLabel({ cx, cy, totalOrders }: { cx: number; cy: number; totalOrders: number }) {
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
      <tspan x={cx} dy="-8" fontSize="22" fontWeight="700" fill="#111827">{totalOrders}</tspan>
      <tspan x={cx} dy="20" fontSize="11" fill="#9ca3af">pesanan</tspan>
    </text>
  )
}

export function StatusBreakdownChart({ data, totalOrders }: StatusBreakdownChartProps) {
  const chartData = data.map(d => ({
    name: STATUS_LABELS[d.status] ?? d.status,
    value: d.count,
    color: STATUS_COLORS[d.status] ?? '#d1d5db',
  }))

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <p className="text-sm font-semibold text-gray-700 mb-4">Status Pesanan</p>
      {data.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">
          Belum ada data
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [value, name]}
              contentStyle={{ borderRadius: '12px', border: '1px solid #f0f0f0', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
            />
            <Legend
              formatter={(value) => <span style={{ fontSize: '11px', color: '#6b7280' }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
