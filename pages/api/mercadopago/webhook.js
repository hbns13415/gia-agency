// pages/api/mercadopago/webhook.js
import { MercadoPagoConfig, Payment } from "mercadopago";
import getRawBody from "raw-body";

export const config = {
  api: {
    bodyParser: false, // Necesario para Mercado Pago
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const raw = await getRawBody(req);
    const data = JSON.parse(raw.toString());

    console.log("📩 Webhook recibido:", data);

    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN,
    });

    // MP v2: los pagos llegan como type "payment" con id en data.id
    if (data.type !== "payment") {
      console.log("Evento ignorado:", data.type);
      return res.status(200).json({ ok: true, ignored: true });
    }

    const paymentId = data.data.id;

    console.log("🔍 Buscando pago:", paymentId);

    const paymentClient = new Payment(client);

    const payment = await paymentClient.get({ id: paymentId });

    console.log("💰 Pago encontrado:", payment);

    // Registrar en Logs o Google Sheets
    // Generar campaña si payment.status === "approved"
    // Enviar email, etc.

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("❌ Error en webhook:", error);
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
}
