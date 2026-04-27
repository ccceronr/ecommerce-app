import { createClient } from '@/lib/supabase/server'

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

export default async function AdminOrdersPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('*, profiles(full_name), order_items(id)')
    .order('created_at', { ascending: false })

  const formattedPrice = (price: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)

  const totalRevenue = orders
    ?.filter((o) => o.status === 'paid')
    .reduce((sum, o) => sum + o.total, 0) || 0

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-1">Ventas</h1>
        <p className="text-muted-foreground">
          {orders?.length || 0} {orders?.length === 1 ? 'orden' : 'órdenes'} en total —{' '}
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {formattedPrice(totalRevenue)} en ingresos
          </span>
        </p>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {orders && orders.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Orden</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Cliente</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Items</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Total</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Estado</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => (
                <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-foreground">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="py-3 px-4 text-foreground">
                    {order.profiles?.full_name || 'Usuario'}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {order.order_items?.length || 0}
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
        ) : (
          <div className="text-center py-16">
            <p className="font-semibold text-foreground mb-1">Sin órdenes</p>
            <p className="text-muted-foreground text-sm">Las órdenes de tus clientes aparecerán aquí</p>
          </div>
        )}
      </div>
    </div>
  )
}
