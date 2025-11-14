// pages/api/mercadopago/create_preference.js
import { MercadoPagoConfig, Preference } from "mercadopago";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ ok: false, error: "Method not allowed" });

  try {
    const { name, email, objective } = req.body;

    if (!name || !email || !objective)
      return res.status(400).json({ ok: false, error: "Missing fields" });

    // ⚠️ TOKEN REAL O SANDBOX (automático según tu variable)
    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN,
    });

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            id: "GIA_CAMPAIGN",
            title: "Campaña personalizada con IA",
            quantity: 1,
            unit_price: 29000,
            currency_id: "ARS",
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

        // ⚠️ Para que MP envíe notificaciones a tu webhook
        notification_url:
          "https://gia-agency.vercel.app/api/mercadopago/webhook",
      },
    });

    console.log("MP Preference Created:", result);

    return res.status(200).json({
      ok: true,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
    });
  } catch (error) {
    console.error("MP Create Preference Error:", error);
    return res.status(500).json({
      ok: false,
      error: error.message || "MP_ERROR",
    });
  }
}
