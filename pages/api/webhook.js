// pages/api/mp/webhook.js
export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  // Mercado Pago envía peticiones POST al webhook cuando cambia el estado de un pago
  if (req.method !== 'POST') return res.status(200).send('OK');

  try {
    // Recolectamos el cuerpo sin usar bodyParser (necesario para Next.js)
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const rawBody = Buffer.concat(chunks).toString();
    const body = JSON.parse(rawBody || '{}');

    console.log('🛰️ Webhook de Mercado Pago recibido:', body);

    // 🔍 Si querés obtener información del pago confirmado:
    const paymentId = body.data?.id;
    if (paymentId) {
      const payment = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
      }).then(r => r.json());

      console.log('💰 Estado del pago:', payment.status);
      // Ejemplo: si pago aprobado, podrías registrar venta o enviar correo
      if (payment.status === 'approved') {
        console.log('✅ Pago confirmado y aprobado.');
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('⚠️ Error en webhook MP:', err.message);
    return res.status(200).send('OK');
  }
}
