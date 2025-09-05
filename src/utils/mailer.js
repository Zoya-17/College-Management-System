import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT || 587);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM || `no-reply@${process.env.SMTP_DOMAIN || 'example.com'}`;

let transporter = null;
if (host && user && pass) {
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
}

export const isConfigured = () => !!transporter;

export const sendMail = async ({ to, subject, html, text }) => {
  if (!transporter) throw new Error('SMTP not configured');
  const info = await transporter.sendMail({ from, to, subject, html, text });
  return info;
};

export default { isConfigured, sendMail };
