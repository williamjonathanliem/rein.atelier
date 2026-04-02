export type OrderStatus = 'pending' | 'in_progress' | 'revision' | 'completed' | 'cancelled'
export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type PaymentStatus = 'paid' | 'unpaid' | 'partial'
export type InvoiceTemplate = 'classic' | 'modern' | 'minimal'

export interface Client {
  id: string
  name: string
  phone?: string
  email?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_number: string
  client_id?: string
  client_name: string
  client_phone?: string
  client_email?: string
  client_address?: string
  status: OrderStatus
  priority: Priority
  description?: string
  price: number
  deposit_paid: boolean
  deposit_amount: number
  order_date: string         // 'YYYY-MM-DD'
  deadline: string           // 'YYYY-MM-DD'
  due_date?: string          // 'YYYY-MM-DD'
  payment_status: PaymentStatus
  invoice_template: InvoiceTemplate
  invoice_color: string
  invoice_font: string
  invoice_date_format: string
  whatsapp_sent: boolean
  notes?: string
  product_type?: string
  reference_image_url?: string
  created_at: string
  updated_at: string
}

export interface InvoiceItem {
  id: string
  order_id: string
  description: string
  sub_description?: string
  qty: number
  price: number
  sort_order: number
}

export type Settings = Record<string, string>

export interface DashboardStats {
  revenueThisMonth: number
  revenueLastMonth: number
  revenueDelta: number
  outstandingTotal: number
  averageOrderValue: number
  totalOrders: number
  ordersThisMonth: number
  ordersByStatus: { status: OrderStatus; count: number }[]
  revenueByMonth: { month: string; revenue: number }[]
  upcomingDeadlines: Order[]
}

export interface AlertCounts {
  overdue: Order[]
  dueSoon: Order[]
  total: number
}
