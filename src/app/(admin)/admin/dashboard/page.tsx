import { createClient } from '@/lib/supabase/server'
import { Users, Package, ShoppingBag, TrendingUp } from 'lucide-react'

const statusStyles = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50',
  paid: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50',
  cancelled: 'bg-red-50 text-red-700 border border-red-200/80 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50',
}

const statusLabels = {
  pending: 'Pendiente',
  paid: 'Pagado',
  cancelled: 'Cancelado',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { count: totalUsers },
    { count: totalProducts },
    { count: totalOrders },
    { data: revenueData },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('total').eq('status', 'paid'),
  ])

  const totalRevenue = revenueData?.reduce((sum, o) => sum + o.total, 0) || 0

  const formattedPrice = (price: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)

  const metrics = [
    {
      label: 'Ingresos',
      value: formattedPrice(totalRevenue),
      icon: TrendingUp,
      iconBg: 'bg-primary/15 text-primary',
      note: 'órdenes pagadas',
    },
    {
      label: 'Órdenes',
      value: totalOrders || 0,
      icon: ShoppingBag,
      iconBg: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
      note: 'en total',
    },
    {
      label: 'Productos',
      value: totalProducts || 0,
      icon: Package,
      iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
      note: 'en catálogo',
    },
    {
      label: 'Usuarios',
      value: totalUsers || 0,
      icon: Users,
      iconBg: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400',
      note: 'registrados',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-1">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general de tu tienda</p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div
              key={metric.label}
              className="bg-card rounded-xl border border-border p-5 hover:shadow-md hover:shadow-primary/8 hover:-translate-y-0.5 transition-all duration-200 cursor-default"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-muted-foreground">
                  {metric.label}
                </p>
                <div className={`p-2.5 rounded-lg ${metric.iconBg}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{metric.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{metric.note}</p>
            </div>
          )
        })}
      </div>

      {/* Órdenes recientes */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-bold text-foreground mb-5">
          Órdenes recientes
        </h2>
        <RecentOrders />
      </div>
    </div>
  )
}

async function RecentOrders() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('*, profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(5)

  const formattedPrice = (price: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)

  if (!orders || orders.length === 0) {
    return <p className="text-muted-foreground text-sm">No hay órdenes aún</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Orden</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Cliente</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Total</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Estado</th>
            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order: any) => (
            <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
              <td className="py-3 px-4 font-mono text-foreground font-medium">
                #{order.id.slice(0, 8).toUpperCase()}
              </td>
              <td className="py-3 px-4 text-foreground">
                {order.profiles?.full_name || 'Usuario'}
              </td>
              <td className="py-3 px-4 font-semibold text-foreground">
                {formattedPrice(order.total)}
              </td>
              <td className="py-3 px-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[order.status as keyof typeof statusStyles]}`}>
                  {statusLabels[order.status as keyof typeof statusLabels]}
                </span>
              </td>
              <td className="py-3 px-4 text-muted-foreground">
                {new Date(order.created_at).toLocaleDateString('es-CO')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
