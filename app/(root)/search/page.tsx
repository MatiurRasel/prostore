import { getAllProducts, getAllCategories } from "@/lib/actions/product.actions";
import { Product } from "@/types";
import SearchClient from "./search-client";
import { Suspense } from "react";

const prices = [
    {
        name: '$1 to $50',
        value: '1-50'
    },
    {
        name: '$51 to $100',
        value: '51-100'
    },
    {
        name: '$101 to $200',
        value: '101-200'
    },
    {
        name: '$201 to $500',
        value: '201-500'
    },
    {
        name: '$501 to $1000',
        value: '501-1000'
    },
    //{
    //    name: '$1001 and above',
    //    value: '1001-above'
    //}
];

const ratings = [
    4,3,2,1
];

const sortOrders = [
   'newest','lowest','highest','rating'
    
];

export async function generateMetadata(props: {
    searchParams: Promise<{
        q: string;
        category: string;
        price: string;
        rating: string;
    }>
}) {

    const {
        q = 'all',
        category = 'all',
        price = 'all',
        rating = 'all'
    } = await props.searchParams;

    const isQuerySet = q && q !== 'all' && q.trim() !== '';
    const isCategorySet = category && category !== 'all' && category.trim() !== '';
    const isPriceSet = price && price !== 'all' && price.trim() !== '';
    const isRatingSet = rating && rating !== 'all' && rating.trim() !== '';

    if(isQuerySet || isCategorySet || isPriceSet || isRatingSet) {
        return {
            title: `
                Search 
                ${isQuerySet ? q : ''} 
                ${isCategorySet ? `: Category ${category}` : ''} 
                ${isPriceSet ? `: Price ${price}` : ''} 
                ${isRatingSet ? `: Rating ${rating}` : ''}`
        }
    }
    else {

        return {
            title: 'Search Products',
        }
    }

    
}


const SearchPage = async(props:{
    searchParams: Promise<{
        q?: string;
        category?: string;
        price?: string;
        rating?: string;
        sort?: string;
        page?: string;
    }>
}) => {
    const {
        q='all',
        category='all',
        price='all',
        rating='all',
        sort='newest',
        page='1'
    } = await props.searchParams;

    const products = await getAllProducts({
        query: q,
        category,
        price,
        rating,
        sort,
        page: Number(page)
    });

    const categories = await getAllCategories();
    
    // Serialize the data for client component
    const serializedCategories = categories.map(cat => ({
        category: cat.category
    }));
   
    const plainProducts = JSON.parse(JSON.stringify(products.data)) as Product[];
    
    return (
        <Suspense>
            <SearchClient
                q={q}
                category={category}
                price={price}
                rating={rating}
                sort={sort}
                page={page}
                products={plainProducts}
                categories={serializedCategories}
                totalPages={products.totalPages}
                sortOrders={sortOrders}
                prices={prices}
                ratings={ratings}
            />
        </Suspense>
    );
}
 
export default SearchPage;