import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import "./globals.css";
const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--display" });
const body = Figtree({ subsets: ["latin"], variable: "--body" });
export const metadata: Metadata = { title: "Wanderboard", description: "Compare places and get a day-by-day trip plan." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={`${display.variable} ${body.variable}`}><body>{children}</body></html>;
}
