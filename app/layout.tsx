import type { Metadata } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import SessionProvider from "@/components/session-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { themeInitScript } from "@/lib/theme-script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.certificategenerator.space"),
  title: {
    default: "CertGen — Design, bulk-generate and verify certificates",
    template: "%s · CertGen",
  },
  description:
    "Design a certificate once, generate one for everyone on your list, and give each a QR code anyone can verify. PNG and PDF export, built for events, courses and teams.",
  openGraph: {
    title: "CertGen — Design, bulk-generate and verify certificates",
    description:
      "Design a certificate once, generate one for everyone on your list, and give each a QR code anyone can verify.",
    url: "https://www.certificategenerator.space",
    siteName: "CertGen",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-sans">
        <SessionProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
