import { IconPlate } from "@/components/Icons";

// Nested layout: wraps /menu and every /menu/[id] page, and stays mounted when you move between them.
export default function MenuLayout({ children }) {
  return (
    <div>
      <aside aria-label="Opening hours" className="mb-8 flex items-center gap-2 rounded-lg bg-brand-soft px-4 py-2.5 text-sm text-brand-strong">
        <IconPlate width={18} height={18} className="shrink-0" />
        Kitchen open daily, 8:00 to 22:00. Orders usually arrive within 40 minutes.
      </aside>
      {children}
    </div>
  );
}
