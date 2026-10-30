"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { signOut } from "@/app/actions";
import { useCart } from "./providers";
import { IconCart, IconChevronDown, IconClose, IconMenu, IconPlate, IconUser } from "@/components/Icons";

// The whole site header. It is a client component because it needs three browser-side things:
// the current path (to mark the active link), the signed-in user (SWR on /api/me) and open/closed menus.
// Reading the cookie in the root layout instead would make every page in the app dynamic.
export default function SiteNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { count } = useCart();
  const { data, mutate } = useSWR("/api/me", fetcher);

  // Menus remember the path they were opened on, so they close by themselves on navigation.
  const [mobileOpenAt, setMobileOpenAt] = useState(null);
  const [accountOpenAt, setAccountOpenAt] = useState(null);
  const mobileOpen = mobileOpenAt === pathname;
  const accountOpen = accountOpenAt === pathname;
  const accountRef = useRef(null);

  // Re-check who is signed in after every navigation (for example right after sign-in).
  useEffect(() => {
    mutate();
  }, [pathname, mutate]);

  // Close the account menu with Escape or a click elsewhere.
  useEffect(() => {
    if (!accountOpen) return;
    const onKey = (e) => e.key === "Escape" && setAccountOpenAt(null);
    const onClick = (e) => accountRef.current && !accountRef.current.contains(e.target) && setAccountOpenAt(null);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [accountOpen]);

  async function handleSignOut() {
    await signOut();
    await mutate({ user: null }, false);
    router.push("/");
    router.refresh();
  }

  const user = data?.user;
  const isStaff = user?.role === "staff";
  const links = [
    { href: "/menu", label: "Menu" },
    ...(user ? [{ href: "/orders", label: "My orders" }] : []),
    ...(isStaff ? [{ href: "/dashboard", label: "Dashboard" }, { href: "/kitchen", label: "Kitchen" }] : []),
  ];
  const isActive = (href) => pathname === href || pathname.startsWith(href + "/");
  const linkClass = (href) =>
    `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${isActive(href) ? "bg-brand-soft text-brand-strong" : "text-ink hover:bg-brand-soft"}`;

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2.5 sm:px-6">
        <Link href="/" className="mr-2 flex items-center gap-2 font-display text-xl font-bold text-brand-strong">
          <IconPlate width={26} height={26} className="text-brand" />
          Addis Eats
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} aria-current={isActive(l.href) ? "page" : undefined} className={linkClass(l.href)}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link href="/cart" className="btn btn-ghost relative px-3" aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}>
            <IconCart />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-berbere px-1 text-xs font-bold text-white" aria-hidden="true">
                {count}
              </span>
            )}
          </Link>

          {data === undefined ? (
            <span className="skeleton hidden h-9 w-24 sm:block" aria-hidden="true" />
          ) : !user ? (
            <Link href="/signin" className="btn btn-primary btn-sm">Sign in</Link>
          ) : (
            <div className="relative hidden sm:block" ref={accountRef}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                onClick={() => setAccountOpenAt(accountOpen ? null : pathname)}
              >
                <IconUser width={16} height={16} />
                {user.name}
                <IconChevronDown width={16} height={16} />
              </button>
              {accountOpen && (
                <div role="menu" className="absolute right-0 mt-2 w-52 rounded-xl border border-line bg-surface p-1 shadow-lg">
                  <p className="px-3 py-2 text-xs text-muted">Signed in as {user.role === "staff" ? "staff" : "customer"}</p>
                  {isStaff && <Link role="menuitem" href="/dashboard" className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-brand-soft">Dashboard</Link>}
                  <Link role="menuitem" href="/orders" className="block rounded-lg px-3 py-2 text-sm hover:bg-brand-soft">My orders</Link>
                  <button role="menuitem" type="button" onClick={handleSignOut} className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-berbere hover:bg-berbere-soft">
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            className="btn btn-ghost px-3 md:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpenAt(mobileOpen ? null : pathname)}
          >
            {mobileOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-line bg-surface px-4 py-3 md:hidden">
          <ul className="flex flex-col gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} aria-current={isActive(l.href) ? "page" : undefined} className={`block ${linkClass(l.href)}`}>
                  {l.label}
                </Link>
              </li>
            ))}
            {user && (
              <li>
                <button type="button" onClick={handleSignOut} className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-berbere hover:bg-berbere-soft">
                  Sign out ({user.name})
                </button>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
