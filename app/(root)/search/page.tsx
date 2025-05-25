import ProductCard from "@/components/shared/product/product-card";
import { Button } from "@/components/ui/button";
import { getAllProducts, getAllCategories } from "@/lib/actions/product.actions";
import { ChevronLeft, ChevronRight, Filter, X } from "lucide-react";
import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

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

    //construct the filter url
    const getFilterUrl = ({
        c,p,s,r,pg
    }: {
        c?: string;
        p?: string;
        s?: string;
        r?: string;
        pg?: string;
    }) => {
        const params = {q,category,price,rating,sort,page};

        if(c) params.category = c;
        if(s) params.sort = s;
        if(p) params.price = p;
        if(r) params.rating = r;
        if(pg) params.page = pg;

        return `/search?${new URLSearchParams(params).toString()}`;
        
    }
    
    const products = await getAllProducts({
        query: q,
        category,
        price,
        rating,
        sort,
        page: Number(page)
    });

    const categories = await getAllCategories();
    
    return ( 
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Filters Sidebar */}
                <div className="w-full md:w-64 space-y-6">
                    <div className="flex items-center justify-between md:hidden">
                        <h2 className="text-lg font-semibold">Filters</h2>
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filters
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[300px] sm:w-[400px] z-40">
                                <SheetHeader>
                                    <SheetTitle>Filters</SheetTitle>
                                </SheetHeader>
                                <div className="mt-6 space-y-6">
                                    {/* Category Filters */}
                                    <div>
                                        <h3 className="text-sm font-medium mb-3">Department</h3>
                                        <div className="space-y-2">
                                            <Link 
                                                href={getFilterUrl({c:'all'})}
                                                className={`block text-sm ${category === 'all' ? 'font-medium text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                            >
                                                Any
                                            </Link>
                                            {categories.map((x) => (
                                                <Link 
                                                    key={x.category}
                                                    href={getFilterUrl({c:x.category})}
                                                    className={`block text-sm ${category === x.category ? 'font-medium text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                                >
                                                    {x.category}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Price Filters */}
                                    <div>
                                        <h3 className="text-sm font-medium mb-3">Price</h3>
                                        <div className="space-y-2">
                                            <Link 
                                                href={getFilterUrl({p:'all'})}
                                                className={`block text-sm ${price === 'all' ? 'font-medium text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                            >
                                                Any
                                            </Link>
                                            {prices.map((p) => (
                                                <Link 
                                                    key={p.value}
                                                    href={getFilterUrl({p:p.value})}
                                                    className={`block text-sm ${price === p.value ? 'font-medium text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                                >
                                                    {p.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Rating Filters */}
                                    <div>
                                        <h3 className="text-sm font-medium mb-3">Customer Ratings</h3>
                                        <div className="space-y-2">
                                            <Link 
                                                href={getFilterUrl({r:'all'})}
                                                className={`block text-sm ${rating === 'all' ? 'font-medium text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                            >
                                                Any
                                            </Link>
                                            {ratings.map((r) => (
                                                <Link 
                                                    key={r}
                                                    href={getFilterUrl({r:`${r}`})}
                                                    className={`block text-sm ${rating === r.toString() ? 'font-medium text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                                >
                                                    {`${r} stars & up`}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Desktop Filters */}
                    <div className="hidden md:block space-y-6">
                        {/* Category Filters */}
                        <div>
                            <h3 className="text-sm font-medium mb-3">Department</h3>
                            <div className="space-y-2">
                                <Link 
                                    href={getFilterUrl({c:'all'})}
                                    className={`block text-sm ${category === 'all' ? 'font-medium text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    Any
                                </Link>
                                {categories.map((x) => (
                                    <Link 
                                        key={x.category}
                                        href={getFilterUrl({c:x.category})}
                                        className={`block text-sm ${category === x.category ? 'font-medium text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        {x.category}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Price Filters */}
                        <div>
                            <h3 className="text-sm font-medium mb-3">Price</h3>
                            <div className="space-y-2">
                                <Link 
                                    href={getFilterUrl({p:'all'})}
                                    className={`block text-sm ${price === 'all' ? 'font-medium text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    Any
                                </Link>
                                {prices.map((p) => (
                                    <Link 
                                        key={p.value}
                                        href={getFilterUrl({p:p.value})}
                                        className={`block text-sm ${price === p.value ? 'font-medium text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        {p.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Rating Filters */}
                        <div>
                            <h3 className="text-sm font-medium mb-3">Customer Ratings</h3>
                            <div className="space-y-2">
                                <Link 
                                    href={getFilterUrl({r:'all'})}
                                    className={`block text-sm ${rating === 'all' ? 'font-medium text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    Any
                                </Link>
                                {ratings.map((r) => (
                                    <Link 
                                        key={r}
                                        href={getFilterUrl({r:`${r}`})}
                                        className={`block text-sm ${rating === r.toString() ? 'font-medium text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        {`${r} stars & up`}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {/* Active Filters */}
                    {(q !== 'all' || category !== 'all' || price !== 'all' || rating !== 'all') && (
                        <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium">Active Filters:</span>
                                {q !== 'all' && q !== '' && (
                                    <div className="flex items-center gap-1 px-2 py-1 bg-background rounded-md text-sm">
                                        <span>Query: {q}</span>
                                        <Link href={getFilterUrl({})}>
                                            <X className="h-4 w-4" />
                                        </Link>
                                    </div>
                                )}
                                {category !== 'all' && category !== '' && (
                                    <div className="flex items-center gap-1 px-2 py-1 bg-background rounded-md text-sm">
                                        <span>Category: {category}</span>
                                        <Link href={getFilterUrl({c:'all'})}>
                                            <X className="h-4 w-4" />
                                        </Link>
                                    </div>
                                )}
                                {price !== 'all' && price !== '' && (
                                    <div className="flex items-center gap-1 px-2 py-1 bg-background rounded-md text-sm">
                                        <span>Price: {price}</span>
                                        <Link href={getFilterUrl({p:'all'})}>
                                            <X className="h-4 w-4" />
                                        </Link>
                                    </div>
                                )}
                                {rating !== 'all' && rating !== '' && (
                                    <div className="flex items-center gap-1 px-2 py-1 bg-background rounded-md text-sm">
                                        <span>Rating: {rating} stars & up</span>
                                        <Link href={getFilterUrl({r:'all'})}>
                                            <X className="h-4 w-4" />
                                        </Link>
                                    </div>
                                )}
                                <Button variant="ghost" size="sm" asChild className="ml-auto">
                                    <Link href="/search">Clear All</Link>
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Sort Options */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="text-sm text-muted-foreground">
                            {products.data.length} products found
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Sort by:</span>
                            <div className="flex items-center gap-1">
                                {sortOrders.map((s) => (
                                    <Link
                                        key={s}
                                        href={getFilterUrl({s})}
                                        className={`text-sm px-2 py-1 rounded-md ${
                                            sort === s 
                                                ? 'bg-primary text-primary-foreground' 
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        {s}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.data.length === 0 ? (
                            <div className="col-span-full text-center py-12">
                                <h3 className="text-lg font-medium">No products found</h3>
                                <p className="text-muted-foreground mt-2">
                                    Try adjusting your search or filter criteria
                                </p>
                            </div>
                        ) : (
                            products.data.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {products.totalPages > 1 && (
                        <div className="flex justify-center mt-8">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    asChild
                                    disabled={Number(page) <= 1}
                                >
                                    <Link href={getFilterUrl({pg: (Number(page) - 1).toString()})}>
                                        <ChevronLeft className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <span className="text-sm">
                                    Page {page} of {products.totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    asChild
                                    disabled={Number(page) >= products.totalPages}
                                >
                                    <Link href={getFilterUrl({pg: (Number(page) + 1).toString()})}>
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
     );
}
 
export default SearchPage;