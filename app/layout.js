import "./globals.css";
import AnimatedBackground from "./components/animated-background";
import RouteLoading from "./components/route-loading";
import { LanguageProvider } from "./components/language-provider";
import { siteName, siteUrl } from "../lib/site";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — Motorcycle and ATV News`,
    template: `%s | ${siteName}`,
  },
  description: "Independent motorcycle news desk: new models, manufacturer announcements, racing and industry moves.",
  applicationName: siteName,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName,
    locale: "en_US",
    alternateLocale: ["fr_FR"],
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }) {
  return (
    <html className="dark" lang="en" suppressHydrationWarning>
      <head>
        {/* Font isteklerinin TLS el sıkışması sayfa ile paralel başlasın. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@8..144,400..700&family=Inter:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400;1,6..72,700&family=Space+Grotesk:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="bg-background text-on-background selection:bg-primary-container selection:text-on-primary-container"
        suppressHydrationWarning
      >
        <AnimatedBackground />
        <RouteLoading />
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
