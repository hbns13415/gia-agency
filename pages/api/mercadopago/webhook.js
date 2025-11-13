// pages/api/mercadopago/webhook.js
import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
});

export const config = {
  api: {
    bodyParser: false, // Mercado Pago requiere el cuerpo sin procesar
  },
};

export default async function handler(req, res) {
  console.log("📥 Webhook recibido:", req.method);

  // ✅ Mercado Pago verifica con GET
  if (req.method === "GET") {
    console.log("🔗 Verificación GET recibida");
    return res.status(200).send("OK");
  }

  // ✅ Mercado Pago notifica con POST
  if (req.method === "POST") {
    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const rawBody = Buffer.concat(chunks).toString("utf8");

      let body;
      try {
        body = JSON.parse(rawBody);
      } catch {
        body = Object.fromEntries(new URLSearchParams(rawBody));
      }

      console.log("📦 Payload:", body);

      if (body?.type === "payment" && body?.data?.id) {
        const payment = await mercadopago.payment.findById(body.data.id);
        console.log("💰 Pago encontrado:", payment.body.status);

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

      return res.status(200).json({ ok: true });
    } catch (error) {
      console.error("❌ Error en webhook:", error);
      return res.status(500).json({ ok: false, error: error.message });
    }
  }

  // ✅ Aceptar cualquier otro método y devolver OK (sin 405)
  res.status(200).send("OK");
}
