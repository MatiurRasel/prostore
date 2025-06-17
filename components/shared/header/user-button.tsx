import Link from "next/link";
import { signOutUser } from "@/lib/actions/user.actions";
import { Button } from "@/components/ui/button";
import { 
    DropdownMenu ,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {  UserIcon } from "lucide-react";
import Image from 'next/image';
import { auth } from "@/auth";


const UserButton = async () => {
    const session = await auth();
    if(!session) {
        return ( 
            <Button asChild>
                <Link href="/sign-in">
                    <UserIcon /> Sign In 
                </Link>
            </Button>
         );
    }

    const firstInitial = session.user?.name?.charAt(0).toUpperCase() ?? 'U';
    return (
        <div className="flex gap-2 items-center">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className="flex items-center">
                        <Button variant='ghost' className="relative w-8 h-8 rounded-full ml-2 flex items-center justify-center bg-gray-200 p-0 overflow-hidden">
                          {session.user?.image ? (
                            <Image
                              src={session.user.image}
                              alt={session.user.name || 'User'}
                              fill
                              className="object-cover rounded-full"
                            />
                          ) : (
                            <span className="text-lg font-bold text-gray-700">{firstInitial}</span>
                          )}
                        </Button>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <div className="text-sm font-medium loading-none">
                                {session.user?.name}
                            </div>
                            <div className="text-sm font-muted-foreground loading-none">
                                {session.user?.email}
                            </div>
                        </div>

                    </DropdownMenuLabel>
                    <DropdownMenuItem>
                        <Link href={`/user/profile`}  className='w-full'>
                            User Profile
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Link href={`/user/orders`}  className='w-full'>
                            Order History
                        </Link>
                    </DropdownMenuItem>

                    {session?.user?.role === 'admin' && (
                    <DropdownMenuItem>
                        <Link href={`/admin/overview`}  className='w-full'>
                            Admin
                        </Link>
                    </DropdownMenuItem>
                    )}

                    <DropdownMenuItem className="p-0 mb-1">
                        <form action={signOutUser} className="w-full">
                            <Button className="w-full py-4 px-2 h-4 justify-start" variant='ghost'>
                                Sign Out
                            </Button>
                        </form>
                    </DropdownMenuItem>
                 </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
  
}
 
export default UserButton;