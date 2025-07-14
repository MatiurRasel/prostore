
import Footer from "@/components/shared/footer";
import Header from "@/components/shared/header";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
    
        <div className="flex flex-col h-screen">
            <Header></Header>
            <main className="flex-1 wrapper">{children}</main>
            <Footer></Footer>
        </div>
        
    );
  }
  