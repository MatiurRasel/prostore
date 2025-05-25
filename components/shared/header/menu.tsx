import { Button } from "@/components/ui/button";
import ModeToggle from "./mode-toggle";
import Link from "next/link";
import { EllipsisVertical, ShoppingCartIcon, UserIcon, PackageIcon } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import UserButton from "./user-button";

const Menu = () => {
    return ( 
        <div className="flex items-center gap-2">
            <nav className="hidden md:flex items-center gap-1">
                <ModeToggle/>
                <Button asChild variant='ghost' className="h-9 px-3">
                    <Link href="/cart" className="flex items-center gap-2">
                        <ShoppingCartIcon className="h-4 w-4" /> 
                        <span className="hidden sm:inline-block">Cart</span>
                    </Link>
                </Button>
                <UserButton/>
            </nav>
            <nav className="md:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                            <EllipsisVertical className="h-4 w-4"/>
                        </Button>
                    </SheetTrigger>
                    <SheetContent 
                        className="flex flex-col items-start overflow-y-auto max-h-screen pt-8 pb-6 px-6 w-full sm:w-96"
                    >
                        <SheetTitle className="mb-6 text-lg font-semibold">Menu</SheetTitle>
                        
                        <div className="flex flex-col gap-3 w-full">
                            <ModeToggle/>
                            <Button asChild variant='ghost' className="justify-start w-full p-2 text-base">
                                <Link href='/cart' className="flex items-center gap-3 w-full">
                                    <ShoppingCartIcon size={20}/> Cart
                                </Link>
                            </Button>
                            <UserButton/>
                            
                            <Button asChild variant='ghost' className="justify-start w-full p-2 text-base">
                                <Link href='/profile' className="flex items-center gap-3 w-full">
                                    <UserIcon size={20}/> Profile 
                                </Link>
                            </Button>
                            <Button asChild variant='ghost' className="justify-start w-full p-2 text-base">
                                <Link href='/orders' className="flex items-center gap-3 w-full">
                                    <PackageIcon size={20}/> Orders
                                </Link>
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </nav>
        </div>
     );
}
 
export default Menu;