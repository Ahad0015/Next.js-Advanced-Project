import { notFound, redirect } from "next/navigation";
import StaffShell from "@/components/StaffShell";
import { getSession } from "@/lib/session";

// Every dashboard page is private: keep all of them out of search results.
export const metadata = { robots: { index: false, follow: false } };

// The layout runs BEFORE the loading skeleton starts streaming, so a signed-out visitor gets a real
// redirect and a customer gets a real 404 status. (A skeleton that has started streaming would
// already have sent "200 OK".) The page checks again too, because layouts do not re-run on every
// client-side navigation: the page is the check that can never be skipped.
export default async function DashboardLayout({ children }) {
  const session = await getSession();
  if (!session) redirect("/signin?next=/dashboard");
  if (session.role !== "staff") notFound();

  return <StaffShell current="dashboard">{children}</StaffShell>;
}
