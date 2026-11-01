"use client";

import { useEffect, useRef, useState, type FormEvent, type PointerEvent } from "react";
import { cuisines, excitementLevels, formatDay, formatTime, type BookingAnswers, type DatePlan } from "@/lib/date";

type Props = { plan: DatePlan; contactEmail: string; testMode: boolean };
type Receipt = { reference: string; mode: "test" | "live" };
const blankAnswers: BookingAnswers = { expectations: "", cuisine: "", excitement: "", dietary: "" };

function Arrow({ back = false }: { back?: boolean }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={back ? "icon arrow-back" : "icon"}><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function Spark({ className = "" }: { className?: string }) {
  return <svg aria-hidden="true" viewBox="0 0 100 100" className={`spark ${className}`} fill="none"><path d="M50 4v28M50 68v28M4 50h28M68 50h28M17 17l20 20m26 26 20 20M17 83l20-20m26-26 20-20" stroke="currentColor" strokeWidth="7" strokeLinecap="round" /></svg>;
}

function SleepingBeauty() {
  return <svg className="sleeping-beauty" viewBox="0 0 240 200" role="img" aria-label="A very relaxed Sleeping Beauty, supposedly ready for date duty"><g stroke="currentColor" strokeWidth="3.3" strokeLinecap="round" strokeLinejoin="round" fill="none"><path d="M47 138c-9-25-3-66 17-88 19-22 57-31 85-15 28 16 40 41 34 77-5 31-28 55-58 57-30 1-63-8-78-31Z" fill="#ff8655"/><path d="M50 84c-2-29 16-52 34-57 17-9 20 6 30 2 26-15 40 0 47 14 13-1 23 9 21 29-19-5-30-15-36-24-15 14-43 19-63 12-8 16-17 22-33 24Z" fill="#29241f"/><path d="M71 102q12 14 25-1m31-4q12 13 25-3M104 129c3-6 12-6 16 0M115 106l-4 12 8 1M53 107c-20-9-19 23-1 26m130-32c17-10 17 20 0 26"/><path d="m181 45 17-4-13 20 18-5m-1-42 20-4-14 22 20-5"/><path d="M27 162c-1 14 9 20 24 20h133c19 0 27-14 18-23-8-7-21-3-28 1-12 7-47 16-75 7-20-7-33-8-43-4-10-6-23-11-29-1Z" fill="#f5f0dc"/></g></svg>;
}

function HostTicket({ plan }: { plan: DatePlan }) {
  return <aside className="host-ticket" aria-label="Your date booking ticket">
    <div className="ticket-top"><span>ONE VERY OVERDUE DATE</span><span className="ticket-dot" /></div>
    <div className="portrait"><span className="sleep-label">nap mode: off*</span><SleepingBeauty /><span className="portrait-caption">*allegedly</span></div>
    <div className="host-name"><h2>Ayush Tripathi</h2><span>aka Sleeping Beauty</span></div>
    <div className="ticket-tear"><span /><span /></div>
    <dl className="ticket-facts"><div><dt>WHEN</dt><dd>{formatDay(plan.day).replace("2026", "’26")}</dd></div><div><dt>PICKUP</dt><dd>{formatTime(plan.time)}. Your gate.</dd></div></dl>
    <div className="ticket-bottom"><div className="barcode" aria-hidden="true" /><span>ADMIT TWO · NO EXCUSES</span></div>
    <div className="ticket-sticker">FINALLY<br /><strong>BOOKABLE.</strong><svg aria-hidden="true" viewBox="0 0 30 18"><path d="M3 7q12 17 24-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></div>
  </aside>;
}

function RunawayNo({ onDecline }: { onDecline: () => void }) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [attempts, setAttempts] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const lastPointerType = useRef("");
  function flee(event: PointerEvent<HTMLButtonElement>) {
    if (event.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (event.type === "pointerdown") event.preventDefault();
    const width = buttonRef.current?.offsetWidth || 115;
    const height = buttonRef.current?.offsetHeight || 55;
    const maxX = Math.max(12, window.innerWidth - width - 16);
    const maxY = Math.max(12, window.innerHeight - height - 16);
    const yes = document.getElementById("yes-button")?.getBoundingClientRect();
    let next = { x: 16, y: 16 };
    for (let i = 0; i < 25; i++) {
      next = { x: 16 + Math.random() * Math.max(0, maxX - 16), y: 16 + Math.random() * Math.max(0, maxY - 16) };
      const awayFromPointer = Math.hypot(next.x - event.clientX, next.y - event.clientY) > 130;
      const clearOfYes = !yes || next.x + width < yes.left - 12 || next.x > yes.right + 12 || next.y + height < yes.top - 12 || next.y > yes.bottom + 12;
      if (awayFromPointer && clearOfYes) break;
    }
    setPosition(next);
    setAttempts(n => n + 1);
  }
  useEffect(() => {
    const reset = () => setPosition(null);
    window.addEventListener("resize", reset);
    return () => window.removeEventListener("resize", reset);
  }, []);
  return <span className="no-slot"><button ref={buttonRef} className={`button button-no ${position ? "on-the-run" : ""}`} onPointerEnter={flee} onPointerDown={event => { lastPointerType.current = event.pointerType; flee(event); }} onClick={event => { if (event.detail === 0 || lastPointerType.current === "touch" || lastPointerType.current === "pen" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setPosition(null); onDecline(); } }} style={position ? { left: position.x, top: position.y } : undefined} aria-describedby="no-hint">{attempts > 2 ? "Still no?" : "No"}<span aria-hidden="true">×</span></button></span>;
}

export function BookingExperience({ plan, contactEmail, testMode }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<BookingAnswers>(blankAnswers);
  const [declined, setDeclined] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [restored, setRestored] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    try {
      const draft = sessionStorage.getItem("delay-date-draft-v1");
      if (draft) {
        const parsed = JSON.parse(draft);
        const saved = { ...blankAnswers };
        if (typeof parsed.expectations === "string") saved.expectations = parsed.expectations.slice(0, 1500);
        if (typeof parsed.dietary === "string") saved.dietary = parsed.dietary.slice(0, 300);
        if (cuisines.includes(parsed.cuisine)) saved.cuisine = parsed.cuisine;
        if (excitementLevels.includes(parsed.excitement)) saved.excitement = parsed.excitement;
        setAnswers(saved);
      }
    } catch { /* Storage is optional in private browsing. */ }
    setRestored(true);
  }, []);
  useEffect(() => {
    if (restored) {
      try { sessionStorage.setItem("delay-date-draft-v1", JSON.stringify(answers)); } catch { /* Keep working without storage. */ }
    }
  }, [answers, restored]);
  useEffect(() => {
    if (step > 0) {
      headingRef.current?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [step]);

  function update(field: keyof BookingAnswers, value: string) { setAnswers(current => ({ ...current, [field]: value })); }
  function submitPreferences(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setError(""); setStep(2); }
  async function bookDate() {
    if (sending) return;
    setSending(true); setError("");
    try {
      const response = await fetch("/api/book", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(answers), signal: AbortSignal.timeout(45_000) });
      const result = await response.json();
      if (!response.ok || !result.accepted) throw new Error(result.error || "The booking desk didn’t answer. Try again in a moment.");
      setReceipt({ reference: result.reference, mode: result.mode });
      try { sessionStorage.removeItem("delay-date-draft-v1"); } catch { /* optional */ }
      setStep(3);
    } catch (cause) {
      setError(cause instanceof Error && cause.name !== "TimeoutError" ? cause.message : "The booking desk is taking too long. Your answers are safe. Check your inbox before retrying; the email may already be on its way.");
    } finally { setSending(false); }
  }

  return <div className="site-shell">
    <a href="#main" className="skip-link">Skip to invitation</a>
    <header className="site-header"><a className="wordmark" href="/" aria-label="The Delay Date home"><svg aria-hidden="true" viewBox="0 0 32 32" fill="none"><path d="M7 4h18v7c0 4-9 5-9 5s-9 1-9 5v7h18v-7c0-4-9-5-9-5s-9-1-9-5V4Z" stroke="currentColor" strokeWidth="2"/><path d="M6 4h20M6 28h20M12 9h8m-8 15h8" stroke="currentColor" strokeWidth="2"/></svg>the delay date<span className="wordmark-period">.</span></a><div className="header-note"><span className="status-dot" />ONE YEAR LATE. STILL WORTH IT?</div><span className="header-edition">THE TANNU EDITION</span></header>
    <main id="main">
      {step === 0 ? <>
        <section className="invitation" aria-labelledby="invite-heading">
          <div className="invitation-copy">
            <h1 id="invite-heading">THE DELAY<br /><span className="date-word">DATE<svg aria-hidden="true" viewBox="0 0 350 20"><path d="M5 12c94-10 218-10 339-4M12 18c90-9 212-10 322-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg></span><span className="title-period">.</span></h1>
            <div className="greeting"><span className="greeting-line" /><span>Hey Tannu,</span></div>
            <p className="invite-lead">Your patience deserves an award.<br />You’re getting a date instead.</p>
            <p className="invite-description">A year in the making. Several naps in the way.<br className="desktop-br" /> But I’m here, I have a plan, and I’m <em>mostly</em> awake.<br className="desktop-br" /> Fancy booking one Ayush Tripathi for the evening?</p>
            <div className="invitation-actions"><button id="yes-button" className="button button-dark" onClick={() => setStep(1)}>Yes, book this human <Arrow /></button><RunawayNo onDecline={() => setDeclined(true)} /></div>
            <p id="no-hint" className="fine-print">{declined ? "Fair enough. No booking, no pressure. The invitation stays open." : "The ‘No’ button has commitment issues. Don’t take it personally."}</p>
          </div>
          <div className="ticket-stage"><div className="scribble-note">a year in the making.<br /><span>literally.</span><svg aria-hidden="true" viewBox="0 0 100 60"><path d="M10 5q-4 38 65 34m-16-13 19 13-17 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></div><HostTicket plan={plan} /><Spark className="hero-spark" /></div>
          <div className="invitation-foot"><span><span className="mini-star" aria-hidden="true">✳</span> NOT A DRILL. ACTUALLY A DATE.</span><span>EST. ONE YEAR AGO <span className="foot-arrow" aria-hidden="true">↗</span></span></div>
        </section>
        <section className="running-order" aria-label="The very loose itinerary"><div className="running-title">THE PLAN,<br /><strong>more or less.</strong></div><div className="plan-item"><span>THE RENDEZVOUS</span><p>{formatTime(plan.time)}. Your hostel gate.</p></div><div className="plan-item"><span>THE MAIN EVENT</span><p>Food. Us. Questionable jokes.</p></div><div className="plan-item"><span>THE FINE PRINT</span><p>Zero work calls. Probably.</p></div></section>
        <div className="bottom-note"><Spark /><p>Good things take time.<br /><span>I may have taken that a little too seriously.</span></p></div>
      </> : <section className={`booking-page ${step === 3 ? "confirmation-page" : ""}`}>
        <nav aria-label="Booking progress" className="progress-nav"><ol>{["The invitation", "Your demands", "Make it official"].map((label, index) => <li key={label} className={step > index ? "completed" : ""} aria-current={Math.min(step, 2) === index ? "step" : undefined}><span>{step > index ? <svg aria-hidden="true" viewBox="0 0 16 16"><path d="m3 8 3 3 7-7" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg> : index + 1}</span>{label}</li>)}</ol><span className="progress-aside">NO PAYMENT. JUST YOUR COMPANY.</span></nav>
        {step === 1 ? <div className="questionnaire-layout">
          <div className="form-intro"><h1 ref={headingRef} tabIndex={-1}>Okay, Tannu.<br />Name your<br /><span>demands.</span></h1><p>A very serious questionnaire for a very unserious booking service.</p><div className="intro-doodle"><Spark /><span>Your wish list.<br />My problem.</span></div><p className="intro-footnote">Takes a minute. Unlike planning this date.</p></div>
          <form className="preferences-form" onSubmit={submitPreferences}>
            <div className="form-question"><label htmlFor="expectations"><span className="question-number">01</span>What are your expectations?</label><p id="expectations-help">Dream big. But remember who you’re booking.</p><textarea id="expectations" required maxLength={1500} rows={3} value={answers.expectations} onChange={e => update("expectations", e.target.value)} placeholder="Good food, no naps, and for you to be on time for once…" aria-describedby="expectations-help expectations-count" /><span className="char-count" id="expectations-count">{answers.expectations.length}/1,500</span></div>
            <fieldset className="form-question"><legend><span className="question-number">02</span>What are we eating?</legend><p>Pick the plot. I’ll handle the restaurant.</p><div className="cuisine-options">{cuisines.map((cuisine, index) => <label className="choice cuisine-choice" key={cuisine}><input type="radio" name="cuisine" value={cuisine} required checked={answers.cuisine === cuisine} onChange={() => update("cuisine", cuisine)} /><span className="choice-art" aria-hidden="true"><FoodIcon index={index} /></span><span>{cuisine}</span><span className="radio-indicator" /></label>)}</div></fieldset>
            <fieldset className="form-question"><legend><span className="question-number">03</span>How excited are you?</legend><p>This is a safe space. Mostly.</p><div className="excitement-options">{excitementLevels.map((level, index) => <label className="choice excitement-choice" key={level}><input type="radio" name="excitement" required value={level} checked={answers.excitement === level} onChange={() => update("excitement", level)} /><span className="radio-indicator" /><span>{level}</span><span className="choice-caption">{["Keeping it cool", "There she is", "A fair review, honestly"][index]}</span></label>)}</div></fieldset>
            <div className="form-question dietary-question"><label htmlFor="dietary">Any food rules? <span className="optional">(optional)</span></label><input type="text" id="dietary" value={answers.dietary} onChange={e => update("dietary", e.target.value)} maxLength={300} placeholder="Allergies, vegetarian, no mushrooms, extra dessert…" /></div>
            <div className="form-bottom"><button type="button" className="text-button" onClick={() => setStep(0)}><Arrow back />Back</button><button type="submit" className="button button-dark">Submit my demands <Arrow /></button></div>
          </form>
        </div> : step === 2 ? <div className="review-layout">
          <div className="review-intro"><h1 ref={headingRef} tabIndex={-1}>Good things<br /><span>take time.</span></h1><p className="review-subtitle">Some things take an entire year.<br />Anyway. Let’s make this official.</p><p className="review-description">You know me, I’ll be late. If you’re frustrated or have a query, you can email me — which I would not reply to, obviously — or you can call me.</p><div className="contact-links"><a href={`mailto:${contactEmail}`}>Email the complaint department <Arrow /></a><a href="tel:+919592042161">Call Sleeping Beauty <Arrow /></a><span>+91 95920 42161 · repeat yourself if necessary</span></div><div className="review-note"><Spark /><p>Be at your hostel gate.<br /><strong>I’ll handle the rest, buddhu baksa.</strong></p></div></div>
          <div className="reservation"><div className="reservation-top"><h2>Your reservation</h2><span>ADMIT TWO</span></div><div className="reservation-pickup"><span>THE DELAY DATE</span><strong>{formatDay(plan.day)}</strong><p>{formatTime(plan.time)} · {plan.pickup}</p><span>{plan.timezone} · itinerary: classified</span></div><dl className="reservation-details"><div><dt>Booked human</dt><dd>Ayush “Sleeping Beauty” Tripathi</dd></div><div><dt>Cuisine</dt><dd>{answers.cuisine}</dd></div><div><dt>Excitement</dt><dd>{answers.excitement}</dd></div><div className="expectations-summary"><dt>Your expectations</dt><dd>{answers.expectations}</dd></div>{answers.dietary ? <div><dt>Food rules</dt><dd>{answers.dietary}</dd></div> : null}</dl><button className="text-button edit-button" onClick={() => setStep(1)}>Edit my demands <Arrow back /></button><div className="booking-submit">{testMode ? <p className="test-notice"><span className="status-dot" />TEST MODE · Email goes to Ayush only.</p> : <p className="delivery-note">A reservation email for you and Ayush. No spam. He’s enough.</p>}<button type="button" className="button button-dark book-button" onClick={bookDate} disabled={sending} aria-busy={sending}>{sending ? "Waking up the booking desk…" : "Book My Date"}{sending ? <span className="spinner" aria-hidden="true" /> : <Arrow />}</button>{error ? <p className="booking-error" role="alert">{error}</p> : null}<p className="fine-print">Punctuality sold separately. Naps not included.</p></div></div>
        </div> : <div className="success-layout"><div className="success-copy"><span className="success-stamp">{receipt?.mode === "test" ? "TEST REQUEST ACCEPTED" : "OFFICIALLY ON THE CALENDAR"}</span><h1 ref={headingRef} tabIndex={-1}>About.<br />Damn.<br /><span>Time.</span></h1><p>{receipt?.mode === "test" ? "The email service accepted the test reservation for Ayush only. Tannu has not been emailed." : "The email service accepted both reservation emails. Check your inboxes — and spam, because apparently even romance has a filter."}</p><p className="success-detail">{formatDay(plan.day)} · {formatTime(plan.time)}<br />{plan.pickup}. Don’t let me live this down.</p><p className="delivery-note">Provider accepted ≠ inbox delivery. Ayush still needs to confirm the email landed.</p><a className="button button-dark" href="tel:+919592042161">Tell him to set an alarm <Arrow /></a><span className="reference">REFERENCE: {receipt?.reference}</span></div><HostTicket plan={plan} /></div>}
      </section>}
    </main>
    <footer className="site-footer"><span>PLANNED BY AYUSH. EVENTUALLY.</span><span>NO REFUNDS ON THE YEAR YOU WAITED.</span><span>FOR TANNU, OBVIOUSLY. <svg aria-hidden="true" viewBox="0 0 20 20"><path d="m5 15 10-10M5 5h10v10" stroke="currentColor" fill="none" strokeWidth="1.5" /></svg></span></footer>
  </div>;
}

function FoodIcon({ index }: { index: number }) {
  return <svg viewBox="0 0 42 42" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{index === 0 ? <><path d="M5 23h32c0 9-5 13-16 13S5 32 5 23Zm-2-3h36M14 6c-6 6 5 6 0 12m9-14c-6 6 5 6 0 12m8-10c-6 6 5 6 0 12" /></> : index === 1 ? <><path d="M6 23h30c-1 10-8 13-15 13S7 33 6 23Zm11 0L30 4m-5 19L37 6M8 17c4-7 7 5 11-2s7 6 12-1" /></> : index === 2 ? <><path d="m7 34 9-27c9 2 16 8 20 17L7 34Zm9-27 2-4c10 3 16 8 21 19l-3 2" /><circle cx="19" cy="17" r="2.5"/><circle cx="27" cy="24" r="2.5"/><path d="m13 27 3-2" /></> : <><path d="m21 4 4 11 12 1-9 8 3 12-10-7-10 7 3-12-9-8 12-1 4-11Z" /></>}</svg>;
}
