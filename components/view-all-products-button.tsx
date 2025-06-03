'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MotionDiv } from "@/components/ui/motion";
import { ArrowRight } from "lucide-react";

const ViewAllProductsButton = () => {
    return ( 
        <MotionDiv 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mt-8"
        >
            <Button 
                asChild 
                size="lg"
                className="rounded-full hover:scale-105 transition-transform"
            >
                <Link href="/search" className="flex items-center gap-2">
                    View All Products
                    <ArrowRight className="w-5 h-5" />
                </Link>
            </Button>
        </MotionDiv>
     );
}
 
export default ViewAllProductsButton;