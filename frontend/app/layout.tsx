import type { Metadata } from "next";
import "./globals.css";
import PageTransition from "@/components/common/PageTransition";

export const metadata: Metadata = {
  title: "Premium Fashion & Apparel eCommerce",
  description: "Explore curated collections, modern essentials, and premium fashion apparel on our enterprise shopping platform.",
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: "Premium Fashion & Apparel eCommerce",
    description: "Explore curated collections, modern essentials, and premium fashion apparel.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground" suppressHydrationWarning>
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
