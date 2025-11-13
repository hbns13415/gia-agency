// pages/api/mp/webhook.js
import fetch from "node-fetch";

export const config = { api: { bodyParser: false } };

// 🔧 Utilidad para parsear el body crudo del webhook
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const rawBody = await getRawBody(req);
    const event = JSON.parse(rawBody);

    // 🧾 Log para verificar qué llega desde MP
    console.log("🔔 Webhook recibido:", JSON.stringify(event, null, 2));

    // 📦 Confirmar si el pago está aprobado
    if (event.type === "payment" && event.data?.id) {
      const paymentId = event.data.id;

      // 🧠 Consultar detalles del pago
      const mpResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
          },
        }
      );

      const payment = await mpResponse.json();
      console.log("💳 Detalle del pago:", payment);

      if (payment.status === "approved") {
        // 📬 Enviar a endpoint de generación automática
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/gia/auto_execute`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: payment.payer.first_name || "Usuario",
            email: payment.payer.email,
            objective: "Campaña automática tras compra de GIA",
          }),
        });

        console.log("🚀 Auto-execute disparado correctamente.");
      }
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("❌ Error en webhook:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
