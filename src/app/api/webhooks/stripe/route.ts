import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendOrderConfirmationEmail } from '@/lib/resend/emails'
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
    const userId = paymentIntent.metadata.user_id

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID no encontrado en metadata' },
        { status: 400 }
      )
    }

    try {
      const supabase = createAdminClient()

      // Actualizar estado de la orden a paid
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'paid' })
        .eq('id', orderId)

      if (updateError) {
        console.error('Error actualizando orden:', updateError)
        return NextResponse.json(
          { error: 'Error al actualizar la orden' },
          { status: 500 }
        )
      }

      // Obtener datos de la orden para el email
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*, order_items(name:products(name), quantity, unit_price)')
        .eq('id', orderId)
        .single()

      console.log('[webhook] order:', JSON.stringify(order), 'error:', orderError)

      // Obtener datos del usuario
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single()

      // Obtener email del usuario
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)

      console.log('[webhook] user email:', userData?.user?.email, 'error:', userError)

      if (order && userData?.user?.email) {
        const orderItems = order.order_items.map((item: any) => ({
          name: item.name?.name || 'Producto',
          quantity: item.quantity,
          unit_price: item.unit_price,
        }))

        const emailResult = await sendOrderConfirmationEmail({
          to: userData.user.email,
          customerName: profile?.full_name || 'Cliente',
          orderId: order.id,
          orderItems,
          total: order.total,
        })

        console.log('[webhook] email result:', JSON.stringify(emailResult))
      } else {
        console.log('[webhook] condición falsa — order:', !!order, 'email:', userData?.user?.email)
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
      const supabase = createAdminClient()
      await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId)
    }
  }

  return NextResponse.json({ received: true })
}