import type { Metadata } from "next";
import { Inter, Russo_One } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const russo = Russo_One({
  variable: "--font-russo",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tampico Hybrid Fest 2026",
  description:
    "Competencia hibrida por parejas en Tampico. Inscribe a tu equipo en las divisiones Community y Open.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-MX"
      className={`${inter.variable} ${russo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
