import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fusion-Baukasten",
  description: "AI-powered civic participation planning",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
