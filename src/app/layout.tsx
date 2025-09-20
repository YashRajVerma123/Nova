
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
import { Suspense } from "react";
import SplashScreen from "@/components/splash-screen";
import Script from "next/script";

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
    default: "Glare",
    template: "%s | Glare",
  },
  description: "Your essential destination for making sense of today. We provide current affairs news for the modern reader.",
  manifest: "/manifest.json",
};

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png"></link>
        <meta name="theme-color" content="#7c3aed" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2103302400076966"
     crossOrigin="anonymous"></script>
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-body text-foreground antialiased",
          raleway.variable,
          spaceGrotesk.variable,
          dancingScript.variable
        )}
      >
        {gaMeasurementId && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaMeasurementId}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
        <ClientProviders>
          <SplashScreen />
          <Suspense fallback={null}>
            <PageLoader />
          </Suspense>
          <BackgroundAnimation />
          <div className="relative z-10 flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow pt-20">{children}</main>
            <Footer />
          </div>
          <Toaster />
          <div id="post-actions-container"></div>
        </ClientProviders>
      </body>
    </html>
  );
}
