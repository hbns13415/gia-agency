// pages/api/mercadopago/create_preference.js
import MercadoPagoConfig, { Preference } from "mercadopago";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const { email, name, objective } = req.body;
    if (!email || !name || !objective) {
      return res.status(400).json({ ok: false, error: "Missing fields" });
    }

    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN,  // Modo test o prod
      options: { timeout: 5000 }
    });

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        payer: { email },
        items: [
          {
            title: "Campaña personalizada GIA",
            quantity: 1,
            unit_price: 29000,
            currency_id: "ARS",
          },
        ],
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
          failure: `${process.env.NEXT_PUBLIC_BASE_URL}/failure`,
          pending: `${process.env.NEXT_PUBLIC_BASE_URL}/pending`
        },
        auto_return: "approved",
        notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mercadopago/webhook`,
        metadata: { email, name, objective }
      }
    });

    return res.status(200).json({
      ok: true,
      init_point: result.init_point,
      id: result.id
    });

  } catch (error) {
    console.error("MP Error:", error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}
