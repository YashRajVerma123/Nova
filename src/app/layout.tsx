
import type { Metadata } from "next";
import { Inter, Space_Grotesk, Dancing_Script, Source_Serif_4, Raleway } from "next/font/google";
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

const sourceSerif = Source_Serif_4({ 
  subsets: ["latin"], 
  variable: "--font-source-serif",
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

const raleway = Raleway({
  subsets: ['latin'],
  variable: '--font-raleway',
});


export const metadata: Metadata = {
  title: {
    default: "Glare - Clarity in a Complex World",
    template: "%s | Glare",
  },
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
     crossOrigin="anonymous"></script>
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-body text-foreground antialiased",
          sourceSerif.variable,
          spaceGrotesk.variable,
          dancingScript.variable,
          raleway.variable
        )}
      >
        <ClientProviders>
          <SplashLoader />
          <Suspense fallback={null}>
            <PageLoader />
          </Suspense>
          <BackgroundAnimation />
          <div className="relative z-10 flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow pt-20 animate-fade-in-up">{children}</main>
            <Footer />
          </div>
          <Toaster />
          <div id="post-actions-container"></div>
        </ClientProviders>
      </body>
    </html>
  );
}
