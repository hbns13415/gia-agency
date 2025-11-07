// pages/api/mercadopago/create_preference.js
import mercadopago from "mercadopago";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Método no permitido" });

  try {
    // 🪙 Inicializar Mercado Pago con token de entorno
    mercadopago.configure({
      access_token: process.env.MP_ACCESS_TOKEN,
    });

    const { name, email } = req.body;

    // 📦 Crear preferencia de pago
    const preference = {
      items: [
        {
          title: "Pack de 30 Posts Editables en Canva - GIA",
          quantity: 1,
          currency_id: "USD",
          unit_price: 9.0,
        },
      ],
      payer: {
        name,
        email,
      },
      back_urls: {
        success: "https://gia-agency.vercel.app/success",
        failure: "https://gia-agency.vercel.app/failure",
        pending: "https://gia-agency.vercel.app/pending",
      },
      auto_return: "approved",
      external_reference: email,
      statement_descriptor: "GIA-Agency",
    };

    // 🚀 Crear preferencia en MP
    const response = await mercadopago.preferences.create(preference);

    return res.status(200).json({
      ok: true,
      init_point: response.body.init_point, // URL al checkout
      id: response.body.id,
    });
  } catch (error) {
    console.error("❌ Error creando preferencia:", error);
    return res.status(500).json({
      ok: false,
      error: error.message || "Error interno al crear preferencia",
    });
  }
}
