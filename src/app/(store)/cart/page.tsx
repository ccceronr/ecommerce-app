'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
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
      <div className="text-center py-20">
        <ShoppingBag className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Tu carrito está vacío
        </h2>
        <p className="text-gray-500 mb-6">
          Agrega productos para continuar
        </p>
        <Button onClick={() => router.push('/')}>
          Ver productos
        </Button>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Carrito ({totalItems()} {totalItems() === 1 ? 'item' : 'items'})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.product_id}
              className="bg-white rounded-lg border border-gray-200 p-4 flex gap-4"
            >
              {/* Imagen */}
              <div className="relative w-20 h-20 bg-gray-100 rounded-md flex-shrink-0">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover rounded-md"
                    sizes="80px"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-2xl">
                    📦
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {formattedPrice(item.price)} c/u
                </p>

                {/* Cantidad */}
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    aria-label="Disminuir cantidad"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    aria-label="Aumentar cantidad"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Precio y eliminar */}
              <div className="flex flex-col items-end justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    removeItem(item.product_id)
                    toast.success('Producto eliminado del carrito')
                  }}
                  aria-label="Eliminar producto"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <p className="font-bold text-gray-900">
                  {formattedPrice(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            className="text-red-500 hover:text-red-700"
            onClick={() => {
              clearCart()
              toast.success('Carrito vaciado')
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Vaciar carrito
          </Button>
        </div>

        {/* Resumen */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Resumen del pedido
            </h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal ({totalItems()} items)</span>
                <span>{formattedPrice(totalPrice())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Envío</span>
                <span className="text-green-600">Gratis</span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between font-bold text-lg mb-6">
              <span>Total</span>
              <span>{formattedPrice(totalPrice())}</span>
            </div>

            <Button className="w-full" size="lg" onClick={handleCheckout}>
              Proceder al pago
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