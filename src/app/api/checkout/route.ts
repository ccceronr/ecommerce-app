import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'
import { z } from 'zod'

const checkoutSchema = z.object({
  items: z.array(
    z.object({
      product_id: z.string().uuid(),
      name: z.string().min(1),
      price: z.number().positive(),
      quantity: z.number().int().positive(),
      image: z.string().nullable(),
    })
  ).min(1, 'El carrito no puede estar vacío'),
})

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Validar body
    const body = await request.json()
    const validation = checkoutSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { items } = validation.data

    // Verificar stock de productos en DB
    const productIds = items.map((i) => i.product_id)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, stock, active')
      .in('id', productIds)

    if (productsError || !products) {
      return NextResponse.json(
        { error: 'Error al verificar productos' },
        { status: 500 }
      )
    }

    // Validar que todos los productos existen, están activos y tienen stock
    for (const item of items) {
      const product = products.find((p) => p.id === item.product_id)

      if (!product || !product.active) {
        return NextResponse.json(
          { error: `Producto no disponible: ${item.name}` },
          { status: 400 }
        )
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuficiente para: ${item.name}` },
          { status: 400 }
        )
      }

      // Usar precio de la DB — nunca confiar en el precio del cliente
      item.price = product.price
    }

    // Calcular total con precios de la DB
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

    // Crear orden en DB con estado pending
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'pending',
        total,
      })
      .select()
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Error al crear la orden' },
        { status: 500 }
      )
    }

    // Crear order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.price,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      return NextResponse.json(
        { error: 'Error al crear items de la orden' },
        { status: 500 }
      )
    }

    // Crear Payment Intent en Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Stripe usa centavos
      currency: 'usd', // Usamos USD para test mode
      metadata: {
        order_id: order.id,
        user_id: user.id,
      },
    })

    // Guardar stripe_pi_id en la orden
    await supabase
      .from('orders')
      .update({ stripe_pi_id: paymentIntent.id })
      .eq('id', order.id)

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
    })
  } catch (error) {
    console.error('Error en checkout:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}