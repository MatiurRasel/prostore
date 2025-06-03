import ProductForm from "@/components/admin/product-form";
import { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
    title: 'Create Product',
}

const CreateProductPage = () => {
    return ( 
        <div className="space-y-4 px-2 sm:px-4 md:px-6 lg:px-8">
            <div className="flex items-center justify-between">
                <h2 className="h2-bold">Create Product</h2>
                <Button asChild variant="outline" size="sm" className="gap-1">
                    <Link href="/admin/products">
                        <ArrowLeft className="w-4 h-4" /> Back to Products
                    </Link>
                </Button>
            </div>
            <Card className="p-4 md:p-6">
                <ProductForm type='Create'/>
            </Card>
        </div>
    );
}
 
export default CreateProductPage;