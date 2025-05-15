import { Button } from "@/components/ui/button";
import ModeToggle from "./mode-toggle";
import Link from "next/link";
import { EllipsisVertical, ShoppingCartIcon, UserIcon, PackageIcon } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import UserButton from "./user-button";

const Menu = () => {
    return ( 
        <div className="flex justify-end gap-3">
            <nav className="hidden md:flex w-full max-w-xs gap-1">
                <ModeToggle/>
                <Button asChild variant='ghost'>
                    <Link href="/cart">
                        <ShoppingCartIcon /> Cart 
                    </Link>
                </Button>
                <UserButton/>
            </nav>
            <nav className="md:hidden">
                <Sheet>
                    <SheetTrigger className="align-middle p-2">
                        <EllipsisVertical/>
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
                            {Array.from({ length: 10 }).map((_, i) => (
                                <Button key={i} asChild variant='ghost' className="justify-start w-full p-2 text-base">
                                    <Link href={`/item-${i+1}`} className="flex items-center gap-3 w-full">
                                        {/* Placeholder Icon (optional) */} Item {i + 1}
                                    </Link>
                                </Button>
                            ))}
                        </div>
                    </SheetContent>
                </Sheet>
            </nav>
        </div>
     );
}
 
export default Menu;