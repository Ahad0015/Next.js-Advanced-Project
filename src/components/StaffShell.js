import Link from "next/link";
import { IconChart, IconKitchen } from "./Icons";

const LINKS = [
  { key: "dashboard", href: "/dashboard", label: "Dashboard", Icon: IconChart },
  { key: "kitchen", href: "/kitchen", label: "Kitchen", Icon: IconKitchen },
];

// The staff area: a sidebar on wide screens, a scrollable tab strip on phones.
// `current` is passed in by each layout, so this stays a server component.
export default function StaffShell({ current, children }) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:gap-8">
      <nav aria-label="Staff" className="md:w-52 md:shrink-0">
        <p className="mb-2 hidden px-3 text-sm font-semibold text-muted md:block">Staff area</p>
        <ul className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 md:flex-col md:overflow-visible md:pb-0">
          {LINKS.map(({ key, href, label, Icon }) => (
            <li key={key}>
              <Link
                href={href}
                aria-current={current === key ? "page" : undefined}
                className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                  current === key ? "bg-brand text-white" : "text-ink hover:bg-brand-soft"
                }`}
              >
                <Icon width={18} height={18} />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
