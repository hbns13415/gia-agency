// pages/api/mp/webhook.js
export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).send('OK');

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const rawBody = Buffer.concat(chunks).toString();

    // Mercado Pago envía JSON con información del evento
    const body = JSON.parse(rawBody || '{}');

    // Ejemplos de campos típicos:
    // body.type || body.action, body.data?.id, body.resource, etc.
    console.log('🛰️ MP Webhook recibido:', body);

    // TODO: si body.type === 'payment' y body.data.id existe,
    // podés consultar a la API de MP para obtener el estado del pago
    // y luego disparar el fulfillment (envío de pack, email, etc.)

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook MP error:', err?.message || err);
    return res.status(200).send('OK'); // MP reintenta si no es 200
  }
}
