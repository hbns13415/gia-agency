// pages/api/mercadopago/webhook.js
import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
});

export const config = {
  api: {
    bodyParser: false, // importante para recibir correctamente la data cruda
  },
};

export default async function handler(req, res) {
  try {
    // ✅ permitir GET (verificación de conexión)
    if (req.method === "GET") {
      console.log("🔗 Webhook verificado correctamente (GET)");
      return res.status(200).send("OK");
    }

    // ✅ permitir POST (notificación de pago)
    if (req.method === "POST") {
      let rawBody = "";
      req.on("data", (chunk) => (rawBody += chunk));
      await new Promise((resolve) => req.on("end", resolve));

      let body = {};
      try {
        body = JSON.parse(rawBody);
      } catch {
        try {
          const params = new URLSearchParams(rawBody);
          body = Object.fromEntries(params);
        } catch {
          console.log("⚠️ No se pudo parsear el cuerpo, cuerpo crudo:", rawBody);
        }
      }

      console.log("📩 Webhook recibido:", body);

      if (body?.type === "payment" && body?.data?.id) {
        const payment = await mercadopago.payment.findById(body.data.id);

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
    }

    // ❌ cualquier otro método
    return res.status(200).send("OK");
  } catch (error) {
    console.error("❌ Error en webhook:", error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}
