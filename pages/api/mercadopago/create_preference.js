// pages/api/mercadopago/create_preference.js
import { MercadoPagoConfig, Preference } from "mercadopago";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    // Inicializar Mercado Pago con el Access Token
    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN,
    });

    // Crear la preferencia de pago
    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            title: req.body.title,
            quantity: req.body.quantity,
            currency_id: "ARS",
            unit_price: req.body.price,
          },
        ],
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
          failure: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
        },
        auto_return: "approved",
      },
    });

    return res.status(200).json({
      ok: true,
      id: result.id,
      init_point: result.init_point,
    });
  } catch (error) {
    console.error("MercadoPago Error:", error);
    return res.status(500).json({
      ok: false,
      error: error.message || "Internal Server Error",
    });
  }
}
