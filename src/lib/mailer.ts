import nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer";
import { Resend } from "resend";

type ReservationEmail = { subject: string; html: string; text: string };
type GmailResult = { accepted: unknown[]; rejected: unknown[]; messageId: string };
type GmailTransport = { sendMail: (options: Mail.Options) => Promise<GmailResult> };

export function emailProvider() {
  const provider = process.env.EMAIL_PROVIDER || "gmail";
  if (provider !== "gmail" && provider !== "resend") throw new Error("Unsupported email provider");
  return provider;
}

export function missingEmailConfiguration() {
  if (emailProvider() === "gmail") {
    return process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "")
      ? null
      : "Aayush needs to connect the Gmail app password. Nothing has been sent.";
  }
  return process.env.RESEND_API_KEY ? null : "Aayush needs to add the Resend API key. Nothing has been sent.";
}

function gmailTransport() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "") },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
    disableFileAccess: true,
    disableUrlAccess: true,
  });
}

function acceptedAddress(address: unknown): string {
  if (typeof address === "string") return address.toLowerCase();
  if (address && typeof address === "object" && "address" in address && typeof address.address === "string") return address.address.toLowerCase();
  return "";
}

export async function sendGmailReservation(email: ReservationEmail, recipients: string[], digest: string, transport?: GmailTransport) {
  const user = process.env.GMAIL_USER || "aayushtripathi2102@gmail.com";
  // One SMTP transaction includes both recipients, not two independent send attempts.
  const result = await (transport || gmailTransport()).sendMail({
    from: { name: "The Delay Date", address: user },
    to: recipients,
    replyTo: process.env.AYUSH_EMAIL || user,
    messageId: `<delay-date-${digest}@${user.split("@")[1]}>`,
    ...email,
  });
  const accepted = new Set(result.accepted.map(acceptedAddress));
  if (result.rejected.length || !recipients.every(recipient => accepted.has(recipient.toLowerCase())) || !result.messageId) {
    throw new Error("The SMTP server did not accept every recipient");
  }
  return result.messageId;
}

export async function sendReservationEmail(email: ReservationEmail, recipients: string[], digest: string) {
  if (emailProvider() === "gmail") return sendGmailReservation(email, recipients, digest);
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.batch.send(recipients.map(to => ({
    from: process.env.EMAIL_FROM || "The Delay Date <onboarding@resend.dev>",
    to: [to], replyTo: process.env.AYUSH_EMAIL || "aayushtripathi2102@gmail.com", ...email,
  })), { idempotencyKey: `delay-date/${digest}` });
  if (error || !data || data.data?.length !== recipients.length || !data.data.every(email => !!email.id)) throw new Error("Email provider rejected the reservation");
  return data.data.map(email => email.id).join(",");
}

export async function verifyGmailConnection() {
  await gmailTransport().verify();
}
