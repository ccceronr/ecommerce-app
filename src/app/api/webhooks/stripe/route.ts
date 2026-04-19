import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Firma de webhook faltante' },
      { status: 400 }
    )
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Webhook secret no configurado' },
      { status: 500 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch {
    return NextResponse.json(
      { error: 'Firma de webhook inválida' },
      { status: 400 }
    )
  }

  // Manejar evento de pago exitoso
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    const orderId = paymentIntent.metadata.order_id

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID no encontrado en metadata' },
        { status: 400 }
      )
    }

    try {
      const supabase = await createClient()

      // Actualizar estado de la orden a paid
      const { error } = await supabase
        .from('orders')
        .update({ status: 'paid' })
        .eq('id', orderId)

      if (error) {
        console.error('Error actualizando orden:', error)
        return NextResponse.json(
          { error: 'Error al actualizar la orden' },
          { status: 500 }
        )
      }
    } catch (error) {
      console.error('Error en webhook:', error)
      return NextResponse.json(
        { error: 'Error interno' },
        { status: 500 }
      )
    }
  }

  // Manejar evento de pago fallido
  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    const orderId = paymentIntent.metadata.order_id

    if (orderId) {
      const supabase = await createClient()
      await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId)
    }
  }

  return NextResponse.json({ received: true })
}