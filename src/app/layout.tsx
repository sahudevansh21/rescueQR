import type { Metadata } from "next";
import { Inter, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VitalLink AI — Smart Emergency QR Profiles",
  description: "VitalLink AI provides instant access to critical medical history, blood groups, and emergency contacts to save lives. Real-time alerts and AI-guided responder briefings.",
  keywords: ["emergency qr", "medical identification", "first responder", "medical alert", "health card"],
  authors: [{ name: "VitalLink AI Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable}`}>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>❤️</text></svg>" />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-vlink-paper text-vlink-ink">
        {children}
      </body>
    </html>
  );
}
