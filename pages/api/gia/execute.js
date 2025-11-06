// pages/api/gia/execute.js
import { z } from "zod";
import OpenAI from "openai";
import JSZip from "jszip";
import { Resend } from "resend";
import { put } from "@vercel/blob";

export const config = { api: { bodyParser: true } };

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  objective: z.string().min(10)
});

const MODELS = {
  STRATEGY: "gpt-4o-mini",
  WRITER:   "gpt-4o-mini",
  DESIGN:   "gpt-4o-mini",
  ANALYST:  "gpt-4.1" // profundo
};

function jsonGuard(prompt) {
  return `${prompt}

IMPORTANTE:
- Responde EXCLUSIVAMENTE en JSON válido.
- No agregues texto antes o después.
- No uses triple backticks ni comentarios.`;
}

async function callJSON(openai, model, prompt) {
  const completion = await openai.chat.completions.create({
    model,
    temperature: model === MODELS.WRITER ? 0.9 : 0.3,
    messages: [{ role: "user", content: jsonGuard(prompt) }]
  });
  const raw = completion.choices?.[0]?.message?.content || "{}";
  // limpieza mínima de posibles \n extras
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // intento de rescate: buscar el primer/último brace
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
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
      hashtags
    });
  }
  return out;
}

function toCSV(rows) {
  const header = ["date","channel","type","text","hashtags"];
  const lines = [header.join(",")];
  for (const r of rows) {
    const row = [
      r.date,
      r.channel,
      r.type,
      `"${(r.text || "").replace(/"/g,'""')}"`,
      `"${(Array.isArray(r.hashtags)? r.hashtags.join(" "): (r.hashtags||"")).replace(/"/g,'""')}"`
    ].join(",");
    lines.push(row);
  }
  return lines.join("\n");
}

