import "dotenv/config";

import { sendMail } from "./modules/mail/mail.service.js";

async function main() {
  await sendMail({
    to: "niaxadeye@gmail.com",
    subject: "Тестовое письмо Acrylogo",
    html: "<h1>Resend работает</h1><p>Письмо успешно отправлено.</p>",
  });

  console.log("Test email sent");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});