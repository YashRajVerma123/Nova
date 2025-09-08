
import type { Metadata } from "next";
import { Inter, Space_Grotesk, Dancing_Script } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import { ClientProviders } from "@/components/client-providers";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
import BackgroundAnimation from "@/components/background-animation";
import ThoughtOfTheDay from "@/components/thought-of-the-day";
import PageLoader from "@/components/page-loader";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  featureSettings: "'ss01'",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  variable: '--font-dancing-script',
  weight: '700'
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-body text-foreground antialiased",
          inter.variable,
          spaceGrotesk.variable,
          dancingScript.variable,
        )}
      >
        <ClientProviders>
          <PageLoader />
          <BackgroundAnimation />
          <div className="relative z-10 flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow pt-20">{children}</main>
            <Footer />
          </div>
          <Toaster />
          <ThoughtOfTheDay />
        </ClientProviders>
      </body>
    </html>
  );
}
