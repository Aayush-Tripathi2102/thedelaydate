import { getPlan } from "@/lib/date";
import { BookingExperience } from "@/components/booking-experience";

export default function Home() {
  return <BookingExperience plan={getPlan()} contactEmail={process.env.AYUSH_EMAIL || "aayushtripathi2102@gmail.com"} testMode={process.env.EMAIL_MODE !== "live" || process.env.LIVE_SEND_APPROVED !== "true"} />;
}
