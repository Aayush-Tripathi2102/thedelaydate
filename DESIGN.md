---
name: The Delay Date
description: A cheeky admission ticket for one profoundly overdue date.
colors:
  orange: "#ff8655"
  lilac: "#e8e0f2"
  pink: "#f7cad8"
  purple: "#59416d"
  ink: "#29241f"
  paper: "#fbf7ed"
  muted: "#5d5048"
  field-fill: "#fffdf7"
  field-border: "#8a7774"
  placeholder: "#78695f"
  button-hover: "#49372c"
  no-hover: "#ffb08e"
  fine-print: "#4e3a30"
  error-border: "#8b3a3a"
  error-ink: "#6f2525"
  wordmark-period: "#9d3f1c"
  scrollbar: "#846a91"
  illustration-cushion: "#f5f0dc"
  ticket-rule: "#29241f4d"
  ticket-seam: "#7c5667"
  invitation-rule: "#29241f70"
  layout-rule: "#a99bae"
  plan-rule: "#b3a3ba"
  progress-rule: "#c8bdc4"
  progress-muted: "#766b72"
  progress-circle: "#b2a5ad"
  choice-border: "#bcafb1"
  radio-border: "#9a868e"
  reservation-rule: "#b999a5"
  reservation-seam: "#9a7886"
  reservation-detail-rule: "#bd9aa6"
  reservation-muted: "#5d414c"
  spinner-track: "#fbf7ed55"
typography:
  display:
    fontFamily: "Bricolage Grotesque, Arial, sans-serif"
    fontSize: "clamp(68px, 6.8vw, 104px)"
    fontWeight: 800
    lineHeight: 0.94
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Bricolage Grotesque, Arial, sans-serif"
    fontSize: "clamp(45px, 5vw, 75px)"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.045em"
  title:
    fontFamily: "Bricolage Grotesque, Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.4
  body:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 800
    lineHeight: 1.6
  metadata:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "10px"
    fontWeight: 800
    lineHeight: 1.6
    letterSpacing: "1.1px"
rounded:
  stamp: "4px"
  field: "5px"
  control-ticket: "6px"
  page: "10px"
  circle: "50%"
spacing:
  detail: "8px"
  compact: "12px"
  inset: "16px"
  group: "24px"
  section: "30px"
  form-inset: "36px"
  shell-inset: "48px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.control-ticket}"
    padding: "14px 22px"
  button-primary-hover:
    backgroundColor: "{colors.button-hover}"
  button-no:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control-ticket}"
    padding: "14px 22px"
  button-text:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    padding: "6px 0"
  field:
    backgroundColor: "{colors.field-fill}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "13px"
  choice:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "13px 10px"
  choice-selected:
    backgroundColor: "{colors.lilac}"
  progress:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "23px 36px"
  reservation:
    backgroundColor: "{colors.pink}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control-ticket}"
  host-ticket:
    backgroundColor: "{colors.pink}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control-ticket}"
    width: "300px"
  success-stamp:
    backgroundColor: "{colors.lilac}"
    textColor: "{colors.ink}"
    rounded: "{rounded.stamp}"
    padding: "8px 12px"
---

# Design System: The Delay Date

## Overview

**Creative North Star: "The Overdue Admission Ticket"**

Bold colourful mischief, expressed as a concert-admission ticket rather than a romantic greeting card. Tangerine event fields, lilac surrounding paper and blush ticket stock carry near-black ink, an absurd sleeping-host drawing and jokes about the year-long delay.

The invitation is expressive; the questionnaire and reservation become orderly without leaving that world. Outlined surfaces, visible sequence and immediate selection states keep the ridiculous booking service genuinely usable.

**Key Characteristics:**
- Large, tightly set display type paired with compact, practical body text.
- Flat colour fields, ink outlines, dashed seams and lightly tilted ticket ephemera.
- Original SVG illustration and decorative marks; no shipping raster imagery.
- Mischievous pointer behaviour with stable keyboard, touch and reduced-motion alternatives.

**Evidence and authority:** `src/app/globals.css` is the visual implementation master, including its trailing corrections; `src/app/layout.tsx` supplies the actual font variables on the body, overriding the root Arial defaults. `src/components/booking-experience.tsx` owns semantics and states. `PRODUCT.md` and `.impeccable/surface.md` establish the selected world; `.impeccable/finish-review.md` records the bounded ship verdict. This document's frontmatter is the extracted token contract, not a second runtime stylesheet. Sidecar ramps are panel-only visualizations, not additional product colours.

## Colors

The complete active palette above retains implemented hex values, including translucent rules and spinner track; shadows live separately in the sidecar.

