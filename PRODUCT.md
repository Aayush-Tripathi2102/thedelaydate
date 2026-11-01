# The Delay Date

<!-- impeccable:product-schema 1 -->

## Platform
web

## Stack
User accepted Next.js and TypeScript. Updated shipping choice: server-side Gmail SMTP via Nodemailer, optional Resend fallback. User requested GitHub push only, not deployment.

## Users
Aayush Tripathi is planning a long-overdue date for Shreya Mahajan, aka Tannu.

## Product Purpose
A funny private invitation that lets Tannu book Aayush, specify expectations, cuisine and excitement, review the plan, and receive an email reservation.

## Operating Context
User specified today: 1 November 2026. Pickup is 5 PM at her hostel gate. Use Asia/Kolkata. Venue and activities remain surprises, not invented bookings.

## Capabilities and Constraints
Three-stage invitation, questionnaire, review, then booking confirmation. Pointer-evading No button. Accessible keyboard/touch alternative. HTML table email plus plain text. Never claim email sent without provider acceptance. Test recipients must only be Aayush; live mode explicitly enabled after testing and deployment. API credentials remain server-side. No credentials provided yet; actual sending and deployment remain pending.

## Brand Commitments
Bold colourful mischief; funny, never lovey-dovey. Year-long delay and sleeping jokes. She saved Aayush as Sleeping Beauty; his nickname for her is buddhu baksa. Light repeated-call joke, no insulting disability language. No couple photos supplied.

## Product Principles
- A ridiculous booking service, a real usable booking flow.
- Keep personal email addresses server-side where possible.
- Preserve answers when moving between steps.
- Do not send to Shreya in test mode or automatically enable live mode on deployment.

## Open Decisions
Owner approved live sending to both recipients and GitHub upload. Resend test succeeded to Aayush. Local live configuration removes test labels; actual sends fail closed until the Gmail app password is added. The dedicated Gmail test remains Aayush-only. Gmail app password and Gmail transport test are pending. Deployment is explicitly out of scope for the current request.
