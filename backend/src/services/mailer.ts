import nodemailer from "nodemailer";

export const createTransporter = () => {
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;

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
    from: `Plataforma Evaluaciones <${process.env.MAIL_USER}>`,
    to,
    subject: "Tu código de verificación",
    text: `Tu código de verificación es: ${code}`,
  });
};
