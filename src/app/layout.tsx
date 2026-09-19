import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { FeedbackWidget } from "@/components/shared/feedback-widget";
import { site } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/* Fraunces echoes the italic serif in the Gap Castle wordmark's tagline. */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: [
    "school fee loan Nigeria",
    "travel loan Nigeria",
    "proof of funds loan",
    "personal loan Lagos",
    "SME business loan Nigeria",
    "bill payment Nigeria",
    "Gap Castle",
  ],
  authors: [{ name: site.legalName }],
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: [{ url: "/logo-lockup.png", width: 2137, height: 1538, alt: `${site.name} logo` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#242e9b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-NG"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
      // the inline script below adds `js` to this element before hydration
      suppressHydrationWarning
    >
      <head>
        {/* Marks JS as available before first paint so scroll-reveal can hide
            content. Without it every section renders immediately. */}
        <script
           
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js')`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-paper text-ink">
        {children}
        {/* ReviseFlow feedback widget — public site and admin, production only */}
        <FeedbackWidget />
      </body>
    </html>
  );
}
