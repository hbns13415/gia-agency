// pages/api/mp/checkout.js
import mercadopago from 'mercadopago';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    mercadopago.configure({
      access_token: process.env.MERCADOPAGO_ACCESS_TOKEN,
    });

    const preference = {
      items: [
        {
          title: 'Pack de 30 Posts en Canva',
          quantity: 1,
          unit_price: 19, // USD o ARS según tu cuenta
          currency_id: 'USD', // o 'ARS' si vas a cobrar en pesos
        },
      ],
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_SITE_URL}/success`,
        failure: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
        pending: `${process.env.NEXT_PUBLIC_SITE_URL}/success`,
      },
      auto_return: 'approved',
      notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mp/webhook`, // webhook
    };

    const result = await mercadopago.preferences.create(preference);
    // init_point (producción) | sandbox_init_point (sandbox)
    const url = result.body.init_point || result.body.sandbox_init_point;

    return res.status(200).json({ url });
  } catch (err) {
    console.error('MP checkout error:', err?.message || err);
    return res.status(500).json({ error: 'Mercado Pago error' });
  }
}
