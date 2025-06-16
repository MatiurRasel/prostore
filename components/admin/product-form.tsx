'use client';

import { useToast } from "@/hooks/use-toast";
import { productDefaultValues } from "@/lib/constants";
import { insertProductSchema, updateProductSchema } from "@/lib/validators";
import { Product } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import slugify from'slugify';
import { Textarea } from "../ui/textarea";
import { createProduct, updateProduct } from "@/lib/actions/product.actions";
import { UploadButton } from "@/lib/uploadthing";
import { Card, CardContent } from "../ui/card";
import Image from "next/image";
import { Checkbox } from "../ui/checkbox";
import { useState } from "react";
import { Loader } from "../ui/loader";
import LoadingButton from "../ui/loading-button";

type ProductFormProps = {
  type: 'Create' | 'Update';
  product?: Product;
  productId?: string;
};


const ProductForm = ({
    type, 
    product, 
    productId
}: ProductFormProps) => {

    const router = useRouter();
    const {toast} = useToast();

    const isUpdate = type === 'Update';

    // Track removed images and banner
    const [removedImages, setRemovedImages] = useState<string[]>([]);
    const [removedBanner, setRemovedBanner] = useState<string | null>(null);

    const form = useForm<z.infer<typeof updateProductSchema | typeof insertProductSchema>>({
        resolver: zodResolver(isUpdate ? updateProductSchema : insertProductSchema),
        defaultValues: isUpdate && product ? product : productDefaultValues,
    });

    const onSubmit: SubmitHandler<z.infer<typeof updateProductSchema | typeof insertProductSchema>> = async (values) => {
        // Attach removed images/banner to values for backend deletion
        const payload = {
            ...values,
            removedImages,
            removedBanner: removedBanner || undefined,
        };
        //On Create
        if(type === 'Create'){
            const res = await createProduct(payload);

            if(!res.success){
                toast({
                    title: 'Error',
                    description: res.message,
                    variant: 'destructive',
                });
            }
            else{
                toast({
                    description: res.message,
                });
                router.push('/admin/products');
            }
        }

        //On Update
        if(type === 'Update'){
            if(!productId){
                router.push('/admin/products');
                return;
            }

            const res = await updateProduct({...payload, id: productId});

            if(!res.success){
                toast({
                    title: 'Error',
                    description: res.message,
                    variant: 'destructive',
                });
            }
            else{
                toast({
                    description: res.message,
                });
                router.push('/admin/products');
            }
        }
    };

    const images = form.watch('images');
    const isFeatured = form.watch('isFeatured');
    const banner = form.watch('banner');

    return ( 
        <Form {...form}>
        <form method="POST" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex flex-col md:flex-row gap-5">
                {/* Name */}
                <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                        <FormItem className="w-full">
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter product name" {...field}/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                {/* Slug */}
                <FormField
                    control={form.control}
                    name='slug'
                    render={({ field }) => (
                        <FormItem className="w-full">
                            <FormLabel>Slug</FormLabel>
                            <FormControl>
                                <div className="relative">
                                <Input placeholder="Enter slug" {...field}/>
                                <Button type='button' className='bg-gray-500
                                 text-white px-4 py-1 mt-2'
                                 onClick={() => {
                                    form.setValue('slug',
                                        slugify(form.getValues('name'),{lower: true})
                                    );
                                 }}>
                                    Generate
                                </Button>
                                </div>
                                
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
            </div>

             <div className="flex flex-col md:flex-row gap-5">
                {/* Category */}
                <FormField
                    control={form.control}
                    name='category'
                    render={({ field }) => (
                        <FormItem className="w-full">
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter category" {...field}/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                {/* Brand */}
                <FormField
                    control={form.control}
                    name='brand'
                    render={({ field }) => (
                        <FormItem className="w-full">
                            <FormLabel>Brand</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter brand" {...field}/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
            </div>

             <div className="flex flex-col md:flex-row gap-5">
                {/* Price */}
                 <FormField
                    control={form.control}
                    name='price'
                    render={({ field }) => (
                        <FormItem className="w-full">
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter product price" {...field}/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
                {/* Stock */}
                 <FormField
                    control={form.control}
                    name='stock'
                    render={({ field }) => (
                        <FormItem className="w-full">
                            <FormLabel>Stock</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter stock" {...field}/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
            </div>

             <div className="upload-field flex flex-col md:flex-row gap-5">
                {/* Images */}
                <FormField
                    control={form.control}
                    name='images'
                    render={() => (
                        <FormItem className="w-full">
                            <FormLabel>Images</FormLabel>
                            <Card>
                                <CardContent className="space-y-2 mt-2 min-h-48">
                                    <div className="flex-start space-x-2">
                                        {images.map((image: string, idx: number) => (
                                            <div key={image} className="relative w-20 h-20">
                                                <Image
                                                    src={image}
                                                    alt="Product Image"
                                                    className="w-20 h-20 rounded-sm object-cover object-center"
                                                    width={100}
                                                    height={100}
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                                    onClick={() => {
                                                        const newImages = [...images];
                                                        newImages.splice(idx, 1);
                                                        form.setValue('images', newImages);
                                                        setRemovedImages((prev) => [...prev, image]);
                                                    }}
                                                    aria-label="Remove image"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                        <FormControl>
                                            <UploadButton
                                            endpoint="imageUploader"
                                            onClientUploadComplete={(res : {url: string}[]) => {
                                                form.setValue('images', [...images, res[0].url]);
                                            }}
                                            onUploadError={(error: Error) => {
                                                toast({
                                                    title: 'Error',
                                                    description: `ERROR! ${error.message} `,
                                                    variant: 'destructive',
                                                });
                                            }}
                                            />
                                        </FormControl>
                                    </div>

                                </CardContent>
                            </Card>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
            </div>
             <div className="upload-field">
                {/* Is Featured */}
                Featured Product
                <Card>
                    <CardContent className="space-y-2 mt-2">
                        <FormField
                            control={form.control}
                            name='isFeatured'
                            render={({ field }) => (
                                <FormItem className="space-x-2 items-center">
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange}/>
                                    </FormControl>
                                    <FormLabel>Is Featured?</FormLabel>
                                </FormItem>
                            )}
                        />
                        {isFeatured && banner && (
                            <div className="relative w-full">
                                <Image
                                    src={banner}
                                    alt="banner image"
                                    className="w-full object-cover object-center rounded-sm"
                                    width={1920}
                                    height={680}
                                />
                                <button
                                    type="button"
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg"
                                    onClick={() => {
                                        setRemovedBanner(banner);
                                        form.setValue('banner', '');
                                    }}
                                    aria-label="Remove banner"
                                >
                                    ×
                                </button>
                            </div>
                        )}
                        {isFeatured && !banner && (
                            <UploadButton
                            endpoint="imageUploader"
                            onClientUploadComplete={(res : {url: string}[]) => {
                                form.setValue('banner', res[0].url);
                            }}
                            onUploadError={(error: Error) => {
                                toast({
                                    title: 'Error',
                                    description: `ERROR! ${error.message} `,
                                    variant: 'destructive',
                                });
                            }}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
            <div>
                {/* Description */}
                 <FormField
                    control={form.control}
                    name='description'
                    render={({ field }) => (
                        <FormItem className="w-full">
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Enter product description"
                                className="resize-none" {...field}/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />
            </div>
            <div>
                {/* Submit */}
                <LoadingButton
                    type="submit"
                    size="lg"
                    isLoading={form.formState.isSubmitting}
                    loadingText="Submitting..."
                    className="button col-span-2 w-full"
                >
                    {`${type} Product`}
                </LoadingButton>
            </div>
        </form>
    
    </Form>
    );
}
 
export default ProductForm;