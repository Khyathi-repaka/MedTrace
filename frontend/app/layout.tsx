import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MedTrace AI — Every record. One health story.",
  description: "AI-powered medical record organization, search and health-history intelligence.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
