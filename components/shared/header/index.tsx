import Image from 'next/image';
import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';
import Menu from './menu';
import Search from './search';
import CategoryDrawer from './category-drawer';
import { MotionHeader } from '@/components/ui/motion';
import { Search as SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Header = () => {
    return ( 
       <MotionHeader 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="w-full border-b fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14">
                    <div className="flex items-center gap-4 sm:gap-6">
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
                            <span className="hidden sm:block font-semibold text-lg tracking-tight">
                                {APP_NAME}
                            </span>
                        </Link>
                    </div>
                    
                    <div className="hidden md:block flex-1 max-w-xl mx-8">
                        <Search/>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Mobile Search */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="md:hidden"
                                >
                                    <SearchIcon className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="top" className="h-[200px]">
                                <div className="pt-6">
                                    <Search />
                                </div>
                            </SheetContent>
                        </Sheet>
                        <Menu/>
                    </div>
                </div>
            </div>
       </MotionHeader>
    );
}
 
export default Header;