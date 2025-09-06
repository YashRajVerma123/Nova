import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import { ClientProviders } from "@/components/client-providers";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  featureSettings: "'ss01'",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});


export const metadata: Metadata = {
  title: "Nova - Cutting through the noise",
  description: "Your essential destination for making sense of today. We provide current affairs news for the modern reader.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          "min-h-screen bg-background font-body text-foreground antialiased",
          inter.variable,
          spaceGrotesk.variable,
        )}
      >
        <ClientProviders>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow pt-20">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </ClientProviders>
      </body>
    </html>
  );
}
