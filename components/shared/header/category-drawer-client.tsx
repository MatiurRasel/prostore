'use client';

import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { MenuIcon } from "lucide-react";
import Link from "next/link";

interface CategoryDrawerClientProps {
    categories: Array<{ category: string; count: number }>;
}

const CategoryDrawerClient = ({ categories }: CategoryDrawerClientProps) => {
    return ( 
        <Drawer direction="left">
            <DrawerTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                    <MenuIcon className="h-4 w-4" />
                </Button>
            </DrawerTrigger>
            <DrawerContent className="h-screen w-[300px] fixed left-0 top-0 bottom-0 right-auto border-r rounded-r-lg rounded-l-none">
                <DrawerHeader className="border-b">
                    <DrawerTitle>Select a Category</DrawerTitle>
                </DrawerHeader>
                <div className="p-4 space-y-1 overflow-y-auto">
                    {categories.map((x) => (
                        <Button 
                            key={x.category} 
                            variant="ghost" 
                            className="w-full justify-start" 
                            asChild>
                            <DrawerClose asChild>
                                <Link href={`/search?category=${x.category}`}>
                                    {x.category} ({x.count})
                                </Link>
                            </DrawerClose>
                        </Button>
                    ))}
                </div>
            </DrawerContent>
        </Drawer>
     );
}
 
export default CategoryDrawerClient;