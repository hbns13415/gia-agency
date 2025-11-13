// pages/api/gia/auto_execute.js
import { Resend } from "resend";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import JSZip from "jszip";

export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Método no permitido" });

  const { name, email, objective } = req.body;

  if (!email || !name)
    return res.status(400).json({ error: "Faltan datos requeridos" });

  try {
    // 🧠 1. Crear contenido base simulado
    const campaign = {
      id: Date.now().toString(36),
      name,
      email,
      objective,
      copy: `Estrategia generada automáticamente para ${name}.`,
      prompt:
        "Campaña IA generada automáticamente tras pago aprobado en Mercado Pago.",
      date: new Date().toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" }),
    };

    // 📁 2. Crear ZIP con contenido básico (mock)
    const zip = new JSZip();
    zip.file("readme.txt", "Gracias por confiar en GIA. Tu pack fue generado automáticamente.");
    zip.file("estrategia.txt", campaign.copy);
    zip.file("prompt.txt", campaign.prompt);
    const zipBuffer = await zip.generateAsync({ type: "base64" });

    // 📊 3. Guardar en Google Sheets
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    await sheet.addRow({
      Fecha: campaign.date,
      Nombre: campaign.name,
      Email: campaign.email,
      Objetivo: campaign.objective,
      Campaña_ID: campaign.id,
      Estado: "Generada automáticamente",
    });

    // 📧 4. Enviar correo con link de descarga
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "GIA <onboarding@resend.dev>",
      to: email,
      subject: "🚀 Tu campaña GIA fue generada automáticamente",
      html: `
        <h2>¡Hola ${name}!</h2>
        <p>Tu campaña fue creada automáticamente tras tu compra.</p>
        <p><b>Objetivo:</b> ${objective}</p>
        <p>Podés descargar tus archivos generados aquí:</p>
        <a href="data:application/zip;base64,${zipBuffer}" download="GIA_Pack.zip"
          style="display:inline-block;padding:12px 18px;background:#0066ff;color:white;border-radius:8px;text-decoration:none;">
          Descargar Pack
        </a>
        <p>Gracias por confiar en GIA 🚀</p>
      `,
    });

    console.log("📩 Correo enviado correctamente a:", email);

    res.status(200).json({ ok: true, campaign });
  } catch (error) {
    console.error("❌ Error en auto_execute:", error);
    res.status(500).json({ error: "Fallo al generar la campaña automática." });
  }
}
