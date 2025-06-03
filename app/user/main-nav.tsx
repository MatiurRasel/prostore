'use client';

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
//import { User, ClipboardList } from "lucide-react";

const links: { title: string; href: string; icon: React.ElementType }[] = [
    
    //{
    //    title: "Profile",
    //    href: "/user/profile",
    //    icon: User,
    //},
    //{
    //    title: "Orders",
    //    href: "/user/orders",
    //    icon: ClipboardList,
    //},
];

const MainNav = ({
    className,  
    ...props
}: React.HTMLAttributes<HTMLElement>) => {
    const pathName = usePathname();
    return ( 
        <nav className={cn("", className)} {...props}>
            {links && links.map((item: {href: string, title: string, icon: React.ElementType}) => (
                <Link
                    key={item.href}         
                    href={item.href}
                    className={cn(
                        'text-sm font-medium transition-colors flex items-center gap-1',
                        pathName === item.href 
                            ? 'text-foreground' 
                            : 'text-muted-foreground hover:text-foreground'
                    )}
                >
                    <item.icon className="h-4 w-4 mr-1" />
                    {item.title}
                </Link>
            ))}
        </nav>
     );
}
 
export default MainNav;

