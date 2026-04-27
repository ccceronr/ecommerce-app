import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const statusConfig = {
  pending: { label: 'Pendiente', variant: 'secondary' as const },
  paid: { label: 'Pagado', variant: 'default' as const },
  cancelled: { label: 'Cancelado', variant: 'destructive' as const },
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/orders')
  }

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*, product:products(id, name, images))')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!order) {
    notFound()
  }

  const formattedPrice = (price: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)

  const status = statusConfig[order.status as keyof typeof statusConfig]

  return (
    <div className="max-w-2xl mx-auto">
      {/* Volver */}
      <div className="mb-6">
        <Link href="/orders">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a mis órdenes
          </Button>
        </Link>
      </div>

      {/* Encabezado */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <p className="text-sm text-muted-foreground font-mono mb-1">
            #{order.id.slice(0, 8).toUpperCase()}
          </p>
          <h1 className="text-2xl font-bold text-foreground">Detalle de orden</h1>
        </div>
        <Badge variant={status.variant} className="text-sm px-3 py-1">
          {status.label}
        </Badge>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 mb-4">
        {/* Fecha */}
        <div className="mb-5">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
            Fecha
          </p>
          <p className="font-medium text-foreground">
            {new Date(order.created_at).toLocaleDateString('es-CO', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <Separator className="mb-5" />

        {/* Productos */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-3">
            Productos
          </p>
          <div className="space-y-3">
            {order.order_items?.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <span className="text-foreground">
                  {item.product?.name || 'Producto eliminado'}
                  <span className="text-muted-foreground ml-1.5">×{item.quantity}</span>
                </span>
                <span className="font-semibold text-foreground">
                  {formattedPrice(item.unit_price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-5" />

        <div className="flex justify-between font-bold text-lg">
          <span className="text-foreground">Total</span>
          <span className="text-primary">{formattedPrice(order.total)}</span>
        </div>
      </div>

      <Link href="/">
        <Button className="w-full font-semibold gap-2" size="lg">
          Seguir comprando
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  )
}
