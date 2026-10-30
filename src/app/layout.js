import "./globals.css";
import { Bricolage_Grotesque, Public_Sans } from "next/font/google";
import Providers from "./providers";
import SiteNav from "./SiteNav";
import GoogleAnalytics from "./GoogleAnalytics";
import { siteUrl } from "@/lib/site";

// next/font self-hosts both fonts and exposes them as CSS variables (see globals.css).
const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap" });
const body = Public_Sans({ subsets: ["latin"], variable: "--font-public", display: "swap" });

export const metadata = {
  metadataBase: new URL(siteUrl), // turns every relative URL below into an absolute one
  title: {
    default: "Addis Eats: Ethiopian food, delivered",
    template: "%s | Addis Eats", // a page titled "Menu" becomes "Menu | Addis Eats"
  },
  description:
    "Order Ethiopian favourites like doro wat, kitfo and shiro from Addis Eats, delivered fresh to your door.",
  openGraph: {
    siteName: "Addis Eats",
    type: "website",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport = { themeColor: "#1d6b44" };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="flex min-h-screen flex-col">
        <Providers>
          <a
            href="#content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
          >
            Skip to content
          </a>
          <SiteNav />
          <div id="content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
            {children}
          </div>
          <footer className="border-t border-line bg-surface">
            <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p>© Addis Eats. Ethiopian food, delivered in Addis Ababa.</p>
              <p>Delivering to Bole, Kazanchis, Piassa, Sarbet, Megenagna and Gerji.</p>
            </div>
          </footer>
        </Providers>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
