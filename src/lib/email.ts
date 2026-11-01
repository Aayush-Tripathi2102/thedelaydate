import { type BookingAnswers, type DatePlan, formatDay, formatTime } from "./date";

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export function recipientsFor(env: { mode?: string; approved?: string; ayush?: string; shreya?: string }) {
  const ayush = env.ayush || "aayushtripathi2102@gmail.com";
  if (env.mode !== "live") return { mode: "test" as const, recipients: [ayush] };
  if (env.approved !== "true") throw new Error("Live sending needs explicit approval.");
  if (!env.shreya) throw new Error("Shreya’s email is not configured.");
  return { mode: "live" as const, recipients: [...new Set([ayush, env.shreya])] };
}

export function buildEmail(answers: BookingAnswers, plan: DatePlan, reference: string, test: boolean) {
  const day = formatDay(plan.day);
  const time = formatTime(plan.time);
  const rows = [
    ["Guest of honour", "Shreya Mahajan, aka Tannu"],
    ["Your booked human", "Ayush Tripathi / Sleeping Beauty"],
    ["Date", day], ["Pickup", `${time} · ${plan.pickup} (${plan.timezone})`],
    ["Cuisine", answers.cuisine], ["Excitement level", answers.excitement],
    ["Expectations", answers.expectations], ["Food notes", answers.dietary || "None specified. Chef Ayush has been spared."],
  ];
  const subject = `${test ? "[TEST — Ayush only] " : ""}The Delay Date is booked. Sleeping Beauty, set an alarm. | ${day}`;
  const text = `${test ? "TEST EMAIL — only sent to Ayush.\n\n" : ""}THE DELAY DATE\nGood things take time. This one took a year.\n\nHey Tannu,\nYour reservation request for one (1) Ayush Tripathi has been filed. The year-long loading screen is finally over.\n\n${rows.map(([key, value]) => `${key}: ${value}`).join("\n\n")}\n\nReference: ${reference}\nBe at your hostel gate at ${time}. The remaining itinerary is classified. This email is a reservation, not a guarantee of punctuality.\n\nComplaints: reply to this email (ambitious), or call +91 95920 42161.\n\nFine print: naps are not an approved reason for cancellation. No screenshots of this reservation may be used in future arguments. Actually, they probably will be.\n\n— Ayush, your slightly overdue date\n`;
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>The Delay Date</title></head>
<body style="margin:0;padding:0;background-color:#e8e1f3;color:#22211f;font-family:Arial,Helvetica,sans-serif;">
<div style="display:none;font-size:1px;color:#e8e1f3;max-height:0;overflow:hidden;mso-hide:all;">A whole year later, your date is finally on the calendar. ${escapeHtml(day)}, ${escapeHtml(time)}.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#e8e1f3;"><tr><td align="center" style="padding:32px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:#fff9ef;">
${test ? '<tr><td style="padding:14px 24px;background-color:#22211f;color:#ffffff;font-size:12px;font-weight:bold;">TEST RESERVATION · SENT TO AYUSH ONLY · NOT SENT TO TANNU</td></tr>' : ""}
<tr><td style="padding:34px 28px 28px;background-color:#ff7b49;"><p style="margin:0 0 24px;font-size:13px;font-weight:bold;letter-spacing:2px;">THE DELAY DATE / ADMIT TWO</p><h1 style="margin:0;font-size:46px;line-height:1.05;letter-spacing:-2px;">Good things<br>take time.</h1><p style="margin:18px 0 0;font-size:16px;line-height:1.6;">This one took a year. Let’s not discuss it.</p></td></tr>
<tr><td style="padding:28px;"><h2 style="margin:0 0 12px;font-size:24px;">Hey Tannu, you’re on the list.</h2><p style="margin:0 0 24px;line-height:1.7;font-size:15px;">One (1) Ayush Tripathi has been requested for date duty. The year-long loading screen is finally over. Sleeping Beauty has been instructed to set several alarms.</p>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-size:14px;">${rows.map(([label, value]) => `<tr><th align="left" valign="top" style="width:34%;padding:14px 8px 14px 0;border-bottom:1px solid #d8cfd0;font-weight:normal;color:#5d534f;">${escapeHtml(label)}</th><td valign="top" style="padding:14px 0;border-bottom:1px solid #d8cfd0;font-weight:bold;line-height:1.6;overflow-wrap:anywhere;">${escapeHtml(value).replace(/\n/g, "<br>")}</td></tr>`).join("")}</table>
<p style="margin:24px 0;padding:18px;background-color:#e9e0f7;font-size:15px;line-height:1.6;"><strong>The only spoiler:</strong> be at your hostel gate at ${escapeHtml(time)}. The remaining itinerary is classified. Punctuality is a feature we’re still testing.</p>
<p style="font-size:15px;line-height:1.7;">Questions? Reply to this email (ambitious) or <a href="tel:+919592042161" style="color:#22211f;font-weight:bold;">call Sleeping Beauty</a>. If unanswered, assume nap mode.</p>
<p style="margin:28px 0 0;font-size:15px;line-height:1.6;">See you at the gate, buddhu baksa.<br><strong>— Ayush, your slightly overdue date</strong></p></td></tr>
<tr><td style="padding:22px 28px;border-top:2px dashed #9e8c96;font-size:11px;line-height:1.8;color:#5d534f;">REFERENCE ${escapeHtml(reference)}<br>Fine print: naps are not an approved reason for cancellation. This email may, unfortunately, be used as evidence in future arguments. Booking acknowledges the plan; it does not summon Ayush to the gate.</td></tr>
</table><p style="font-size:11px;color:#504557;line-height:1.6;">A private reservation for Tannu &amp; Ayush. No mailing list. No subscription. Just finally making plans.</p>
</td></tr></table></body></html>`;
  return { subject, html, text };
}
