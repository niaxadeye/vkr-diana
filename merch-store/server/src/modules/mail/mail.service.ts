import { Resend } from "resend";

type SendMailInput = {
  to: string;
  subject: string;
  html: string;
};

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name} environment variable`);
  }

  return value;
}

const resendApiKey = getRequiredEnv("RESEND_API_KEY");
const mailFrom = getRequiredEnv("MAIL_FROM");

const resend = new Resend(resendApiKey);

export async function sendMail({ to, subject, html }: SendMailInput) {
  try {
    const result = await resend.emails.send({
      from: mailFrom,
      to,
      subject,
      html,
    });

    return result;
  } catch (error) {
    console.error("[MAIL_SEND_ERROR]", error);
    throw error;
  }
}