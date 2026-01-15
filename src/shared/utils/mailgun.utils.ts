import formData from "form-data";
import Mailgun from "mailgun.js";

const mailgun = new Mailgun(formData);

const mg = mailgun.client({
  username: "api",
  key: process.env["MAILGUN_API_KEY"],
});

/**
 * Sends an email using the provided parameters.
 *
 * @async
 * @param {string} to - The recipient's email address.
 * @param {string} subject - The subject of the email.
 * @param {string} text - The plain text content of the email.
 * @param {string} html - The HTML content of the email.
 * @param {string} replyTo - The email address to set as the "Reply-To" address.
 * @returns {Promise} A Promise that resolves when the email is sent.
 */
export const sendEmail = async (to, subject, text, html, replyTo) => {
  const data = {
    from: process.env["NEXT_PUBLIC_MAILGUN_FROM_ADMIN"],
    to: [to],
    subject,
    text,
    html,
    ...(replyTo && { "h:Reply-To": replyTo }),
  };

  await mg.messages.create(
    (process.env["NEXT_PUBLIC_MAILGUN_SUBDOMAIN"]
      ? `${process.env["NEXT_PUBLIC_MAILGUN_SUBDOMAIN"]}.`
      : "") + process.env["NEXT_PUBLIC_DOMAIN_NAME"],
    data
  );
};
