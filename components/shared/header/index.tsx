import Image from 'next/image';
import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';
import Menu from './menu';
import Search from './search';
import CategoryDrawer from './category-drawer';

const Header = () => {
    return ( 
       <header className="w-full border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14">
                    <div className="flex items-center gap-6">
                        <CategoryDrawer />
                        <Link href="/" className="flex items-center gap-2 group">
                            <Image 
                                src="/images/logo.svg" 
                                alt={`${APP_NAME} logo`} 
                                width={32} 
                                height={32} 
                                priority={true}
                                className="transition-transform group-hover:scale-105"
                            />
                            <span className="hidden lg:block font-semibold text-lg tracking-tight">
                                {APP_NAME}
                            </span>
                        </Link>
                    </div>
                    
                    <div className="hidden md:block flex-1 max-w-xl mx-8">
                        <Search/>
                    </div>

                    <div className="flex items-center gap-1">
                        <Menu/>
                    </div>
                </div>
            </div>
       </header>
    );
}
 
export default Header;