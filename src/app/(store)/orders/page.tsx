import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Package, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Order } from '@/types'

const statusConfig = {
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-1">Mis órdenes</h1>
        <p className="text-muted-foreground">
          {orders?.length
            ? `${orders.length} ${orders.length === 1 ? 'orden' : 'órdenes'} en total`
            : 'Historial de tus compras'}
        </p>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="text-center py-24">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-5">
            <Package className="h-9 w-9 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Aún no tienes órdenes</h2>
          <p className="text-muted-foreground mb-7">
            Cuando realices una compra, aparecerá aquí.
          </p>
          <Link href="/">
            <Button className="gap-2">
              Ver productos
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order: Order) => {
            const status = statusConfig[order.status]
            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block bg-card rounded-xl border border-border p-5 hover:border-primary/25 hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground font-mono mb-1">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="font-bold text-xl text-foreground">
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
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={status.variant}>
                      {status.label}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
