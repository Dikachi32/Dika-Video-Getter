import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DikachiVideo AI Studio",
  description: "Personal AI Video Studio - Local First, Cloud Optional",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background">
        {children}
      </body>
    </html>
  );
}