// pages/api/mercadopago/webhook.js
import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN, // SANDBOX
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("📩 Webhook recibido:", req.body);

    const { type, data } = req.body;

    if (type !== "payment" || !data?.id) {
      return res.status(200).json({ ok: true, msg: "Evento ignorado" });
    }

    // Obtener pago sandbox
    const payment = await mercadopago.payment.findById(data.id);

    console.log("🧩 Pago encontrado:", payment.body);

    // Si está aprobado → ejecutar campaña
    if (payment.body.status === "approved") {
      console.log("🎉 Pago aprobado → Ejecutando campaña…");

      await fetch(
        "https://gia-agency.vercel.app/api/gia/execute",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: payment.body.payer?.first_name || "Cliente",
            email: payment.body.payer?.email,
            objective: "Objetivo cargado automáticamente (sandbox)",
          }),
        }
      );
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("❌ Error en webhook:", err);
    return res.status(500).json({ error: err.message });
  }
}
