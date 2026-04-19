'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/hooks/useCart'
import { useUser } from '@/hooks/useUser'
import { toast } from 'sonner'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

// Formulario de pago interno
function CheckoutForm({ orderId }: { orderId: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const { clearCart } = useCart()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) return

    setIsLoading(true)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      })

      if (error) {
        toast.error(error.message || 'Error al procesar el pago')
        return
      }

      if (paymentIntent?.status === 'succeeded') {
        clearCart()
        toast.success('¡Pago exitoso! Tu orden ha sido confirmada.')
        router.push(`/orders/${orderId}`)
      }
    } catch {
      toast.error('Error inesperado al procesar el pago')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={!stripe || !elements || isLoading}
      >
        {isLoading ? 'Procesando pago...' : 'Pagar ahora'}
      </Button>
      <p className="text-xs text-center text-gray-500">
        Pago seguro procesado por Stripe. Usa la tarjeta de prueba: 4242 4242 4242 4242
      </p>
    </form>
  )
}

// Página principal de checkout
export default function CheckoutPage() {
  const router = useRouter()
  const { user, isLoading: userLoading } = useUser()
  const { items, totalPrice, totalItems } = useCart()
  const [clientSecret, setClientSecret] = useState('')
  const [orderId, setOrderId] = useState('')
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)

  const formattedPrice = (price: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login?redirectTo=/checkout')
    }
  }, [user, userLoading, router])

  // Redirigir si el carrito está vacío
  useEffect(() => {
    if (!userLoading && items.length === 0) {
      router.push('/cart')
    }
  }, [items, userLoading, router])

  // Crear Payment Intent al cargar
  useEffect(() => {
    if (!user || items.length === 0) return

    const createPaymentIntent = async () => {
      setIsCreatingOrder(true)
      try {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items }),
        })

        const data = await res.json()

        if (!res.ok) {
          toast.error(data.error || 'Error al crear la orden')
          router.push('/cart')
          return
        }

        setClientSecret(data.clientSecret)
        setOrderId(data.orderId)
      } catch {
        toast.error('Error al iniciar el checkout')
        router.push('/cart')
      } finally {
        setIsCreatingOrder(false)
      }
    }

    createPaymentIntent()
  }, [user, items, router])

  if (userLoading || isCreatingOrder) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Preparando tu orden...</p>
        </div>
      </div>
    )
  }

  if (!clientSecret) return null

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulario de pago */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold mb-6">Información de pago</h2>
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: { theme: 'stripe' },
            }}
          >
            <CheckoutForm orderId={orderId} />
          </Elements>
        </div>

        {/* Resumen del pedido */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 h-fit">
          <h2 className="text-lg font-bold mb-4">Resumen del pedido</h2>

          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div key={item.product_id} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.name} x{item.quantity}
                </span>
                <span className="font-medium">
                  {formattedPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Subtotal ({totalItems()} items)</span>
            <span>{formattedPrice(totalPrice())}</span>
          </div>
          <div className="flex justify-between text-sm mb-4">
            <span className="text-gray-600">Envío</span>
            <span className="text-green-600">Gratis</span>
          </div>

          <Separator className="my-4" />

          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{formattedPrice(totalPrice())}</span>
          </div>
        </div>
      </div>
    </div>
  )
}