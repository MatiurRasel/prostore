import { Button } from "@/components/ui/button";
import ModeToggle from "./mode-toggle";
import Link from "next/link";
import { EllipsisVertical, ShoppingBag, User, ClipboardList } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import UserButton from "./user-button";
import { MotionDiv } from '@/components/ui/motion';
//import { auth } from "@/auth";

const menuItems = [
    {
        icon: User,
        label: "Profile",
        href: "/user/profile"
    },
    {
        icon: ClipboardList,
        label: "Orders",
        href: "/user/orders"
    },
    {
        icon: ShoppingBag,
        label: "Cart",
        href: "/cart"
    },
];

const Menu = async () => {
    //const session = await auth();
    return (
        <div className="flex items-center gap-2">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
                <ModeToggle />
                {menuItems.map((item, index) => (
                    <MotionDiv
                        key={item.href}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                        <Button
                            asChild
                            variant='ghost'
                            className="h-9 px-3 hover:bg-primary/10 transition-colors duration-200 flex items-center gap-2"
                        >
                            <Link href={item.href} className="flex items-center gap-2 group">
                                <item.icon className="h-5 w-5" />
                                <span className="hidden sm:inline-block">{item.label}</span>
                            </Link>
                        </Button>
                    </MotionDiv>
                ))}
                <UserButton />
            </nav>
            {/* Mobile Navigation */}
            <nav className="md:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 hover:bg-primary/10 transition-colors duration-200"
                        >
                            <EllipsisVertical className="h-4 w-4" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="flex flex-col items-start overflow-y-auto max-h-screen pt-8 pb-6 px-6 w-full sm:w-96">
                        <SheetTitle className="mb-6 text-lg font-semibold">Menu</SheetTitle>
                        <div className="flex flex-col gap-3 w-full">
                            <ModeToggle />
                            {menuItems.map((item, index) => (
                                <MotionDiv
                                    key={item.href}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    className="w-full"
                                >
                                    <Button
                                        asChild
                                        variant='ghost'
                                        className="justify-start w-full p-2 text-base hover:bg-primary/10 transition-colors duration-200 flex items-center gap-2"
                                    >
                                        <Link href={item.href} className="flex items-center gap-3 w-full">
                                            <item.icon size={20} /> {item.label}
                                        </Link>
                                    </Button>
                                </MotionDiv>
                            ))}
                            <UserButton />
                        </div>
                    </SheetContent>
                </Sheet>
            </nav>

        </div>
    );
};

export default Menu;