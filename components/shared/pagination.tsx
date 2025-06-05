'use client';
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import { formUrlQuery } from "@/lib/utils";
import { useTransition } from "react";
import { Loader } from "@/components/ui/loader";

type PaginationProps = {
    page: number | string;
    totalPages: number;
    urlParamName?: string;
}

const Pagination = ({page, totalPages, urlParamName}: PaginationProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const handleClick = (btnType: string) => {
        startTransition(() => {
            const pageValue = btnType === 'next' ? Number(page) + 1 : Number(page) - 1; 

            const newUrl = formUrlQuery({
                params: searchParams.toString(),
                key: urlParamName || 'page',
                value: pageValue.toString(),
            });

            router.push(newUrl);
        });
    }
    return ( 
        <div className="flex gap-2">
            <Button 
                size='lg' 
                variant='outline' 
                className="w-28"
                disabled={Number(page) <= 1 || isPending}
                onClick={() => handleClick('prev')}>
                {isPending ? (
                    <Loader size="sm" className="text-primary" />
                ) : null}
                Previous
            </Button>

            <Button 
                size='lg' 
                variant='outline' 
                className="w-28"
                disabled={Number(page) >= totalPages || isPending}
                onClick={() => handleClick('next')}>
                {isPending ? (
                    <Loader size="sm" className="text-primary" />
                ) : null}
                Next
            </Button>
        </div>
     );
}
 
export default Pagination;