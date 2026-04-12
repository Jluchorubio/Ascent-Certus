import nodemailer from "nodemailer";

export const createTransporter = () => {
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS?.replace(/\s+/g, "");

  if (!user || !pass) {
    throw new Error("MAIL_USER/MAIL_PASS no configurados");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
};

export const send2FACode = async (to: string, code: string) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `Ascent Certus <${process.env.MAIL_USER}>`,
    to,
    subject: "Codigo de verificacion Ascent Certus",
    text: `Tu codigo de verificacion es: ${code}. Este codigo vence en 5 minutos.`,
    html: `
      <div style="font-family: 'Sora', Arial, sans-serif; background:#f8fafc; padding:24px;">
        <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:24px; padding:32px; border:1px solid #e2e8f0;">
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:24px;">
            <div style="width:40px; height:40px; border-radius:12px; background:#00A8E8; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold;">
              AC
            </div>
            <div style="font-size:20px; font-weight:700; color:#0f172a;">
              Ascent Certus
            </div>
          </div>
          <h2 style="margin:0 0 8px; font-size:22px; color:#0f172a;">Tu codigo de verificacion</h2>
          <p style="margin:0 0 20px; color:#475569; font-size:15px;">
            Usa el siguiente codigo para completar tu inicio de sesion. Este codigo vence en
            <strong>5 minutos</strong>.
          </p>
          <div style="background:#0f172a; color:#ffffff; padding:16px 20px; border-radius:16px; font-size:28px; letter-spacing:6px; text-align:center; font-weight:700;">
            ${code}
          </div>
          <p style="margin:20px 0 0; color:#94a3b8; font-size:13px;">
            Si no solicitaste este codigo, puedes ignorar este mensaje.
          </p>
        </div>
      </div>
    `,
  });
};
