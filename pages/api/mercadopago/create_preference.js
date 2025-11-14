// pages/api/mercadopago/create_preference.js
import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  sandbox: true
});

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  try {
    const { title, price, quantity, name, email, objective } = req.body;

    const preferenceClient = new Preference(client);

    const preference = await preferenceClient.create({
      body: {
        items: [
          {
            title,
            quantity,
            currency_id: "ARS",
            unit_price: Number(price),
          },
        ],
        metadata: { name, email, objective },
        back_urls: {
          success: `${process.env.BASE_URL}/success`,
          failure: `${process.env.BASE_URL}/failure`,
          pending: `${process.env.BASE_URL}/pending`,
        },
        auto_return: "approved",
        notification_url: `${process.env.BASE_URL}/api/mercadopago/webhook`,
      },
    });

    return res.status(200).json({
      ok: true,
      init_point: preference.init_point, // link real de pago
    });
  } catch (error) {
    console.error("❌ Error creando preferencia:", error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}