### Primary
- **Tangerine (`orange`):** invitation, questionnaire introduction and confirmation field; also the ticket's cutout backing.
- **Ink (`ink`):** text, outlines, primary actions, radio centres and the success delivery qualification.

### Secondary
- **Lilac (`lilac`):** outer canvas, selected answers, completed progress circles and stickers.
- **Blush (`pink`):** host ticket, reservation and the mouse-evading No button.

### Tertiary
- **Plum (`purple`):** emphasized heading phrases, focus outlines, question numbers and doodles.
- **Interaction colours:** `button-hover` deepens the primary action; `no-hover` lightens No. `error-border` and `error-ink` identify retryable booking failures on paper.

### Neutral
- **Warm paper (`paper`)** supports the booking flow and inverse button text; **field fill** gives editable areas their own surface.
- **Muted, fine print, placeholder and reservation muted** have distinct contextual text roles; they are not interchangeable with ink on every background.
- **Field border** is the final accessible editable-field boundary. The earlier literal (`#a99b9c`) is superseded, not an alternative. The root `--line` declaration (`#b5a5b5`) has no current consumer and is not an active token.
- The remaining named rules, seams, circles, scrollbar and illustration cushion are local detail colours, not new surface themes. The barcode's repeating gradient is an ink/transparent mark, not a background gradient system.

**The Operational Ink Rule.** Keep the success delivery qualification in ink on orange and preserve the final field-border override; decorative seam colours are not substitutes for operational boundaries or status copy.

## Typography

**Display:** Bricolage Grotesque, self-hosted at `public/fonts/bricolage.ttf`; upstream project: https://github.com/ateliertriay/bricolage. **Body:** Manrope, self-hosted at `public/fonts/manrope.ttf`; upstream project: https://github.com/googlefonts/manrope. Both are variable fonts loaded through `next/font/local` with weight range 200–800 and `display: swap`. Retain their SIL OFL 1.1 notices: `public/fonts/bricolagegrotesque-OFL.txt` and `public/fonts/manrope-OFL.txt`. CSS supplies Arial/sans-serif fallback; there is no separate mono face or remote font dependency.

- **Display:** frontmatter describes only the landing title. It becomes 110px at the wide breakpoint, 7.2vw in the intermediate layout, `clamp(60px, 12.9vw, 94px)` on mobile and 59px at the narrowest breakpoint. This is not a sitewide heading size.
- **Headline:** frontmatter describes the questionnaire. Review uses `clamp(45px, 5.1vw, 75px)` / 1.05; confirmation uses 90px / .95, reduced to 75px. Mobile questionnaire/review headings are 48px/49px; narrow review is 43px.
- **Title:** question labels use the title role, becoming 16px on mobile; the optional dietary label is 14px. Ticket and reservation names use larger display-family treatments.
- **Body:** 14px is the body inheritance, not every paragraph. Invitation copy is 13px / 1.9 with a 410px maximum; review copy is 12px / 1.9 with a 360px maximum. Controls and compact supporting text have contextual sizes.
- **Label / metadata:** action labels are bold; edition notes and ticket furniture use tracking and uppercase copy. Implemented metadata ranges down to 6–10px in some responsive details. Record that local density, but do not make tiny metadata the default for new readable content, field labels or instructions.

## Layout

A centred shell caps at 1600px, with 48px side padding. The desktop invitation splits 1.22:1; the questionnaire .9:1.1; review 1.05:1; success 1.2:1. The running order has four aligned columns. The form is paper beside an orange introduction; reservation content is contained in a blush ticket rather than scattered into independent cards.

- **At 1450px and above:** invitation padding expands to 65px 80px, ticket width to 325px and header height to 115px.
- **At 1100px and below:** shell gutters become 30px; ticket width is 270px; forms and review compress their padding. Supplementary progress copy and option captions disappear.
- **At 760px and below:** gutters become 20px; all major split layouts stack in reading order. The ticket follows invitation copy; running order becomes two columns. Header supporting copy and one decorative footer line disappear, not essential form content. Form padding is 27px 22px; buttons retain a 51px minimum height. Keep “Name your” and “demands.” separated by the restored second heading break.
- **At 360px and below:** gutters become 13px, form padding 24px 17px and host ticket 246px; typography and gaps tighten locally.

Spacing values in frontmatter are recurring observed distances, not a rigid universal grid. Preserve long-answer wrapping in the reservation and its scrollable expectations region (180px maximum height).

## Elevation & Depth

Mostly flat colour and one-pixel ink outlines; depth belongs to physical ephemera, not every container. The host ticket tilts 5° (4° on mobile), its sticker 9°, and the success stamp −3°.

