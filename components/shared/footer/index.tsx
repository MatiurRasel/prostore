import { APP_NAME } from "@/lib/constants";

const Footer = () => {
    const currentYear = new Date().getFullYear();
    return ( 
        <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-8 fixed bottom-0 left-0">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full">
                <div className="flex items-center justify-center h-full">
                    <span className="text-[10px] text-muted-foreground">
                        {currentYear} {APP_NAME}. All Rights Reserved © Matiur Rasel
                    </span>
                </div>
            </div>
        </footer>
     );
}

export default Footer; 