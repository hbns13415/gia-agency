// pages/api/auth/verify.js
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Missing token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({ valid: true, data: decoded });
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(401).json({ valid: false, error: "Invalid or expired token" });
  }
}
