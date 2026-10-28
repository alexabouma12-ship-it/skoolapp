import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// SF Pro est utilisé sur Apple via system-ui ; Inter le remplace ailleurs (Android, Windows).
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Skoolapp", template: "%s · Skoolapp" },
  description: "Suivi des élèves pour l'éducateur",
  appleWebApp: { capable: true, title: "Skoolapp", statusBarStyle: "black" },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
