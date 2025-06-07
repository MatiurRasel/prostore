import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/assets/styles/globals.css";
import { APP_DESCRIPTION, APP_NAME, SERVER_URL } from "@/lib/constants";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import Footer from "@/components/shared/footer";
import { LoadingProvider } from "@/lib/context/loading-context";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: `%s | Pro Store`,
    default: APP_NAME,
  },
  description: APP_DESCRIPTION,
  metadataBase: new URL(SERVER_URL),
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className={`${inter.className} antialiased min-h-screen flex flex-col bg-background text-foreground`}>
        <ThemeProvider
          attribute='class'
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense>
            <LoadingProvider>
              <div className="flex flex-col min-h-screen w-full max-w-[100vw] overflow-x-hidden">
                <main className="flex-1 pt-14 pb-32 px-4 sm:px-6 lg:px-8 mx-auto w-full max-w-7xl">
                  {children}
                </main>
                <Footer />
              </div>
              <Toaster />
            </LoadingProvider>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
