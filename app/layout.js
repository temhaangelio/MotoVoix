import "./globals.css";
import AnimatedBackground from "./components/animated-background";
import RouteLoading from "./components/route-loading";

export const metadata = {
  title: "MotoVoix",
  description: "Motorcycle news",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html className="dark" lang="en" suppressHydrationWarning>
      <head>
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
        {children}
      </body>
    </html>
  );
}
