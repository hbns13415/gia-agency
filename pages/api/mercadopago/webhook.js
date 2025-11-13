// pages/api/mercadopago/webhook.js
import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
});

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  try {
    const topic = req.query.topic || req.query.type;

    // 🧩 Caso 1: webhook desde pago directo
    if (topic === "payment" || topic === "merchant_order") {
      const paymentId = req.query.id || req.query["data.id"];
      const payment = await mercadopago.payment.findById(paymentId);

      if (payment.body.status === "approved") {
        const metadata = payment.body.metadata || {};
        const { name, email, objective } = metadata;

        // Ejecutar flujo GIA automático
        const result = await fetch(`${process.env.BASE_URL}/api/gia/auto_execute`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, objective }),
        });

        const data = await result.json();
        console.log("✅ GIA ejecutado tras pago:", data);
      }
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("❌ Error webhook MP:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
}
