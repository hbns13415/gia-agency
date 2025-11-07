// pages/api/mercadopago/create_preference.js
import mercadopago from "mercadopago";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Método no permitido" });

  try {
    mercadopago.configure({
      access_token: process.env.MP_ACCESS_TOKEN, // ⚙️ Definí en Vercel
    });

    const { name, email } = req.body;

    const preference = {
      items: [
        {
          title: "Pack GIA - Campaña Inteligente",
          description: "Generá tu pack editable y calendario de contenido IA",
          quantity: 1,
          currency_id: "ARS",
          unit_price: 9000, // ≈ 9 USD (ajustá si querés precio dinámico)
        },
      ],
      payer: { name, email },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL}/failure`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/pending`,
      },
      auto_return: "approved",
    };

    const response = await mercadopago.preferences.create(preference);
    return res.status(200).json({ init_point: response.body.init_point });
  } catch (error) {
    console.error("MercadoPago error:", error);
    return res.status(500).json({ error: error.message });
  }
}
