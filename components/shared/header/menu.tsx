import { Button } from "@/components/ui/button";
import ModeToggle from "./mode-toggle";
import Link from "next/link";
import { EllipsisVertical, ShoppingBag, User, Heart } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import UserButton from "./user-button";
import { MotionButton, MotionDiv } from '@/components/ui/motion';

const menuItems = [
    {
        icon: ShoppingBag,
        label: "Cart",
        href: "/cart"
    },
    {
        icon: User,
        label: "Profile",
        href: "/user/profile"
    },
];

const Menu = () => {
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
            {/* Quick Actions (icon-only, with tooltips) */}
            <ul className="flex items-center gap-2 ml-2">
                <li>
                    <div className="group relative flex items-center">
                        <Button variant="ghost" size="icon" className="relative">
                            <User className="h-5 w-5" />
                        </Button>
                        <span className="absolute left-1/2 -bottom-7 -translate-x-1/2 scale-0 group-hover:scale-100 transition bg-black text-white text-xs rounded px-2 py-1 pointer-events-none">Profile</span>
                    </div>
                </li>
                <li>
                    <div className="group relative flex items-center">
                        <Button variant="ghost" size="icon" className="relative">
                            <Heart className="h-5 w-5" />
                        </Button>
                        <span className="absolute left-1/2 -bottom-7 -translate-x-1/2 scale-0 group-hover:scale-100 transition bg-black text-white text-xs rounded px-2 py-1 pointer-events-none">Wishlist</span>
                    </div>
                </li>
                <li>
                    <div className="group relative flex items-center">
                        <Sheet>
                            <SheetTrigger asChild>
                                <MotionButton
                                    className="relative"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <ShoppingBag className="h-5 w-5" />
                                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        0
                                    </span>
                                </MotionButton>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-full sm:max-w-lg">
                                <SheetTitle className="text-lg font-semibold mb-4">Shopping Cart</SheetTitle>
                                <div className="flex flex-col h-full">
                                    <div className="flex-1 py-6">
                                        <div className="space-y-4">
                                            {/* Cart items will go here */}
                                            <p className="text-muted-foreground text-center py-8">Your cart is empty</p>
                                        </div>
                                    </div>
                                    <div className="border-t p-4">
                                        <div className="flex justify-between mb-4">
                                            <span className="font-medium">Total</span>
                                            <span className="font-semibold">$0.00</span>
                                        </div>
                                        <Button className="w-full">Checkout</Button>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                        <span className="absolute left-1/2 -bottom-7 -translate-x-1/2 scale-0 group-hover:scale-100 transition bg-black text-white text-xs rounded px-2 py-1 pointer-events-none">Cart</span>
                    </div>
                </li>
            </ul>
        </div>
    );
};

export default Menu;