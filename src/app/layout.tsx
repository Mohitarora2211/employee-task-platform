import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Employee Task Hub",
  description: "Real-time productivity tracking & team management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-[#070b14] text-gray-100 antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}