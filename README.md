# The Delay Date

A private, very overdue booking service for Tannu. Next.js + TypeScript + Gmail SMTP (with optional Resend support). No database, no analytics, no external images, no client-side secrets.

## Run

```bash
bun install
cp .env.example .env.local
bun run dev
```

Open http://localhost:3000. The sample email is at http://localhost:3000/email-preview (preview only; sends nothing).

```bash
bun test
bun run typecheck
bun run build
```

## The plan

The user specified **today**, recorded as **1 November 2026**, **5 PM, Asia/Kolkata**, **her hostel gate**. This is a fixed date, not a moving "today". Change `DATE_DAY` if deploying on another day; restart/redeploy after any configuration change. Venue and activities stay a surprise. Cuisine is a preference, not a restaurant booking.

## Connect Gmail

1. Enable Google **2-Step Verification**, then create an app password at https://myaccount.google.com/apppasswords. If unavailable, check Google account policy or use the optional Resend provider with a verified domain.
2. Set `EMAIL_PROVIDER=gmail`, `GMAIL_USER=aayushtripathi2102@gmail.com`, and `GMAIL_APP_PASSWORD` in `.env.local`. Use the app password, **not your normal Google password**. Credentials stay server-side and out of Git.
3. Run `bun run test:email`. It verifies Gmail authentication and sends one sample to Ayush only, regardless of live-mode settings. Check inbox/spam before enabling live mode. Gmail has no guaranteed retry deduplication.
4. Set the live configuration below and rebuild/restart. `Book My Date` will address both Ayush and Shreya in one SMTP transaction. Test banners disappear automatically from the website, subject, and email in live mode.

For the optional Resend provider, set `EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, and `EMAIL_FROM`. `onboarding@resend.dev` only sends to the Resend account owner; emailing Shreya requires a verified sender domain.

Provider acceptance is not guaranteed inbox delivery. Table layout, inline CSS, system fonts, and a plain-text alternative maximize email-client compatibility; no all-client validation claim is made. Automated tests use mocked transport and send no real mail.

## Deploy to Vercel

Hosting is handled by the owner; this repository does not deploy automatically. On any Next.js-compatible host, add the server-only environment variables below and the date/pickup variables from `.env.example`. Install with `bun install --frozen-lockfile`, build with `bun run build`, and start with `bun run start`. The host must allow outbound Gmail SMTP connections; some hosts block SMTP, and Google may challenge unusual server locations. No hosting credentials are bundled.

### Explicit live-send switch

After checking the Gmail test email, use these variables on your host:

```dotenv
EMAIL_PROVIDER=gmail
GMAIL_USER=aayushtripathi2102@gmail.com
GMAIL_APP_PASSWORD=YOUR_GOOGLE_APP_PASSWORD
EMAIL_MODE=live
LIVE_SEND_APPROVED=true
AYUSH_EMAIL=aayushtripathi2102@gmail.com
SHREYA_EMAIL=shreya.deepak2023@vitstudent.ac.in
```

Rebuild/redeploy after changing configuration. A subsequent booking sends to both addresses, without TEST labels. Deploying alone never enables live sends; live mode without approval fails closed. Recipient addresses are read on the server, not accepted from the browser. The owner has approved live sending and enabled the local live view. Actual Gmail credentials are still required before sending works; use the dedicated Ayush-only test command to check them first.

## Safeguards and limitations

- Server validates text lengths and allowed choices; HTML escapes user input.
- Same-origin checks and a best-effort, **instance-local** 5-attempts/minute throttle. Before broadly sharing publicly, enable Vercel firewall/rate limiting or a distributed limiter. Origin checks alone are not authentication. The invitation is not password-protected.
- Gmail uses stable message IDs, but **SMTP does not guarantee deduplication**. On a timeout or partial-recipient failure, check inboxes before retrying. Optional Resend uses 24-hour idempotency keys. There is no persistent booking database or cancellation system.
- Answers are kept in session storage for that browser tab and clear on successful submission/tab closure. Email is the durable reservation. No guest email input prevents this becoming an arbitrary mail relay.
- Search indexing disabled, but **noindex is not privacy protection**. Do not publish the invitation URL broadly; use hosting access protection if desired. Phone and Ayush’s contact email are intentionally visible. Configured recipient addresses are not accepted from the browser.
- The escaping No is a mouse-pointer joke, stays within the viewport and resets on resize. Keyboard, touch, and pen users can activate No for a genuine decline; reduced-motion users get a stable No button. All form choices are native keyboard-accessible radios.
- Email delivery and deployment require your accounts. Tests use mocks, not live recipient sends.

## Fonts

Self-hosted Bricolage Grotesque and Manrope, from the Google Fonts repository, licensed under OFL; licenses included in `public/fonts/`. The sleeping illustration is original inline SVG; no photographs needed.

## Browser checks in Zen

Uses your installed Zen browser via native WebDriver BiDi, without Chrome or a separate driver. Keep the app running on port 3000. In another terminal:

```bash
mkdir -p /tmp/opencode/zen-delay-date
zen-browser --headless --no-remote --profile /tmp/opencode/zen-delay-date --remote-debugging-port 9222 about:blank
```

Then run `bun run test:browser`. It uses an isolated profile, captures desktop/mobile/email layouts under `.impeccable/review/`, tests the escaping No with real pointer input, and checks errors, answer preservation, and test-only confirmation. **All browser email responses are mocked; this never sends actual mail.** Unit tests additionally cover the real route and mock the email provider transport.
