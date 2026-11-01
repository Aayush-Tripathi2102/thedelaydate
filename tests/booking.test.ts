import { test } from "node:test";
import assert from "node:assert/strict";
import { buildEmail, escapeHtml, recipientsFor } from "../src/lib/email";
import { formatDay, formatTime, validateAnswers } from "../src/lib/date";
import { POST } from "../src/app/api/book/route";
import { sendGmailReservation } from "../src/lib/mailer";

const answers = { expectations: "Good food & no naps <please>", cuisine: "Italian", excitement: "Yessssss", dietary: "Vegetarian" };
const plan = { day: "2026-11-01", time: "17:00", timezone: "Asia/Kolkata", pickup: "Your hostel gate" };

test("accepts the exact questionnaire choices and trims free text", () => {
  assert.deepEqual(validateAnswers({ ...answers, expectations: "  Please be on time  " }), { ...answers, expectations: "Please be on time" });
});
test("rejects missing, whitespace-only, huge and forged answers", () => {
  for (const value of [null, {}, { ...answers, expectations: " " }, { ...answers, expectations: "x".repeat(1501) }, { ...answers, cuisine: "Forged" }, { ...answers, excitement: "Forged" }, { ...answers, dietary: "x".repeat(301) }]) assert.equal(validateAnswers(value), null);
});
test("safe default never sends to Shreya", () => {
  for (const mode of [undefined, "test", "production", "LIVE"]) assert.deepEqual(recipientsFor({ mode, ayush: "me@example.com", shreya: "her@example.com", approved: "true" }), { mode: "test", recipients: ["me@example.com"] });
});
test("live mode needs a separate explicit approval", () => {
  assert.throws(() => recipientsFor({ mode: "live", ayush: "me@example.com", shreya: "her@example.com" }), /approval/);
  assert.throws(() => recipientsFor({ mode: "live", approved: "false", shreya: "her@example.com" }), /approval/);
  assert.throws(() => recipientsFor({ mode: "live", approved: "true" }), /not configured/);
});
test("approved live mode sends separately to exactly the two configured recipients", () => {
  assert.deepEqual(recipientsFor({ mode: "live", approved: "true", ayush: "me@example.com", shreya: "her@example.com" }).recipients, ["me@example.com", "her@example.com"]);
});
test("escapes all untrusted HTML characters", () => {
  assert.equal(escapeHtml(`<script a="x" b='y'>&`), "&lt;script a=&quot;x&quot; b=&#39;y&#39;&gt;&amp;");
});
test("email includes all selections, date, pickup, reference, inline tables, and text alternative", () => {
  const email = buildEmail(answers, plan, "LATE-TEST", true);
  assert.ok(email.subject.startsWith("[TEST — Ayush only]"));
  for (const text of ["1 November 2026", "5 PM", "Your hostel gate", "Italian", "Yessssss", "Vegetarian", "LATE-TEST"]) { assert.ok(email.html.includes(text)); assert.ok(email.text.includes(text)); }
  assert.ok(email.html.includes("Good food &amp; no naps &lt;please&gt;"));
  assert.ok(email.html.includes('role="presentation"'));
  assert.ok(!email.html.includes("<script"));
  assert.ok(!email.html.includes("display:grid"));
});
test("live email doesn't contain test banner", () => {
  const email = buildEmail(answers, plan, "LATE-LIVE", false);
  assert.ok(!email.subject.includes("[TEST"));
  assert.ok(!email.html.includes("TEST RESERVATION"));
});
test("email safely preserves line breaks and malicious-looking input", () => {
  const email = buildEmail({ ...answers, expectations: '<img src=x onerror="alert(1)">\nSecond line' }, plan, "REF", true);
  assert.ok(email.html.includes("&lt;img"));
  assert.ok(email.html.includes("<br>Second line"));
  assert.ok(!email.html.includes("<img src=x"));
});
test("fixed date and 5 PM format correctly", () => {
  assert.equal(formatDay(plan.day), "1 November 2026");
  assert.equal(formatTime("17:00"), "5 PM");
  assert.equal(formatTime("00:30"), "12:30 AM");
  assert.equal(formatTime("12:00"), "12 PM");
});

function request(body: unknown, origin = "http://localhost:3000") {
  return new Request("http://localhost:3000/api/book", { method: "POST", headers: { origin, host: "localhost:3000", "content-type": "application/json", "x-forwarded-for": String(Math.random()) }, body: JSON.stringify(body) });
}
test("API blocks cross-origin submissions", async () => {
  assert.equal((await POST(request(answers, "https://evil.example"))).status, 403);
  assert.equal((await POST(request(answers, "not-a-url"))).status, 403);
});

