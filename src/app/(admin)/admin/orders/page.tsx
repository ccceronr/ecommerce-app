import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

const statusLabels = {
  pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
  paid: { label: 'Pagado', className: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-800' },
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
        <h1 className="text-3xl font-bold text-gray-900">Ventas</h1>
        <p className="text-gray-500 mt-1">
          {orders?.length || 0} órdenes en total —{' '}
          <span className="font-medium text-green-600">
            {formattedPrice(totalRevenue)} en ingresos
          </span>
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-3 px-4 font-medium text-gray-500">Orden</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Cliente</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Items</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Total</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Estado</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((order: any) => {
              const status = statusLabels[order.status as keyof typeof statusLabels]
              return (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono font-medium">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="py-3 px-4">
                    {order.profiles?.full_name || 'Usuario'}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {order.order_items?.length || 0} items
                  </td>
                  <td className="py-3 px-4 font-medium">
                    {formattedPrice(order.total)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('es-CO')}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {(!orders || orders.length === 0) && (
          <div className="text-center py-16">
            <p className="text-gray-500">No hay órdenes aún</p>
          </div>
        )}
      </div>
    </div>
  )
}