import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/providers/AppProviders";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "File Manager",
  description: "Gerenciador de arquivos moderno",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
        <AppProviders attribute="class" defaultTheme="system" enableSystem>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}