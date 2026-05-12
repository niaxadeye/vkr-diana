import { Resend } from "resend";

type MailMode = "resend" | "console";

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

function getMailMode(): MailMode {
  const mode = process.env.MAIL_MODE;

  if (mode === "console" || mode === "resend") {
    return mode;
  }

  return "resend";
}

function stripHtml(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/h1>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

let resend: Resend | null = null;

function getResendClient() {
  if (!resend) {
    const resendApiKey = getRequiredEnv("RESEND_API_KEY");
    resend = new Resend(resendApiKey);
  }

  return resend;
}

export async function sendMail({ to, subject, html }: SendMailInput) {
  const mode = getMailMode();
  const mailFrom = process.env.MAIL_FROM ?? "Acrylogo <dev@localhost>";

  if (mode === "console") {
    console.log("\n================ MAIL CONSOLE MODE ================");
    console.log(`To: ${to}`);
    console.log(`From: ${mailFrom}`);
    console.log(`Subject: ${subject}`);
    console.log("---------------------------------------------------");
    console.log(stripHtml(html));
    console.log("===================================================\n");

    return {
      id: `console-${Date.now()}`,
      mode: "console",
    };
  }

  const from = getRequiredEnv("MAIL_FROM");

  try {
    const result = await getResendClient().emails.send({
      from,
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