// pages/api/dashboard/data.js
import jwt from "jsonwebtoken";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Missing token" });

  try {
    // 🔒 Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userEmail = decoded.email;

    // 📄 Conexión a Google Sheets
    const auth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, auth);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    // 🧠 Filtrar campañas del usuario
    const userCampaigns = rows
      .filter((r) => r.Email?.trim().toLowerCase() === userEmail.toLowerCase())
      .map((r) => ({
        objetivo: r.Objetivo || "—",
        fecha: r.Fecha || "—",
        zip: r.ZipLink || "",
        csv: r.CsvLink || "",
        json: r.JsonLink || "",
      }));

    return res.status(200).json({ ok: true, campaigns: userCampaigns });
  } catch (err) {
    console.error("Dashboard error:", err);
    return res.status(401).json({ ok: false, error: "Invalid or expired token" });
  }
}
