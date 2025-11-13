// pages/api/auth/token.js
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Missing email" });

  try {
    // Firmamos el token con expiración de 24 horas
    const token = jwt.sign(
      { email },
      process.env.JWT_SECRET, // asegurate de agregar esta variable en Vercel
      { expiresIn: "24h" }
    );

    return res.status(200).json({ token });
  } catch (err) {
    console.error("Token generation error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
