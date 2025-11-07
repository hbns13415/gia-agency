// pages/api/gia/execute.js

import { Resend } from "resend";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { put } from "@vercel/blob";
import fs from "fs";
import path from "path";

export const config = { api: { bodyParser: true } };

// ENV KEYS requeridas:
// RESEND_API_KEY
// FROM_EMAIL
// GOOGLE_SHEETS_ID
// GOOGLE_CLIENT_EMAIL
// GOOGLE_PRIVATE_KEY
// BLOB_READ_WRITE_TOKEN

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const { name, email, objective } = req.body;

    if (!name || !email || !objective) {
      return res
        .status(400)
        .json({ ok: false, error: "Missing required fields" });
    }

    // ✅ Simulación de generación de contenido (futuro: CrewAI real)
    const campaignData = {
      name,
      email,
      objective,
      generatedAt: new Date().toISOString(),
      summary: `Campaña generada automáticamente para el objetivo: ${objective}`,
    };

    const jsonContent = JSON.stringify(campaignData, null, 2);
    const csvContent = `name,email,objective,generatedAt\n"${name}","${email}","${objective}","${new Date().toISOString()}"`;

    // 🗂 Guardar temporalmente ZIP simulado
    const tmpDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
    const zipPath = path.join(tmpDir, "GIA_pack.zip");
    fs.writeFileSync(zipPath, jsonContent);

    // ✅ Subir a Vercel Blob
    const upload = async (fileName, content, type) =>
      await put(`gia/${fileName}`, content, {
        access: "public",
        contentType: type,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

    const [jsonFile, csvFile, zipFile] = await Promise.all([
      upload(`campaign_${Date.now()}.json`, jsonContent, "application/json"),
      upload(`calendar_${Date.now()}.csv`, csvContent, "text/csv"),
      upload(`GIA_pack_${Date.now()}.zip`, fs.readFileSync(zipPath), "application/zip"),
    ]);

    // ✅ Escribir registro en Google Sheets
    const jwt = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_ID, jwt);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    await sheet.addRow({
      Fecha: new Date().toLocaleString(),
      Nombre: name,
      Email: email,
      Objetivo: objective,
      JSON_Link: jsonFile.url,
      CSV_Link: csvFile.url,
      ZIP_Link: zipFile.url,
    });

    // ✅ Enviar correo con Resend
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: "Tu campaña GIA está lista 🚀",
      html: `
        <h2>¡${name}, tu campaña de GIA está lista!</h2>
        <p>Generamos una campaña completa con estrategia, copys, prompts y calendario.</p>
        <p><strong>Objetivo recibido:</strong> ${objective}</p>
        <ul>
          <li><a href="${jsonFile.url}">JSON maestro</a></li>
          <li><a href="${csvFile.url}">Calendario (CSV)</a></li>
          <li><a href="${zipFile.url}">Paquete completo (ZIP)</a></li>
        </ul>
        <p>Gracias por elegir <strong>GIA — Growth Intelligence Agency</strong>.</p>
      `,
    });

    return res.status(200).json({
      ok: true,
      message: "Campaign generated successfully",
      links: {
        json: jsonFile.url,
        csv: csvFile.url,
        zip: zipFile.url,
      },
    });
  } catch (error) {
    console.error("Error en ejecución GIA:", error);
    return res.status(500).json({
      ok: false,
      error: error.message || "Unexpected error",
    });
  }
}
