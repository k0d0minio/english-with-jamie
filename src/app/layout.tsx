import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { getRole } from "@/lib/auth";
import { Nav } from "@/components/nav";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "English with Jamie",
  description: "A shared classroom for one-to-one English lessons.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const role = await getRole();
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen">
        {role ? <Nav role={role} /> : null}
        <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
