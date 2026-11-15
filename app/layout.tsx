import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter/opsz.css";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

export const metadata: Metadata = {
  title: { default: "Mingle", template: "%s · Mingle" },
  description: "Meaningful connections. Better matches. For adults 18+.",
  // Public pages are indexable. Account, member and admin areas set their own noindex.
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#09090A" },
    { media: "(prefers-color-scheme: light)", color: "#F4F4F1" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the boot script sets data-theme before React hydrates.
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-control focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
        >
          Skip to content
        </a>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
