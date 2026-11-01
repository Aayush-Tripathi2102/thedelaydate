import { createHash } from "node:crypto";
import { getPlan, validateAnswers } from "@/lib/date";
import { buildEmail, recipientsFor } from "@/lib/email";
import { emailProvider, missingEmailConfiguration, sendReservationEmail } from "@/lib/mailer";

export const runtime = "nodejs";
const attempts = new Map<string, { count: number; expires: number }>();

export async function POST(request: Request) {
  // Browsers must send from this site; do not expose a cross-origin mail relay.
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  let sameOrigin = false;
  try { sameOrigin = !!origin && new URL(origin).host === host; } catch { /* Invalid origins fail closed. */ }
  if (!sameOrigin) return Response.json({ error: "Please book from the invitation website." }, { status: 403 });
  if (!request.headers.get("content-type")?.includes("application/json")) return Response.json({ error: "Please submit the booking form." }, { status: 415 });
  if (Number(request.headers.get("content-length") || 0) > 8192) return Response.json({ error: "That’s a very long wish list. Please keep it under 1,500 characters." }, { status: 413 });

  // Best-effort instance-local abuse limit, not a distributed production limiter.
  const now = Date.now();
  for (const [key, value] of attempts) if (value.expires < now) attempts.delete(key);
  if (attempts.size > 5000) return Response.json({ error: "The booking desk is busy. Try again in a minute." }, { status: 429 });
  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const rateKey = createHash("sha256").update(address).digest("hex");
  const attempt = attempts.get(rateKey) || { count: 0, expires: now + 60_000 };
  if (attempt.count >= 5) return Response.json({ error: "Five attempts in a minute? Even Ayush needs a breather. Try again in a minute." }, { status: 429, headers: { "Retry-After": "60" } });
  attempt.count++;
  attempts.set(rateKey, attempt);

  let raw: unknown;
  try {
    const body = await request.text();
    if (body.length > 8192) return Response.json({ error: "Please shorten your booking notes." }, { status: 413 });
    raw = JSON.parse(body);
  } catch { return Response.json({ error: "The form got scrambled. Please try submitting again." }, { status: 400 }); }
  const answers = validateAnswers(raw);
  if (!answers) return Response.json({ error: "Add your expectations and select a cuisine and excitement level before booking." }, { status: 400 });
  try {
    const missing = missingEmailConfiguration();
    if (missing) return Response.json({ error: `The booking desk is built; its email engine isn’t connected yet. ${missing}` }, { status: 503 });
    const { mode, recipients } = recipientsFor({ mode: process.env.EMAIL_MODE, approved: process.env.LIVE_SEND_APPROVED, ayush: process.env.AYUSH_EMAIL, shreya: process.env.SHREYA_EMAIL });
    const plan = getPlan();
    const digest = createHash("sha256").update(JSON.stringify({ answers, plan, recipients, mode, provider: emailProvider() })).digest("hex");
    const reference = `LATE-${digest.slice(0, 8).toUpperCase()}`;
    const email = buildEmail(answers, plan, reference, mode === "test");
    await sendReservationEmail(email, recipients, digest);
    return Response.json({ reference, mode, accepted: true });
  } catch {
    console.error("Booking email configuration or transport failure");
    return Response.json({ error: "The booking desk couldn’t confirm every email. Your answers are still here. Check your inbox before retrying; some copies may already be on their way. Or call Ayush." }, { status: 502 });
  }
}
