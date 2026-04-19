import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const statusLabels = {
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

  const status = statusLabels[order.status as keyof typeof statusLabels]

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/orders">
          <Button variant="outline" size="sm">← Volver</Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Orden #{order.id.slice(0, 8).toUpperCase()}
        </h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500">Estado</p>
            <Badge variant={status.variant} className="mt-1">
              {status.label}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Fecha</p>
            <p className="font-medium">
              {new Date(order.created_at).toLocaleDateString('es-CO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        <Separator className="my-4" />

        <h2 className="font-bold mb-4">Productos</h2>
        <div className="space-y-3">
          {order.order_items?.map((item: any) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-600">
                {item.product?.name || 'Producto eliminado'} x{item.quantity}
              </span>
              <span className="font-medium">
                {formattedPrice(item.unit_price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>{formattedPrice(order.total)}</span>
        </div>
      </div>

      <Link href="/">
        <Button className="w-full">Seguir comprando</Button>
      </Link>
    </div>
  )
}