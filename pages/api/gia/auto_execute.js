// pages/api/gia/auto_execute.js
import { Resend } from "resend";
import JSZip from "jszip";
import { put } from "@vercel/blob";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Método no permitido" });

  try {
    const { name, email, objective } = req.body;

    // === 1️⃣ CREAR ARCHIVOS JSON / CSV / ZIP ===
    const jsonData = { name, email, objective, generatedAt: new Date().toISOString() };
    const csvData = `name,email,objective,generatedAt\n"${name}","${email}","${objective}","${new Date().toISOString()}"`;

    const zip = new JSZip();
    zip.file("campaign.json", JSON.stringify(jsonData, null, 2));
    zip.file("calendar.csv", csvData);
    const zipBlob = await zip.generateAsync({ type: "nodebuffer" });

    // === 2️⃣ SUBIR A VERCEL BLOB ===
    const id = Math.random().toString(36).substring(2, 10);
    const [jsonUpload, csvUpload, zipUpload] = await Promise.all([
      put(`gia/campaign_${id}.json`, JSON.stringify(jsonData), { access: "public" }),
      put(`gia/calendar_${id}.csv`, csvData, { access: "public" }),
      put(`gia/GIA_${id}.zip`, zipBlob, { access: "public" }),
    ]);

    // === 3️⃣ REGISTRAR EN GOOGLE SHEETS ===
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    await sheet.addRow({
      Timestamp: new Date().toLocaleString("es-AR"),
      Name: name,
      Email: email,
      Objective: objective,
      ID: id,
      JSON_Link: jsonUpload.url,
      CSV_Link: csvUpload.url,
      ZIP_Link: zipUpload.url,
    });

    // === 4️⃣ ENVIAR CORREO CON RESEND ===
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "GIA <onboarding@resend.dev>",
      to: email,
      subject: "🚀 Tu campaña GIA fue generada",
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px;background:#0a0f2a;color:#fff">
          <h2>✨ Hola ${name}, tu campaña GIA está lista</h2>
          <p>Podés descargar tus archivos generados automáticamente:</p>
          <ul>
            <li><a href="${jsonUpload.url}" style="color:#00ffff">📄 JSON</a></li>
            <li><a href="${csvUpload.url}" style="color:#00ffff">📊 CSV</a></li>
            <li><a href="${zipUpload.url}" style="color:#00ffff">🗂️ ZIP completo</a></li>
          </ul>
          <p>Gracias por usar <b>GIA — Growth Intelligence Agency</b>.</p>
        </div>
      `,
    });

    // === 5️⃣ RESPUESTA ===
    return res.status(200).json({
      ok: true,
      id,
      links: {
        json: jsonUpload.url,
        csv: csvUpload.url,
        zip: zipUpload.url,
      },
    });
  } catch (err) {
    console.error("❌ Error en auto_execute:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
