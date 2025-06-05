"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import LayoutLoading from "@/app/layout-loading";

type LoadingContextType = {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
};

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {},
});

export const useLoading = () => useContext(LoadingContext);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const startLoading = useCallback(() => setIsLoading(true), []);
  const stopLoading = useCallback(() => setIsLoading(false), []);

  // Show loading state during route changes
  useEffect(() => {
    startLoading();
    const timeout = setTimeout(() => stopLoading(), 500); // Minimum loading time
    return () => clearTimeout(timeout);
  }, [pathname, searchParams, startLoading, stopLoading]);

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
      {isLoading && <LayoutLoading />}
    </LoadingContext.Provider>
  );
} 