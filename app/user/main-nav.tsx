'use client';

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
    {
        title: "Profile",
        href: "/user/profile",
    },
    {
        title: "Orders",
        href: "/user/orders",
    },
    
];

const MainNav = ({
    className,  
    ...props
}: React.HTMLAttributes<HTMLElement>) => {
    const pathName = usePathname();
    return ( 
        <nav className={cn("", className)} {...props}>
            {links.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        'text-sm font-medium transition-colors',
                        pathName === item.href 
                            ? 'text-foreground' 
                            : 'text-muted-foreground hover:text-foreground'
                    )}
                >
                    {item.title}
                </Link>
            ))}
        </nav>
     );
}
 
export default MainNav;