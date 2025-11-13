// pages/api/mercadopago/webhook.js
import { MercadoPagoConfig, Payment } from "mercadopago";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Inicializa el cliente con tu access token
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

export default async function handler(req, res) {
  console.log("📥 Webhook recibido:", req.method);

  if (req.method === "GET") {
    return res.status(200).send("OK");
  }

  if (req.method === "POST") {
    try {
      // leer body
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
        const paymentClient = new Payment(client);
        const payment = await paymentClient.get({ id: body.data.id });

        console.log("💰 Estado del pago:", payment.status);

        if (payment.status === "approved") {
          const metadata = payment.metadata || {};
          const { name, email, objective } = metadata;

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
      console.error("❌ Error en webhook:", error);
      res.status(500).json({ ok: false, error: error.message });
    }
    return;
  }

  res.status(200).send("OK");
}
