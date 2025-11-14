// pages/api/mercadopago/create_preference.js
import mercadopago from "mercadopago";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    mercadopago.configure({
      access_token: process.env.MP_ACCESS_TOKEN, // SANDBOX
    });

    const preference = await mercadopago.preferences.create({
      items: [
        {
          title: "Campaña GIA — 29.000 ARS (sandbox)",
          quantity: 1,
          currency_id: "ARS",
          unit_price: 29000,
        },
      ],
      back_urls: {
        success: "https://gia-agency.vercel.app/success",
        failure: "https://gia-agency.vercel.app/error",
        pending: "https://gia-agency.vercel.app/pending",
      },
      auto_return: "approved",

      // MUY IMPORTANTE PARA SANDBOX
      notification_url:
        "https://gia-agency.vercel.app/api/mercadopago/webhook",
      binary_mode: true,
    });

    return res.status(200).json({
      ok: true,
      init_point: preference.body.sandbox_init_point, // SANDBOX URL
    });
  } catch (err) {
    console.error("MP Error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