- **Host ticket:** `8px 13px 22px #6b2d1c16`, from the host-ticket rule in `src/app/globals.css`.
- **Evading No:** `0 8px 22px #29241f24`, only while fixed above the page during mouse evasion.
- **Selected radio:** `inset 0 0 0 3px var(--lilac)` inside an ink centre; a state marker, not surface elevation.

Booking-page entrance is 350ms ease-out, opacity .85→1 and 8px upward settling. Buttons transition background and transform for 180ms; choices transition background and border for 150ms. The busy spinner rotates in 1s linear cycles. Reduced motion disables animations/transitions, smooth scrolling, primary hover lift and mouse evasion; the busy label remains informative without rotation.

## Shapes

Page surfaces have softly rounded corners; controls and tickets are tighter, fields slightly tighter again. Their exact radii are in frontmatter. Borders stay thin (1px); focus is intentionally stronger (3px). Circular stickers, progress counters and radio marks contrast with the rectangular ticket stock. Dashed perforations, clipped half-circle cutouts, drawn underlines, sparks and barcode marks supply the admission identity without nested decorative cards.

## Components

### Buttons

Confident ink actions with warm-paper text, a trailing SVG arrow and a 54px desktop minimum height. Hover deepens the fill and lifts 2px; active returns to baseline. Text actions are underlined, compact and turn plum on hover; No is outlined and transparent at rest, peach on hover. Disabled submission uses a wait cursor and .7 opacity, a busy label, spinner and `aria-busy`; it cannot be submitted twice while sending.

### Inputs / Fields

Warm, inset writing areas with the final field-border colour, 13px padding and plum caret. Textarea is vertically resizable (92–350px); expectations are required with a 1,500-character counter, and optional dietary text is capped at 300. Explicit labels, helper associations and native required validation remain intact. There is no custom invalid-field or disabled-field visual variant to invent. Booking failure instead appears in the bordered paper error notice with `role="alert"`, retaining answers for retry.

### Choices / Tags

Cuisine tiles and excitement rows are native radios inside full clickable labels, not filter chips. Checked state combines lilac fill, plum border and a filled inset radio mark; hover changes the border. Focus on the visually hidden native input draws a 3px plum outline around its visible choice, offset 3px. Cuisine is a two-column grid; excitement is a vertical list. The success stamp is a noninteractive tag, not a button.

### Navigation

The hourglass wordmark is the home link. Booking progress is a labelled, noninteractive ordered list: current step uses an orange numbered circle and `aria-current="step"`; completed steps use lilac circles with SVG checks. Do not imply the step labels are clickable. A keyboard-visible skip link targets the main region. After step changes, the heading receives programmatic focus; its outline is suppressed deliberately, while ordinary interactive focus uses a 3px plum outline with 5px offset.

### Tickets / Reservation

The host ticket is the signature object: blush stock, original Sleeping Beauty SVG, dashed tear, circular cutouts, paired facts, decorative barcode and round “FINALLY BOOKABLE” sticker. The illustration has an accessible image label; arrows, sparks and barcode are decorative. The unrotated reservation reuses the stock, outline and seams for a reviewable summary and edit action; it does not inherit the host ticket's shadow or tilt.

### Mischief and confirmation states

No evades only a mouse, stays clear of the Yes action and resets position on resize. Keyboard activation, touch, pen and reduced-motion activation decline normally and show “No booking, no pressure.” The sidecar's No preview is intentionally stationary: its CSS demonstrates the control, not the application-owned evasion logic.

Success appears only after provider acceptance. Keep test/live wording distinct and retain the ink-coloured disclaimer: “Provider accepted ≠ inbox delivery. Aayush still needs to confirm the email landed.” The finish review verifies that disclaimer at 6.44:1 on orange and the field boundary at 4.15:1 against field fill / 3.95:1 against paper. These are reviewed combinations, not a blanket accessibility certification; real sending and inbox rendering remain unverified.

## Do's and Don'ts

### Do:
- **Do** preserve the orange/lilac/blush ticket world with near-black ink and plum focus feedback.
- **Do** keep readable operational states distinct from decorative ticket metadata.
- **Do** use the self-hosted fonts with their OFL notices and original SVG artwork; no shipping raster assets are present.
- **Do** retain native labels, radios, visible focus, answer persistence and stationary decline alternatives.
- **Do** treat final CSS overrides and provider-acceptance qualifications as authoritative.

### Don't:
- **Don't** replace the selected world with romance clichés or generic software-marketing cards.
- **Don't** generalize the oversized landing title or tiny ticket metadata into sitewide text requirements.
- **Don't** give every container the host ticket's rotation and shadow.
- **Don't** turn panel-only tonal ramps into shipping palette tokens or revive superseded field borders.
- **Don't** claim an email reached an inbox merely because the provider accepted it.
