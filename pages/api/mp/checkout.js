export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const preference = {
      items: [
        { title: 'Pack de 30 Posts en Canva', quantity: 1, unit_price: 19, currency_id: 'USD' },
      ],
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_SITE_URL}/success`,
        failure: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
        pending: `${process.env.NEXT_PUBLIC_SITE_URL}/success`,
      },
      auto_return: 'approved',
      notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mp/webhook`,
    };

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preference),
    });

    const data = await response.json();
    return res.status(200).json({ url: data.init_point });
  } catch (err) {
    console.error('Mercado Pago error:', err.message);
    return res.status(500).json({ error: 'Mercado Pago error' });
  }
}
