import Stripe from 'stripe';
import { buffer } from 'micro';

export const config = {
  api: { bodyParser: false },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  try {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
    } else {
      event = JSON.parse(buf.toString());
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('✅ Pago completado (webhook):', session.id);
      // Acá podrías agregar lógica extra: enviar email, actualizar base, etc.
    }

    res.json({ received: true });
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
}
