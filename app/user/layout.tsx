import Menu from "@/components/shared/header/menu";
import { APP_NAME } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import MainNav from "./main-nav";
import Footer from "@/components/shared/footer";

export default function UserLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
        <div className="flex flex-col min-h-screen">
            <header className="w-full border-b fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-14">
                        <div className="flex items-center gap-6">
                            <Link href="/" className="flex items-center gap-2 group">
                                <Image
                                    src="/images/logo.svg"
                                    alt={APP_NAME}
                                    width={32}
                                    height={32}
                                    className="transition-transform group-hover:scale-105"
                                />
                                
                            </Link>
                            <MainNav className="hidden md:flex items-center gap-6" />
                        </div>

                        <div className="flex items-center gap-1">
                            <Menu/>
                        </div>
                    </div>
                </div>
            </header>
            <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-32">
                {children}
            </main>
            <Footer />
        </div>
    );
}
  