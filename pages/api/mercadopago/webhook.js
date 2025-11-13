// pages/api/mercadopago/webhook.js
import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
});

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { type, data } = req.body;

    // Solo procesar pagos aprobados
    if (type === "payment" && data && data.id) {
      const payment = await mercadopago.payment.findById(data.id);

      if (payment.body.status === "approved") {
        const metadata = payment.body.metadata || {};
        const { name, email, objective } = metadata;

        // Ejecutar automáticamente GIA tras pago aprobado
        const response = await fetch(`${process.env.BASE_URL}/api/gia/auto_execute`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, objective }),
        });

        const result = await response.json();
        console.log("✅ GIA ejecutado tras pago:", result);
      }
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("❌ Error webhook MP:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
}
