"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "./Header.css";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/library", label: "Library" },
  { href: "/friends", label: "Friends" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Top navigation bar shared by every page in the app.
 */
export default function Header() {
  const pathname = usePathname();

  return (
    <header className="header">
      <div className="header__inner">
        <Link href="/" className="header__brand">
          Book App
        </Link>

        <nav className="header__nav" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`header__link${active ? " header__link--active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
