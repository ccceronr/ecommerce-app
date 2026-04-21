import { createClient } from '@/lib/supabase/server'
import { Users, Package, ShoppingBag, DollarSign } from 'lucide-react'

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
      label: 'Usuarios',
      value: totalUsers || 0,
      icon: Users,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    },
    {
      label: 'Productos',
      value: totalProducts || 0,
      icon: Package,
      color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    },
    {
      label: 'Órdenes',
      value: totalOrders || 0,
      icon: ShoppingBag,
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    },
    {
      label: 'Ingresos',
      value: formattedPrice(totalRevenue),
      icon: DollarSign,
      color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-8">Resumen general de tu tienda</p>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div
              key={metric.label}
              className="bg-card rounded-lg border border-border p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-muted-foreground">
                  {metric.label}
                </p>
                <div className={`p-2 rounded-md ${metric.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{metric.value}</p>
            </div>
          )
        })}
      </div>

      {/* Órdenes recientes */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-lg font-bold text-foreground mb-4">
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

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  }

  const statusLabels = {
    pending: 'Pendiente',
    paid: 'Pagado',
    cancelled: 'Cancelado',
  }

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
            <tr key={order.id} className="border-b border-border hover:bg-muted/50">
              <td className="py-3 px-4 font-mono text-foreground">
                #{order.id.slice(0, 8).toUpperCase()}
              </td>
              <td className="py-3 px-4 text-foreground">
                {order.profiles?.full_name || 'Usuario'}
              </td>
              <td className="py-3 px-4 font-medium text-foreground">
                {formattedPrice(order.total)}
              </td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status as keyof typeof statusColors]}`}>
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