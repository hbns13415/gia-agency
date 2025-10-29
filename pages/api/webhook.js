// pages/api/mp/webhook.js
export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).send('OK');

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const rawBody = Buffer.concat(chunks).toString();
    const body = JSON.parse(rawBody || '{}');

    console.log('🛰️ Webhook de Mercado Pago recibido:', body);

    // Podés consultar el estado del pago así:
    // const paymentId = body.data?.id;
    // if (paymentId) {
    //   const payment = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    //     headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` }
    //   }).then(r => r.json());
    //   console.log('Estado del pago:', payment.status);
    // }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook MP error:', err.message);
    return res.status(200).send('OK');
  }
}
