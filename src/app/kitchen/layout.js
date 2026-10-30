import StaffShell from "@/components/StaffShell";

export const metadata = { robots: { index: false, follow: false } };

export default function KitchenLayout({ children }) {
  return <StaffShell current="kitchen">{children}</StaffShell>;
}
