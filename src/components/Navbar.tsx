"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import CartDrawer from "@/components/CartDrawer";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?category=custom", label: "Custom Builds" },
  { href: "/our-story", label: "Our Story" },
  { href: "/instructions", label: "How It Works" },
  { href: "/contact-us", label: "Contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount, openCart } = useCart();

  return (
    <header className="sticky top-0 z-30 bg-midway-gradient text-white shadow-md">
      <div className="caution-stripe h-1.5 w-full" />
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="font-display text-xl tracking-wide text-[var(--color-gold-bright)] sm:text-2xl"
        >
          SPINNER PIÑATA®
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-semibold lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-[var(--color-gold-bright)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={openCart}
            aria-label={`Open cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
            className="relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-gold-bright)]"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 4h2l2.4 12.4A2 2 0 0 0 9.36 18h7.78a2 2 0 0 0 1.95-1.57L20.5 8H6"
              />
              <circle cx="9.5" cy="21" r="1.4" fill="currentColor" stroke="none" />
              <circle cx="17.5" cy="21" r="1.4" fill="currentColor" stroke="none" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-gold)] px-1 text-[11px] font-bold text-[var(--color-ink)]">
                {itemCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-white/10 lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              {menuOpen ? (
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-white/10 bg-[var(--color-midway-deep)] px-4 py-3 lg:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-3 text-sm font-semibold transition-colors hover:bg-white/10"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}

      <CartDrawer />
    </header>
  );
}
