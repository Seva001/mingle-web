/** Single source for public navigation, so a test can prove none of it is dead. */
export type NavLink = { label: string; href: string };

// Header navigation. "How it works" is a section of the home page (the standalone
// /how-it-works route only redirects there), so it links straight to the anchor.
// Member discovery itself stays gated until safety workflows exist (brief §15).
export const primaryNav: readonly NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Help", href: "/help" },
  { label: "Safety", href: "/safety" },
];

/** Home-page section ids that have their own header entry (used for the active state). */
export const navSectionIds: readonly string[] = primaryNav.flatMap((item) => {
  const hash = item.href.split("#")[1];
  return hash ? [hash] : [];
});

/**
 * Whether a header link is the current location.
 * `section` is the home-page section currently in view (null when none, or off the home page).
 */
export function isNavActive(item: NavLink, pathname: string, section: string | null): boolean {
  const [path, hash] = item.href.split("#");
  const itemPath = path || "/";
  if (hash) return pathname === itemPath && section === hash;
  if (itemPath === "/") return pathname === "/" && section === null;
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
}

export const authLinks = {
  signIn: { label: "Sign in", href: "/sign-in" },
  getStarted: { label: "Get Started", href: "/sign-up" },
} as const;

/** Landing-hero calls to action. Hrefs must be real routes or anchors (tests enforce it). */
export const heroCtas = {
  primary: authLinks.getStarted,
  secondary: { label: "Create Account", href: "/sign-up" },
  signIn: authLinks.signIn,
} as const;

/** No temporary account-availability copy is displayed in the public marketing experience. */
export function heroAccountNote(_accountsAvailable: boolean): string | null {
  return null;
}

// Footer link groups. Rules: every href must resolve to an existing route or on-page anchor
// (tests/navigation.test.ts enforces it), and nothing is listed before it exists.
// Social links are omitted until verified official profile URLs are provided.
export const footerGroups: readonly { title: string; links: readonly NavLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      { label: "How it works", href: "/#how-it-works" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help", href: "/help" },
      { label: "FAQ", href: "/faq" },
      { label: "Safety", href: "/safety" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Cookies", href: "/cookies" },
      { label: "Community guidelines", href: "/community-guidelines" },
    ],
  },
];

/** Footer copyright line; the year is passed in so it is generated, never hard-coded. */
export function copyrightLine(year: number): string {
  return `© ${year} Mingle. All rights reserved.`;
}
