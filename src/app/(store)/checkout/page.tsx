'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { ShieldCheck } from 'lucide-react'
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
        className="w-full font-semibold gap-2"
        size="lg"
        disabled={!stripe || !elements || isLoading}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Procesando pago...
          </span>
        ) : (
          <>
            <ShieldCheck className="h-4 w-4" />
            Pagar ahora
          </>
        )}
      </Button>
      <p className="text-xs text-center text-muted-foreground">
        Pago seguro procesado por Stripe. Usa la tarjeta de prueba: 4242 4242 4242 4242
      </p>
    </form>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
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

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login?redirectTo=/checkout')
    }
  }, [user, userLoading, router])

  useEffect(() => {
    if (!userLoading && items.length === 0) {
      router.push('/cart')
    }
  }, [items, userLoading, router])

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
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Preparando tu orden...</p>
        </div>
      </div>
    )
  }

  if (!clientSecret) return null

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulario de pago */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-bold text-foreground mb-6">Información de pago</h2>
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: resolvedTheme === 'dark' ? 'night' : 'stripe',
              },
            }}
          >
            <CheckoutForm orderId={orderId} />
          </Elements>
        </div>

        {/* Resumen del pedido */}
        <div className="bg-card rounded-xl border border-border p-6 h-fit sticky top-24">
          <h2 className="text-lg font-bold text-foreground mb-5">Resumen del pedido</h2>

          <div className="space-y-3 mb-5">
            {items.map((item) => (
              <div key={item.product_id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.name} ×{item.quantity}
                </span>
                <span className="font-medium text-foreground">
                  {formattedPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <Separator className="mb-4" />

          <div className="space-y-2.5 mb-5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal ({totalItems()} productos)</span>
              <span className="font-medium text-foreground">{formattedPrice(totalPrice())}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Envío</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Gratis</span>
            </div>
          </div>

          <Separator className="mb-4" />

          <div className="flex justify-between font-bold text-lg text-foreground">
            <span>Total</span>
            <span className="text-primary">{formattedPrice(totalPrice())}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
