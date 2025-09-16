import type { Metadata } from "next";
import { Inter, Space_Grotesk, Dancing_Script } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import { ClientProviders } from "@/components/client-providers";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
import BackgroundAnimation from "@/components/background-animation";
import PageLoader from "@/components/page-loader";
import SplashLoader from "@/components/splash-loader";
import { Suspense } from "react";

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
  title: "Lunex - Cutting through the noise",
  description: "Your essential destination for making sense of today. We provide current affairs news for the modern reader.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2103302400076966"
     crossorigin="anonymous"></script>
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-body text-foreground antialiased",
          inter.variable,
          spaceGrotesk.variable,
          dancingScript.variable,
        )}
      >
        <ClientProviders>
          <SplashLoader />
          <Suspense fallback={null}>
            <PageLoader />
          </Suspense>
          <BackgroundAnimation />
          <div className="relative z-10 flex flex-col min-h-screen animate-fade-in-up">
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