async function withMockProvider(mode: string, approved: string, responseStatus: number, run: (calls: { body: any; key: string | null }[]) => Promise<void>) {
  const names = ["EMAIL_PROVIDER", "RESEND_API_KEY", "EMAIL_MODE", "LIVE_SEND_APPROVED", "AYUSH_EMAIL", "SHREYA_EMAIL"] as const;
  const original = Object.fromEntries(names.map(name => [name, process.env[name]]));
  const originalFetch = globalThis.fetch;
  const calls: { body: any; key: string | null }[] = [];
  Object.assign(process.env, { EMAIL_PROVIDER: "resend", RESEND_API_KEY: "re_mock_never_delivered", EMAIL_MODE: mode, LIVE_SEND_APPROVED: approved, AYUSH_EMAIL: "ayush@example.com", SHREYA_EMAIL: "tannu@example.com" });
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    assert.equal(String(url), "https://api.resend.com/emails/batch", "Unexpected network call is blocked");
    const body = JSON.parse(String(init?.body));
    calls.push({ body, key: new Headers(init?.headers).get("idempotency-key") });
    return new Response(JSON.stringify(responseStatus === 200 ? { data: body.map((_: unknown, i: number) => ({ id: `mock-${i}` })) } : { name: "validation_error", message: "Mock provider rejection" }), { status: responseStatus, headers: { "Content-Type": "application/json" } });
  }) as typeof fetch;
  try { await run(calls); } finally {
    globalThis.fetch = originalFetch;
    for (const name of names) { if (original[name] === undefined) delete process.env[name]; else process.env[name] = original[name]; }
  }
}

test("API test send targets only Ayush, and repeat identical submissions reuse idempotency key", async () => {
  await withMockProvider("test", "false", 200, async calls => {
    const first = await POST(request(answers));
    assert.equal(first.status, 200);
    const receipt = await first.json();
    assert.equal(receipt.mode, "test");
    assert.equal(receipt.accepted, true);
    assert.deepEqual(calls[0].body.map((mail: any) => mail.to), [["ayush@example.com"]]);
    await POST(request(answers));
    assert.ok(calls[0].key?.startsWith("delay-date/"));
    assert.equal(calls[0].key, calls[1].key);
  });
});
test("approved live API sends two individual emails", async () => {
  await withMockProvider("live", "true", 200, async calls => {
    const response = await POST(request(answers));
    assert.equal(response.status, 200);
    assert.equal((await response.json()).mode, "live");
    assert.deepEqual(calls[0].body.map((mail: any) => mail.to), [["ayush@example.com"], ["tannu@example.com"]]);
  });
});
test("unapproved live API never reaches the provider", async () => {
  await withMockProvider("live", "false", 200, async calls => {
    assert.equal((await POST(request(answers))).status, 502);
    assert.equal(calls.length, 0);
  });
});
test("provider rejection never produces a success receipt", async () => {
  await withMockProvider("test", "false", 422, async () => {
    const response = await POST(request(answers));
    assert.equal(response.status, 502);
    assert.equal((await response.json()).accepted, undefined);
  });
});
test("API rejects malformed selections", async () => {
  assert.equal((await POST(request({ ...answers, cuisine: "anything" }))).status, 400);
});
test("API reports missing credentials honestly; never fake-confirms", async () => {
  const key = process.env.RESEND_API_KEY;
  const provider = process.env.EMAIL_PROVIDER;
  process.env.EMAIL_PROVIDER = "resend";
  delete process.env.RESEND_API_KEY;
  try {
    const response = await POST(request(answers));
    assert.equal(response.status, 503);
    const body = await response.json();
    assert.ok(body.error.includes("Nothing has been sent"));
    assert.equal(body.accepted, undefined);
  } finally {
    if (key) process.env.RESEND_API_KEY = key;
    if (provider === undefined) delete process.env.EMAIL_PROVIDER; else process.env.EMAIL_PROVIDER = provider;
  }
});

test("Gmail sends the live reservation to both configured recipients in one SMTP transaction", async () => {
  let calls = 0;
  const recipients = ["ayush@example.com", "tannu@example.com"];
  const email = buildEmail(answers, plan, "LATE-GMAIL", false);
  const result = await sendGmailReservation(email, recipients, "mock-digest", {
    async sendMail(options) {
      calls++;
      assert.deepEqual(options.to, recipients);
      assert.equal(options.html, email.html);
      assert.equal(options.text, email.text);
      assert.ok(!options.subject?.includes("[TEST"));
      assert.ok(options.messageId?.includes("mock-digest"));
      return { messageId: "mock-gmail-id", accepted: recipients, rejected: [] };
    },
  });
  assert.equal(calls, 1);
  assert.equal(result, "mock-gmail-id");
});

test("Gmail rejects partial acceptance rather than claiming both emails were sent", async () => {
  await assert.rejects(() => sendGmailReservation(buildEmail(answers, plan, "REF", false), ["ayush@example.com", "tannu@example.com"], "mock", {
    async sendMail() { return { messageId: "mock", accepted: ["ayush@example.com"], rejected: ["tannu@example.com"] }; },
  }), /every recipient/);
});

test("Gmail setup test transport only receives the single specified test inbox", async () => {
  await sendGmailReservation(buildEmail(answers, plan, "REF", true), ["ayush@example.com"], "mock", {
    async sendMail(options) {
      assert.deepEqual(options.to, ["ayush@example.com"]);
      assert.ok(options.subject?.startsWith("[TEST"));
      return { messageId: "mock", accepted: ["ayush@example.com"], rejected: [] };
    },
  });
});
