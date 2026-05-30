import type { Metadata } from "next";
import {
  Inter,
  Great_Vibes,
  Pacifico,
  Dancing_Script,
  Playfair_Display,
} from "next/font/google";
import "./globals.css";

import SessionProvider from "@/components/session-provider";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  subsets: ["latin"],
});

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
});

const pacifico = Pacifico({
  weight: "400",
  subsets: ["latin"],
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CertGen",
  description: "Bulk certificate generator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`
          ${inter.className}
          ${greatVibes.className}
          ${pacifico.className}
          ${dancingScript.className}
          ${playfair.className}
        `}
      >
        <SessionProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
