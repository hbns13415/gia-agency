// pages/api/mercadopago/webhook.js
import MercadoPagoConfig, { Payment } from "mercadopago";

export const config = {
  api: { bodyParser: false }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false });
  }

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const rawBody = Buffer.concat(chunks).toString("utf8");
    const event = JSON.parse(rawBody);

    console.log("🔔 Webhook recibido:", event);

    if (event.type !== "payment") {
      return res.status(200).json({ ok: true, msg: "Ignored" });
    }

    const paymentId = event.data.id;

    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN
    });

    const payment = new Payment(client);
    const info = await payment.get({ id: paymentId });

    console.log("💰 Pago verificado:", info);

    // acá puedes ejecutar flujo GIA, enviar email, Google Sheets, etc.

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error("❌ Error en webhook:", err);
    return res.status(500).json({ ok: false });
  }
}
