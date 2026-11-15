"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { Container } from "@/components/layout/container";
import { ThemeToggle } from "@/components/navigation/theme-toggle";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { authLinks, isNavActive, navSectionIds, primaryNav, type NavLink } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Matches Tailwind's `lg`, where the desktop navigation replaces the menu button. */
const DESKTOP_QUERY = "(min-width: 1024px)";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Visible and in the tab order (hidden desktop-only links and unchecked radios are not). */
function isTabbable(el: HTMLElement) {
  return el.getClientRects().length > 0 && !el.matches('input[type="radio"]:not(:checked)');
}

/**
 * Which home-page section sits at the reading line, so "How it works" can show as current
 * while it is in view. Always null away from the home page.
 */
function useActiveSection(pathname: string) {
  const [section, setSection] = useState<string | null>(null);

  useEffect(() => {
    if (pathname !== "/" || typeof IntersectionObserver === "undefined") return;
    const targets = navSectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        setSection(navSectionIds.find((id) => visible.has(id)) ?? null);
      },
      // A thin band just above the middle of the viewport.
      { rootMargin: "-35% 0px -60% 0px" },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  return pathname === "/" ? section : null;
}

export function SiteHeader() {
  const pathname = usePathname();
  const section = useActiveSection(pathname);
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the menu whenever the route changes (links, back/forward).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    // The open menu is a full-height sheet: keep the page behind it still.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Move focus into the menu so keyboard users start at the first link.
    menuRef.current?.querySelector<HTMLElement>("a")?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }
      // Keep Tab inside the header while the sheet covers the page.
      if (e.key !== "Tab" || !headerRef.current) return;
      const items = Array.from(headerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        isTabbable,
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      const current = document.activeElement;
      if (!headerRef.current.contains(current)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && current === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && current === last) {
        e.preventDefault();
        first.focus();
      }
    };

    // Resizing up to the desktop layout hides the menu button, so close the sheet.
    const media = window.matchMedia(DESKTOP_QUERY);
    const onMediaChange = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    media.addEventListener("change", onMediaChange);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      media.removeEventListener("change", onMediaChange);
    };
  }, [open]);

  const current = (item: NavLink) => isNavActive(item, pathname, section);

  return (
    <header
      ref={headerRef}
      className={cn(
        "sticky top-0 z-40 border-b border-line backdrop-blur-xl",
        open ? "bg-background" : "bg-background/80",
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="Mingle home" className="shrink-0">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {primaryNav.map((item) => {
            const active = current(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? (item.href.includes("#") ? "location" : "page") : undefined}
                className={cn(
                  "rounded-control px-3 py-2 text-caption font-semibold transition-colors",
                  active
                    ? "bg-foreground/10 text-foreground"
                    : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          <ThemeToggle compact />
          <ButtonLink href={authLinks.signIn.href} variant="ghost" size="sm">
            {authLinks.signIn.label}
          </ButtonLink>
          <ButtonLink href={authLinks.getStarted.href} size="sm">
            {authLinks.getStarted.label}
          </ButtonLink>
        </div>

        <button
          ref={buttonRef}
          type="button"
          aria-expanded={open}
          aria-controls={open ? "mobile-menu" : undefined}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-line bg-surface lg:hidden"
        >
          {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        </button>
      </Container>

      {open ? (
        <div
          id="mobile-menu"
          ref={menuRef}
          className="absolute inset-x-0 top-full h-[calc(100dvh-4.0625rem)] overflow-y-auto overscroll-contain border-t border-line bg-background lg:hidden"
        >
          <Container className="flex flex-col pt-4 pb-[max(2rem,env(safe-area-inset-bottom))]">
            <nav aria-label="Main mobile">
              <ul className="flex flex-col gap-1">
                {primaryNav.map((item) => {
                  const active = current(item);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={
                          active ? (item.href.includes("#") ? "location" : "page") : undefined
                        }
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex min-h-12 items-center rounded-control px-4 py-3 text-lead font-semibold transition-colors",
                          active
                            ? "bg-foreground/10 text-foreground"
                            : "text-foreground/80 hover:bg-foreground/10 hover:text-foreground",
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="mt-6 grid gap-3">
              <ButtonLink
                href={authLinks.signIn.href}
                variant="secondary"
                size="lg"
                onClick={() => setOpen(false)}
              >
                {authLinks.signIn.label}
              </ButtonLink>
              <ButtonLink
                href={authLinks.getStarted.href}
                size="lg"
                onClick={() => setOpen(false)}
              >
                {authLinks.getStarted.label}
              </ButtonLink>
            </div>

            <div className="mt-6 flex flex-col items-start gap-2 border-t border-line pt-5">
              <span className="text-caption font-semibold text-muted">Appearance</span>
              <ThemeToggle />
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
