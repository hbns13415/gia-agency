// pages/api/mercadopago/webhook.js
import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
});

export const config = {
  api: {
    bodyParser: false, // Mercado Pago requiere leer el cuerpo crudo
  },
};

export default async function handler(req, res) {
  // ✅ permitir GET (verificación) y POST (notificación real)
  if (req.method === "GET") {
    console.log("🌐 Verificación webhook OK");
    return res.status(200).json({ ok: true, message: "Webhook verificado correctamente" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // 🔹 leer cuerpo sin bodyParser
    const buffer = await new Promise((resolve) => {
      let data = "";
      req.on("data", (chunk) => (data += chunk));
      req.on("end", () => resolve(data));
    });

    let body = {};
    try {
      body = JSON.parse(buffer);
    } catch {
      const params = new URLSearchParams(buffer);
      body = Object.fromEntries(params);
    }

    console.log("📩 Webhook recibido:", body);

    const { type, data } = body;
    if (type === "payment" && data && data.id) {
      const payment = await mercadopago.payment.findById(data.id);

      if (payment.body.status === "approved") {
        const metadata = payment.body.metadata || {};
        const { name, email, objective } = metadata;

        // 🔁 ejecutar GIA automáticamente
        const exec = await fetch(`${process.env.BASE_URL}/api/gia/auto_execute`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, objective }),
        });

        const result = await exec.json();
        console.log("✅ GIA ejecutado tras pago:", result);
      }
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("❌ Error webhook:", error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}
