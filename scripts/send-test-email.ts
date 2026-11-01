import { createHash } from "node:crypto";
import { buildEmail } from "../src/lib/email";
import { getPlan } from "../src/lib/date";
import { emailProvider, missingEmailConfiguration, sendReservationEmail, verifyGmailConnection } from "../src/lib/mailer";

// Intentionally hard-coded: this command can NEVER send to Tannu or an input address.
const recipient = "aayushtripathi2102@gmail.com";

async function main() {
  const missing = missingEmailConfiguration();
  if (missing) {
    console.error(`Email not sent. ${missing} Update .env.local, then rerun bun run test:email.`);
    process.exitCode = 1;
    return;
  }
  const plan = getPlan();
  const answers = {
    expectations: "Good food, no naps, and please be on time for once.\nThis is Aayush’s setup test, not Tannu’s actual submission.",
    cuisine: "Italian",
    excitement: "Yessssss",
    dietary: "Sample food notes for checking the email layout.",
  };
  const provider = emailProvider();
  const digest = createHash("sha256").update(JSON.stringify({ plan, answers, recipient, provider })).digest("hex");
  const reference = `TEST-${digest.slice(0, 8).toUpperCase()}`;
  const email = buildEmail(answers, plan, reference, true);
  console.log(`Sending one TEST email to ${recipient}. Tannu is not a recipient.`);
  try {
    if (provider === "gmail") await verifyGmailConnection();
    const id = await sendReservationEmail(email, [recipient], `setup-${digest}`);
    console.log(`Provider accepted the test via ${provider}. Email ID: ${id}. Reference: ${reference}.`);
    console.log("Check your inbox and spam folder. Acceptance is not proof of delivery. Shreya has NOT been emailed by this test; this command has not changed the website’s live-mode settings.");
  } catch {
    console.error("Could not confirm the test email. For Gmail, enable 2-Step Verification and use a Google app password, not your normal password. Check your inbox before retrying; Gmail does not guarantee retry deduplication.");
    process.exitCode = 1;
  }
}

await main();
