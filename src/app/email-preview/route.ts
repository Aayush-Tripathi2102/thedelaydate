import { buildEmail } from "@/lib/email";
import { getPlan } from "@/lib/date";

export function GET() {
  const email = buildEmail({ expectations: "Good food, no naps, and please be on time for once.", cuisine: "Italian", excitement: "Yessssss", dietary: "Sample booking — your actual answers appear in the real email." }, getPlan(), "LATE-PREVIEW", true);
  return new Response(email.html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } });
}
