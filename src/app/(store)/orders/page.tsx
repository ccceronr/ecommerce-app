import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { Order } from '@/types'

const statusLabels = {
  pending: { label: 'Pendiente', variant: 'secondary' as const },
  paid: { label: 'Pagado', variant: 'default' as const },
  cancelled: { label: 'Cancelado', variant: 'destructive' as const },
}

export default async function OrdersPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/orders')
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const formattedPrice = (price: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-8">Mis órdenes</h1>

      {!orders || orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">📦</p>
          <p className="text-muted-foreground text-lg mb-4">No tienes órdenes aún</p>
          <Link
            href="/"
            className="text-primary hover:underline"
          >
            Ver productos
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: Order) => {
            const status = statusLabels[order.status]
            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block bg-card rounded-lg border border-border p-6 hover:bg-accent transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Orden #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="font-bold text-lg text-foreground">
                      {formattedPrice(order.total)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(order.created_at).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <Badge variant={status.variant}>
                    {status.label}
                  </Badge>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}