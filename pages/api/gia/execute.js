// pages/api/gia/execute.js
import { z } from "zod";
import OpenAI from "openai";
import JSZip from "jszip";
import { put } from "@vercel/blob";
import { Resend } from "resend";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

export const config = { api: { bodyParser: true } };

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.FROM_EMAIL || "GIA <onboarding@resend.dev>";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  objective: z.string().min(10),
});

const MODELS = {
  STRATEGY: "gpt-4o-mini",
  WRITER: "gpt-4o-mini",
  DESIGN: "gpt-4o-mini",
  ANALYST: "gpt-4o-mini",
};

function jsonGuard(prompt) {
  return `${prompt}

INSTRUCCIONES:
- Respondé EXCLUSIVAMENTE en JSON VÁLIDO.
- No agregues texto antes o después del JSON.`;
}

async function callJSON(openai, model, prompt, temperature = 0.3) {
  const out = await openai.chat.completions.create({
    model,
    temperature,
    messages: [{ role: "user", content: jsonGuard(prompt) }],
  });
  const raw = out.choices?.[0]?.message?.content?.trim() || "{}";
  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(raw.slice(start, end + 1));
    throw new Error("No se pudo parsear JSON del modelo.");
  }
}

function buildCalendar(posts, startDate = new Date()) {
  const out = [];
  const n = Math.max(1, posts.length);
  for (let i = 0; i < 30; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const p = posts[i % n] || {};
    const hashtags = Array.isArray(p.hashtags) ? p.hashtags.slice(0, 8) : [];
    out.push({
      date: d.toISOString().slice(0, 10),
      channel: "Instagram",
      type: "Feed / Reel",
      text: (p.text || "").slice(0, 280),
      hashtags,
    });
  }
  return out;
}

function toCSV(rows) {
  const header = ["date", "channel", "type", "text", "hashtags"];
  const esc = (s = "") => `"${String(s).replace(/"/g, '""')}"`;
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push([
      r.date,
      r.channel,
      r.type,
      esc(r.text),
      esc(Array.isArray(r.hashtags) ? r.hashtags.join(" ") : r.hashtags || ""),
    ].join(","));
  }
  return lines.join("\n");
}

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ ok: false, error: "Method not allowed" });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ ok: false, error: parsed.error.flatten() });

  const { name, email, objective } = parsed.data;
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const id = Math.random().toString(36).slice(2, 10);
  const ts = new Date().toISOString();

  try {
    // === 1️⃣ IA GIA CORE ===
    const strategy = await callJSON(openai, MODELS.STRATEGY, `
      Con el objetivo "${objective}", generá JSON:
      { "audience": "...", "tone": "...", "channels": ["Instagram","TikTok"], "goals": ["..."], "kpis": ["..."], "budget": "USD ...", "plan_30_days": ["día 1: ..."] }
    `, 0.7);

    const copy = await callJSON(openai, MODELS.WRITER, `
      Basado en la estrategia ${JSON.stringify(strategy)}, generá JSON:
      { "posts": [ { "text": "<280 chars", "hashtags": ["#...","#..."] } x5 ] }
    `, 0.9);

    const visuals = await callJSON(openai, MODELS.DESIGN, `
      Con estos copys ${JSON.stringify(copy)}, generá JSON:
      { "prompts": [ "estilo, colores, encuadre, elementos" x5 ] }
    `, 0.5);

    const analysis = await callJSON(openai, MODELS.ANALYST, `
      Analizá estrategia, copys y prompts y devolvé JSON:
      { "analysis": { "score": 0-100, "insights": ["..."], "recommendations": ["..."], "executive_summary": "5-8 líneas" } }
    `, 0.3);

    const posts = copy.posts || [];
    const calendar = buildCalendar(posts);
    const csv = toCSV(calendar);
    const master = {
      id, timestamp: ts, client: { name, email }, objective,
      strategy, posts, prompts: visuals.prompts || [],
      analysis: analysis.analysis || {}, calendar
    };
    const masterStr = JSON.stringify(master, null, 2);

    // === 2️⃣ Archivos & Blob ===
    const zip = new JSZip();
    zip.file(`campaign_${id}.json`, masterStr);
    zip.file(`calendar_${id}.csv`, csv);
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    const opts = { access: "public", token: process.env.BLOB_READ_WRITE_TOKEN };
    const [jsonFile, csvFile, zipFile] = await Promise.all([
      put(`gia/campaign_${id}.json`, new Blob([masterStr], { type: "application/json" }), opts),
      put(`gia/calendar_${id}.csv`, new Blob([csv], { type: "text/csv" }), opts),
      put(`gia/GIA_pack_${id}.zip`, new Blob([zipBuffer], { type: "application/zip" }), opts),
    ]);

    // === 3️⃣ Registro en Google Sheets ===
    const creds = new JWT({
      email: process.env.GOOGLE_SERVICE_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, creds);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    await sheet.addRow({
      ID: id,
      Fecha: ts,
      Nombre: name,
      Email: email,
      Objetivo: objective,
      JSON: jsonFile.url,
      CSV: csvFile.url,
      ZIP: zipFile.url,
    });

    // === 4️⃣ Email al cliente ===
    const html = `
      <div style="font-family:system-ui,Arial;max-width:640px;margin:auto">
        <h2 style="color:#0f172a;margin-bottom:8px">¡${name}, tu campaña de GIA está lista!</h2>
        <p>Generamos una campaña completa con estrategia, copys, prompts y calendario.</p>
        <p><strong>Objetivo recibido:</strong> ${objective}</p>
        <ul>
          <li><a href="${jsonFile.url}">JSON maestro</a></li>
          <li><a href="${csvFile.url}">Calendario (CSV)</a></li>
          <li><a href="${zipFile.url}">Paquete completo (ZIP)</a></li>
        </ul>
        <p>Gracias por elegir <strong>GIA — Growth Intelligence Agency</strong>.</p>
      </div>
    `;
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `GIA — Tu campaña está lista (#${id})`,
      html,
    });

    return res.status(200).json({
      ok: true,
      id,
      links: { json: jsonFile.url, csv: csvFile.url, zip: zipFile.url },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
