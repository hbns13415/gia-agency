// utils/sendEmail.js
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.FROM_EMAIL || "GIA <onboarding@resend.dev>";

export async function sendGiaEmail({ to, subject, html }) {
  if (!to) throw new Error("Missing 'to' in sendGiaEmail");
  const res = await resend.emails.send({ from: FROM, to, subject, html });
  return res;
}
