import { Loader2 } from "lucide-react";
import Image from "next/image";

const MainLoading = () => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
        <div className="flex flex-col items-center gap-4">
          {/* Logo */}
          <div className="relative w-32 h-32">
            <Image
              src="/images/logo.png"
              alt="Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          
          {/* Spinner */}
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-lg font-medium">Loading...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLoading;