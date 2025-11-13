// pages/api/gia/auto_execute.js
import { Resend } from "resend";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import JSZip from "jszip";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const { name, email, objective } = req.body;
    console.log("🚀 Auto-ejecutando campaña para:", name, email);

    // 1️⃣ Generar los archivos simulados
    const jsonData = { name, email, objective, date: new Date().toISOString() };
    const csvData = `Día,Contenido\n1,Post de bienvenida\n2,Tip de valor\n3,CTA de venta`;
    const zip = new JSZip();

    zip.file("GIA_Campaign.json", JSON.stringify(jsonData, null, 2));
    zip.file("Calendar.csv", csvData);

    const zipPath = path.join("/tmp", `GIA_${Date.now()}.zip`);
    const zipContent = await zip.generateAsync({ type: "nodebuffer" });
    fs.writeFileSync(zipPath, zipContent);

    // 2️⃣ Enviar correo con enlaces
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: "¡Tu campaña GIA está lista!",
      html: `
        <h2>Hola ${name},</h2>
        <p>Tu campaña basada en: <b>${objective}</b> fue generada correctamente.</p>
        <p>Descargá tus archivos:</p>
        <ul>
          <li><a href="#">JSON maestro</a></li>
          <li><a href="#">Calendario CSV</a></li>
          <li><a href="#">Paquete ZIP</a></li>
        </ul>
        <p>Gracias por elegir GIA 💙</p>
      `,
    });

    // 3️⃣ Registrar en Google Sheets
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    await sheet.addRow({
      Fecha: new Date().toLocaleString("es-AR"),
      Nombre: name,
      Email: email,
      Objetivo: objective,
      Estado: "✅ Pago confirmado y ejecutado automáticamente",
    });

    return res.status(200).json({ ok: true, message: "Campaña ejecutada correctamente" });
  } catch (error) {
    console.error("❌ Error en auto_execute:", error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}
