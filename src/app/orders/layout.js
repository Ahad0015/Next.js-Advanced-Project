import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

// Runs BEFORE the loading skeleton starts streaming, so a forged or expired cookie gets a real
// 307 redirect instead of a "200 OK" skeleton that redirects afterwards. The pages still check
// the session themselves, because layouts do not re-run on every client-side navigation.
export default async function OrdersLayout({ children }) {
  if (!(await getSession())) redirect("/signin?next=/orders");
  return children;
}