function htmlReport({ objective, score, posts, prompts, executive }) {
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>GIA — Informe Ejecutivo</title>
<style>
body{font-family:ui-sans-serif,system-ui,Arial;margin:24px}
.card{border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:12px}
h1{margin:0 0 12px 0}
.pill{display:inline-block;padding:4px 12px;border-radius:9999px;background:#eef2ff}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
ul{margin:6px 0 0 18px}
</style></head>
<body>
  <h1>GIA — Informe Ejecutivo</h1>
  <p class="pill">Score estimado: <strong>${score ?? "N/D"}</strong></p>
  <div class="card"><h2>Objetivo</h2><p>${objective}</p></div>
  <div class="card"><h2>Resumen</h2><p>${executive || "Informe no disponible."}</p></div>
  <div class="grid">
    <div class="card"><h3>Copys (5)</h3><ul>
      ${(posts || []).slice(0,5).map(c=>`<li>${(c.text||"").replace(/</g,"&lt;")}</li>`).join("")}
    </ul></div>
    <div class="card"><h3>Prompts visuales (5)</h3><ul>
      ${(prompts || []).slice(0,5).map(p=>`<li>${String(p).replace(/</g,"&lt;")}</li>`).join("")}
    </ul></div>
  </div>
</body></html>`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok:false, error:"Method not allowed" });
  }

  // 1) Validación
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok:false, error: parsed.error.flatten() });
  }
  const { name, email, objective } = parsed.data;

  // 2) Clients
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const resend = new Resend(process.env.RESEND_API_KEY);

  const ts = new Date().toISOString();
  const id = Math.random().toString(36).slice(2,10);

  try {
    // 3) Estratégia
    const strategy = await callJSON(openai, MODELS.STRATEGY,
      `Con el objetivo de campaña: "${objective}", devolvé JSON con:
       {
         "audience": "...",
         "tone": "...",
         "channels": ["Instagram","TikTok"],
         "goals": ["..."],
         "kpis": ["..."],
         "budget": "USD ...",
         "30_day_plan": ["día 1: ...", "día 2: ..."]
       }`
    );

    // 4) Copys
    const copy = await callJSON(openai, MODELS.WRITER,
      `Basado en la estrategia siguiente:
       ${JSON.stringify(strategy)}
       Generá JSON:
       { "posts": [ { "text": "<280 chars", "hashtags": ["#...","#..."] } x5 ] }`
    );

    // 5) Prompts visuales
    const visuals = await callJSON(openai, MODELS.DESIGN,
      `Con estos copys:
       ${JSON.stringify(copy)}
       Generá JSON:
       { "prompts": [ "estilo, colores, encuadre, elementos", ... (x5) ] }`
    );

    // 6) Análisis
    const analysis = await callJSON(openai, MODELS.ANALYST,
      `Analizá estrategia, copys y prompts:
       estrategia=${JSON.stringify(strategy)}
       copys=${JSON.stringify(copy)}
       prompts=${JSON.stringify(visuals)}
       Devolvé JSON:
       { "analysis": {
           "score": 0-100,
           "insights": ["...", "...", "..."],
           "recommendations": ["...", "...", "..."],
           "executive_summary": "5-8 líneas"
         }
       }`
    );

    // 7) Calendario (si no vino del modelo scheduler)
    const posts = copy?.posts || [];
    const calendar = buildCalendar(posts);

    // 8) Master JSON
    const master = {
      id, timestamp: ts, client: { name, email },
      objective,
      strategy,
      posts,
      prompts: visuals?.prompts || [],
      analysis: analysis?.analysis || {},
      calendar
    };
    const masterStr = JSON.stringify(master, null, 2);

    // 9) Archivos
    const csv = toCSV(calendar);
    const html = htmlReport({
      objective,
      score: master.analysis?.score,
      posts,
      prompts: master.prompts,
      executive: master.analysis?.executive_summary
    });

    // 10) ZIP
    const zip = new JSZip();
    zip.file(`campaign_${id}.json`, masterStr);
    zip.file(`calendar_${id}.csv`, csv);
    zip.file(`informe_${id}.html`, html);
    const zipContent = await zip.generateAsync({ type: "nodebuffer" });

    // 11) Uploads (Vercel Blob)
    const uploads = await Promise.all([
      put(`gia/campaign_${id}.json`, new Blob([masterStr], { type:"application/json" }), {
        access: "public", token: process.env.BLOB_READ_WRITE_TOKEN
      }),
      put(`gia/calendar_${id}.csv`, new Blob([csv], { type:"text/csv" }), {
        access: "public", token: process.env.BLOB_READ_WRITE_TOKEN
      }),
      put(`gia/informe_${id}.html`, new Blob([html], { type:"text/html" }), {
        access: "public", token: process.env.BLOB_READ_WRITE_TOKEN
      }),
      put(`gia/GIA_entregables_${id}.zip`, new Blob([zipContent], { type:"application/zip" }), {
        access: "public", token: process.env.BLOB_READ_WRITE_TOKEN
      })
    ]);

    const [jsonFile, csvFile, htmlFile, zipFile] = uploads;

    // 12) Email al cliente
    await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: `GIA — Tu campaña está lista (#${id})`,
      html: `
        <p>Hola ${name},</p>
        <p>Tu campaña está lista. Descargá los entregables aquí:</p>
        <ul>
          <li><a href="${jsonFile.url}">JSON maestro</a></li>
          <li><a href="${csvFile.url}">Calendario (CSV)</a></li>
          <li><a href="${htmlFile.url}">Informe ejecutivo (HTML)</a></li>
          <li><a href="${zipFile.url}">Paquete completo (ZIP)</a></li>
        </ul>
        <p>¡Gracias por elegir GIA!</p>
      `
    });

    // 13) Respuesta a tu frontend
    return res.status(200).json({
      ok: true,
      id,
      links: {
        json: jsonFile.url,
        csv: csvFile.url,
        html: htmlFile.url,
        zip: zipFile.url
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok:false, error: String(err?.message || err) });
  }
}

