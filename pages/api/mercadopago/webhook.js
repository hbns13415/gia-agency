// pages/api/mercadopago/webhook.js
import mercadopago from "mercadopago";
import getRawBody from "raw-body";

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
});

export const config = {
  api: {
    bodyParser: false, // Necesario para procesar notificaciones URL-encoded
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // 🔍 Obtenemos el cuerpo bruto y lo convertimos según el tipo
    const rawBody = await getRawBody(req);
    let body;

    try {
      body = JSON.parse(rawBody.toString());
    } catch {
      // MP puede enviar x-www-form-urlencoded
      const text = rawBody.toString();
      body = Object.fromEntries(new URLSearchParams(text));
    }

    const { type, data } = body;

    console.log("📩 Webhook recibido de MP:", body);

    // Validamos que sea un pago
    if (type === "payment" && data && data.id) {
      const payment = await mercadopago.payment.findById(data.id);

      if (payment.body.status === "approved") {
        const metadata = payment.body.metadata || {};
        const { name, email, objective } = metadata;

        // Ejecutar GIA automáticamente
        const exec = await fetch(`${process.env.BASE_URL}/api/gia/auto_execute`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, objective }),
        });

        const result = await exec.json();
        console.log("✅ GIA ejecutado tras pago:", result);
      }
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("❌ Error webhook MP:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
}
