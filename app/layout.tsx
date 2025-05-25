import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/assets/styles/globals.css";
import { APP_DESCRIPTION, APP_NAME, SERVER_URL } from "@/lib/constants";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import Footer from "@/components/shared/footer";

const inter = Inter({subsets:["latin"]});

export const metadata: Metadata = {
  title: {
    template: `%s | Pro Store`,
    default: APP_NAME,
  },
  description: APP_DESCRIPTION,
  metadataBase: new URL(SERVER_URL),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`}>
        <ThemeProvider
          attribute='class'
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <main className="flex-1 pb-8">
            {children}
          </main>
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
