import { resend } from './client'

interface OrderConfirmationEmailProps {
  to: string
  customerName: string
  orderId: string
  orderItems: {
    name: string
    quantity: number
    unit_price: number
  }[]
  total: number
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price)

export async function sendOrderConfirmationEmail({
  to,
  customerName,
  orderId,
  orderItems,
  total,
}: OrderConfirmationEmailProps) {
  const orderNumber = orderId.slice(0, 8).toUpperCase()

  const itemsHtml = orderItems
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
          ${item.name}
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; text-align: right;">
          ${formatPrice(item.unit_price * item.quantity)}
        </td>
      </tr>
    `
    )
    .join('')

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmación de orden</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background-color: #111827; padding: 32px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
            Ecommerce App
          </h1>
        </div>

        <!-- Body -->
        <div style="padding: 32px;">
          <h2 style="color: #111827; font-size: 20px; margin: 0 0 8px;">
            ¡Gracias por tu compra, ${customerName}!
          </h2>
          <p style="color: #6b7280; margin: 0 0 24px;">
            Tu orden <strong>#${orderNumber}</strong> ha sido confirmada y está siendo procesada.
          </p>

          <!-- Orden -->
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
            <div style="background-color: #f9fafb; padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
              <h3 style="margin: 0; font-size: 14px; color: #374151; font-weight: 600;">
                Detalle de tu orden
              </h3>
            </div>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f9fafb;">
                  <th style="padding: 10px 16px; text-align: left; font-size: 12px; color: #6b7280; font-weight: 500;">Producto</th>
                  <th style="padding: 10px 16px; text-align: center; font-size: 12px; color: #6b7280; font-weight: 500;">Cantidad</th>
                  <th style="padding: 10px 16px; text-align: right; font-size: 12px; color: #6b7280; font-weight: 500;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding: 16px; text-align: right; font-weight: 600; color: #111827;">
                    Total
                  </td>
                  <td style="padding: 16px; text-align: right; font-weight: 700; color: #111827; font-size: 18px;">
                    ${formatPrice(total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- CTA -->
          <div style="text-align: center; margin-bottom: 24px;">
            <a
              href="${process.env.NEXT_PUBLIC_APP_URL}/orders"
              style="display: inline-block; background-color: #111827; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;"
            >
              Ver mis órdenes
            </a>
          </div>

          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
            Si tienes alguna pregunta, responde a este correo y te ayudaremos.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 20px 32px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
            © ${new Date().getFullYear()} Ecommerce App. Todos los derechos reservados.
          </p>
        </div>

      </div>
    </body>
    </html>
  `

  try {
    const { data, error } = await resend.emails.send({
      from: 'Ecommerce App <onboarding@resend.dev>',
      to,
      subject: `✅ Orden #${orderNumber} confirmada`,
      html,
    })

    if (error) {
      console.error('Error enviando email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error enviando email:', error)
    return { success: false, error }
  }
}