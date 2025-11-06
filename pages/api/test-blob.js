// pages/api/test-blob.js
import { put } from "@vercel/blob";

export default async function handler(req, res) {
  try {
    const data = "Prueba exitosa de conexión con Vercel Blob 🚀";

    // Guardamos un pequeño archivo de prueba
    const blob = await put("test-blob.txt", data, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN, // 👈 el token blt_v1_xxx
    });

    return res.status(200).json({
      ok: true,
      message: "Conexión con Vercel Blob OK ✅",
      url: blob.url,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      error: error.message || "Error desconocido",
    });
  }
}
