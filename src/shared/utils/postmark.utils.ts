import { ServerClient } from "postmark";

const POSTMARK_TOKEN = process.env.POSTMARK_SERVER_API_TOKEN;
const FROM_EMAIL = process.env.POSTMARK_FROM_EMAIL;

let client: ServerClient | null = null;

if (!POSTMARK_TOKEN) {
  console.warn(
    "Warning: POSTMARK_SERVER_API_TOKEN is not set. Emails will not be sent."
  );
} else {
  client = new ServerClient(POSTMARK_TOKEN);
}

/**
 * Send transactional email using Postmark.
 * @param to - Recipient's email address
 * @param subject - Email subject
 * @param htmlBody - HTML content of the email
 * @param textBody - Plain text content of the email
 */
export async function sendEmail(
  to: string,
  subject: string,
  htmlBody: string,
  textBody?: string
) {
  if (!client) {
    console.error("Postmark client not initialized. Cannot send email.");
    return;
  }

  if (!FROM_EMAIL) {
    console.error("POSTMARK_FROM_EMAIL is not set. Cannot send email.");
    return;
  }

  try {
    await client.sendEmail({
      From: FROM_EMAIL,
      To: to,
      Subject: subject,
      HtmlBody: htmlBody,
      TextBody: textBody || "",
    });
  } catch (error) {
    console.error("Failed to send email via Postmark:", error);
    throw error;
  }
}
