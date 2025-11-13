// pages/api/mercadopago/webhook.js
import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
});

export const config = {
  api: {
    bodyParser: false, // importante para recibir raw body desde MP
  },
};

export default async function handler(req, res) {
  console.log("📥 Webhook recibido:", req.method);

  if (req.method === "GET") {
    console.log("🔗 Verificación GET exitosa");
    res.status(200).send("OK");
    return;
  }

  if (req.method === "POST") {
    try {
      // Leer cuerpo completo del request
      const chunks = [];
      req.on("data", (chunk) => chunks.push(chunk));
      req.on("end", async () => {
        const rawBody = Buffer.concat(chunks).toString("utf8");

        let body;
        try {
          body = JSON.parse(rawBody);
        } catch {
          body = Object.fromEntries(new URLSearchParams(rawBody));
        }

        console.log("📦 Payload recibido:", body);

        if (body?.type === "payment" && body?.data?.id) {
          const payment = await mercadopago.payment.findById(body.data.id);
          console.log("💰 Estado del pago:", payment.body.status);

          if (payment.body.status === "approved") {
            const metadata = payment.body.metadata || {};
            const { name, email, objective } = metadata;

            // Ejecutar automáticamente GIA
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
      });

      req.on("error", (err) => {
        console.error("❌ Error leyendo cuerpo:", err);
        res.status(500).json({ ok: false, error: err.message });
      });
    } catch (error) {
      console.error("❌ Error general en webhook:", error);
      res.status(500).json({ ok: false, error: error.message });
    }
    return;
  }

  // Aceptar cualquier otro método sin error
  res.status(200).send("OK");
}
