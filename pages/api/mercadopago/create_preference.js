// pages/api/mercadopago/create_preference.js
import mercadopago from "mercadopago";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    mercadopago.configure({
      access_token: process.env.MP_ACCESS_TOKEN,
    });

    const { name, email, objective } = req.body;

    const preference = {
      items: [
        {
          title: "Pack de Campañas GIA",
          quantity: 1,
          currency_id: "USD",
          unit_price: 9,
        },
      ],
      payer: { name, email },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_URL}/success`,
        failure: `${process.env.NEXT_PUBLIC_URL}/failure`,
      },
      auto_return: "approved",
      metadata: { objective },
    };

    const response = await mercadopago.preferences.create(preference);
    return res.status(200).json({ ok: true, init_point: response.body.init_point });
  } catch (error) {
    console.error("MercadoPago Error:", error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}
