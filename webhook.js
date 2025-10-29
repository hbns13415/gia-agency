import Stripe from 'stripe';
import { buffer } from 'micro';

export const config = { api: { bodyParser: false } };
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const buf = await buffer(req);
  const sig = req.headers.get ? req.headers.get('stripe-signature') : req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    let event;
    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
    } else {
      event = JSON.parse(buf.toString());
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('Pago completado (webhook):', session.id);
      // TODO: add logic to post to Google Sheets, send email, etc.
    }
  } catch (err) {
    console.error('Webhook error:', err.message);
    return res.status(400).send(f'Webhook Error: {err.message}');
  }

  res.json({ received: true });
}