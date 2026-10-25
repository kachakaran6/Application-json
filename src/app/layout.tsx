import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Samyukt Registry Studio | Apps & Websites CRUD",
  description: "Next.js dynamic CRUD interface for app.json registry with live updates, schema validation, and security.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
