'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/hooks/useCart'
import { useUser } from '@/hooks/useUser'
import { toast } from 'sonner'

export default function CartPage() {
  const router = useRouter()
  const { user } = useUser()
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart()

  const formattedPrice = (price: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)

  const handleCheckout = () => {
    if (!user) {
      toast.error('Debes iniciar sesión para continuar')
      router.push('/login?redirectTo=/checkout')
      return
    }
    router.push('/checkout')
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-5">
          <ShoppingBag className="h-9 w-9 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Tu carrito está vacío
        </h2>
        <p className="text-muted-foreground mb-7">
          Agrega productos para continuar
        </p>
        <Button onClick={() => router.push('/')} className="gap-2">
          Ver productos
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-8">
        Carrito{' '}
        <span className="text-muted-foreground font-normal text-xl">
          ({totalItems()} {totalItems() === 1 ? 'producto' : 'productos'})
        </span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div
              key={item.product_id}
              className="bg-card rounded-xl border border-border p-4 flex gap-4 hover:border-border/80 transition-colors"
            >
              {/* Imagen */}
              <div className="relative w-20 h-20 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {formattedPrice(item.price)} c/u
                </p>

                {/* Cantidad */}
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 rounded-full"
                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    aria-label="Disminuir cantidad"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-7 text-center text-sm font-semibold text-foreground">
                    {item.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 rounded-full"
                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    aria-label="Aumentar cantidad"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Precio y eliminar */}
              <div className="flex flex-col items-end justify-between shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  onClick={() => {
                    removeItem(item.product_id)
                    toast.success('Producto eliminado del carrito')
                  }}
                  aria-label="Eliminar producto"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <p className="font-bold text-foreground">
                  {formattedPrice(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}

          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 mt-1 gap-1.5 transition-colors"
            onClick={() => {
              clearCart()
              toast.success('Carrito vaciado')
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Vaciar carrito
          </Button>
        </div>

        {/* Resumen */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
            <h2 className="text-lg font-bold text-foreground mb-5">
              Resumen del pedido
            </h2>

            <div className="space-y-2.5 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal ({totalItems()} productos)</span>
                <span className="font-medium text-foreground">{formattedPrice(totalPrice())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Envío</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Gratis</span>
              </div>
            </div>

            <Separator className="mb-5" />

            <div className="flex justify-between font-bold text-lg mb-6 text-foreground">
              <span>Total</span>
              <span className="text-primary">{formattedPrice(totalPrice())}</span>
            </div>

            <Button className="w-full font-semibold gap-2" size="lg" onClick={handleCheckout}>
              Proceder al pago
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              className="w-full mt-3"
              onClick={() => router.push('/')}
            >
              Seguir comprando
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
